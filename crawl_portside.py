#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Portside analysis CSV writer.

The crawler/parser body can be added later. This script fixes the CSV output
contract for Google Sheets imports: UTF-8 with BOM and file names matching
sheet names.
"""

from __future__ import annotations

import argparse
import csv
import html
import re
import sys
from pathlib import Path
from urllib.parse import urljoin


CSV_ENCODING = "utf-8-sig"
DEFAULT_OUTPUT_DIR = Path("data") / "portside"
DEFAULT_BASE_URL = "https://portside-t.com/iso/"
INPUT_ENCODINGS = ("cp932", "shift_jis", "utf-8-sig", "utf-8")
SHIBUDAI_PATTERN = re.compile(r"シブダイ|フエダイ")
ISO_REPO_PATTERN = re.compile(r"""href\s*=\s*["']?([^"'\s>]*iso_repo\d+\.htm)["']?""", re.IGNORECASE)
REPO_ID_PATTERN = re.compile(r"iso_repo(\d+)\.htm", re.IGNORECASE)
TR_PATTERN = re.compile(r"<tr\b[^>]*>.*?</tr>", re.IGNORECASE | re.DOTALL)
TD_PATTERN = re.compile(r"<td\b[^>]*>(.*?)</td>", re.IGNORECASE | re.DOTALL)
TAG_PATTERN = re.compile(r"<[^>]+>")
YEAR_PATTERN = re.compile(r"(20\d{2}|19\d{2})")
DATE_PATTERN = re.compile(r"(?:(20\d{2}|19\d{2})年)?\s*(\d{1,2})月\s*(\d{1,2})日")

CSV_SCHEMAS = {
    "report_index": [
        "year",
        "date_raw",
        "date",
        "list_location",
        "list_fish_text",
        "report_url",
        "repo_id",
    ],
    "report_details": [
        "repo_id",
        "report_url",
        "title",
        "detail_text",
        "detected_points",
        "detected_methods",
        "detected_conditions",
        "evidence_text",
        "fetch_status",
        "error_message",
    ],
    "catch_records": [
        "date",
        "year",
        "month",
        "repo_id",
        "report_url",
        "list_location",
        "detected_point",
        "fish_raw",
        "fish_normalized",
        "size_cm",
        "weight_kg",
        "method",
        "is_night_fishing",
        "evidence_text",
        "confidence",
    ],
    "shibudai_candidates": [
        "date",
        "year",
        "month",
        "repo_id",
        "report_url",
        "list_location",
        "detected_point",
        "fish_raw",
        "fish_normalized",
        "size_cm",
        "weight_kg",
        "method",
        "is_night_fishing",
        "evidence_text",
        "confidence",
    ],
    "point_month_summary": [
        "point",
        "month",
        "fish_normalized",
        "count",
        "report_urls",
    ],
    "point_aliases": [
        "spot_id",
        "app_spot_name",
        "alias",
        "confidence",
        "memo",
    ],
    "failed_urls": [
        "url",
        "source",
        "repo_id",
        "fetch_status",
        "error_message",
        "last_attempt_at",
    ],
}

DEFAULT_POINT_ALIASES = [
    {"spot_id": "62_takanba", "app_spot_name": "高ん場", "alias": "高ん場", "confidence": "high", "memo": "アプリ釣り場名と同一"},
    {"spot_id": "74_motone", "app_spot_name": "元根", "alias": "元根", "confidence": "high", "memo": "アプリ釣り場名と同一"},
    {"spot_id": "75_kagurane", "app_spot_name": "カグラ根", "alias": "カグラ根", "confidence": "high", "memo": "アプリ釣り場名と同一"},
    {"spot_id": "75_kagurane", "app_spot_name": "カグラ根", "alias": "神楽根", "confidence": "high", "memo": "本文表記ゆれ"},
    {"spot_id": "76_ongoku", "app_spot_name": "遠国", "alias": "遠国", "confidence": "high", "memo": "アプリ釣り場名と同一"},
    {"spot_id": "76_ongoku", "app_spot_name": "遠国", "alias": "田牛周辺", "confidence": "low", "memo": "広域表記のため断定しない"},
]


def csv_path(output_dir: Path, sheet_name: str) -> Path:
    return output_dir / f"{sheet_name}.csv"


def write_csv(path: Path, fieldnames: list[str], rows: list[dict[str, object]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding=CSV_ENCODING, newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def write_outputs(output_dir: Path, outputs: dict[str, list[dict[str, object]]]) -> list[Path]:
    written_paths = []
    for sheet_name, fieldnames in CSV_SCHEMAS.items():
        rows = outputs.get(sheet_name, [])
        path = csv_path(output_dir, sheet_name)
        write_csv(path, fieldnames, rows)
        written_paths.append(path)
    return written_paths


def read_html(path: Path) -> tuple[str, str]:
    data = path.read_bytes()
    errors = []
    for encoding in INPUT_ENCODINGS:
        try:
            return data.decode(encoding), encoding
        except UnicodeDecodeError as error:
            errors.append(f"{encoding}: {error}")
    raise UnicodeDecodeError("html", data, 0, 1, "; ".join(errors))


def clean_text(value: str) -> str:
    value = re.sub(r"(?i)<br\s*/?>", " ", value)
    value = TAG_PATTERN.sub("", value)
    value = html.unescape(value)
    value = value.replace("\u3000", " ")
    return re.sub(r"\s+", " ", value).strip()


def extract_td_texts(row_html: str) -> list[str]:
    return [clean_text(cell) for cell in TD_PATTERN.findall(row_html)]


def row_year(row_text: str) -> str:
    text = row_text.strip()
    match = YEAR_PATTERN.fullmatch(text)
    return match.group(1) if match else ""


def normalize_date(date_raw: str, current_year: str) -> str:
    match = DATE_PATTERN.search(date_raw)
    if not match:
        return ""
    year = match.group(1) or current_year
    if not year:
        return ""
    month = int(match.group(2))
    day = int(match.group(3))
    return f"{year}-{month:02d}-{day:02d}"


def extract_location(row_html: str, location_fallback: str) -> str:
    match = re.search(r"<a\b[^>]*>\s*(.*?)\s*</a>", row_html, re.IGNORECASE | re.DOTALL)
    if match:
        text = clean_text(match.group(1))
        if text:
            return text
    return location_fallback


def print_empty_reason(input_path: Path, reason: str) -> None:
    print(f"Input: {input_path}")
    print("report_index rows: 0")
    print(f"EMPTY_REASON: {reason}", file=sys.stderr)


def extract_report_index(
    input_path: Path,
    mode: str,
    base_url: str = DEFAULT_BASE_URL,
) -> tuple[list[dict[str, object]], list[str]]:
    if not input_path.exists():
        reason = f"input file not found: {input_path}"
        print_empty_reason(input_path, reason)
        return [], [reason]

    text, encoding = read_html(input_path)
    rows = TR_PATTERN.findall(text)
    if not rows:
        reason = f"no <tr> rows found; encoding={encoding}"
        print(f"Input encoding: {encoding}")
        print_empty_reason(input_path, reason)
        return [], [reason]

    records = []
    seen_repo_ids = set()
    current_year = ""
    iso_link_count = 0
    filtered_count = 0
    malformed_count = 0

    for row_html in rows:
        cells = extract_td_texts(row_html)
        if len(cells) == 1:
            year = row_year(cells[0])
            if year:
                current_year = year
                continue

        year_candidates = [row_year(cell) for cell in cells]
        if any(year_candidates) and not ISO_REPO_PATTERN.search(row_html):
            current_year = next(year for year in year_candidates if year)
            continue

        links = ISO_REPO_PATTERN.findall(row_html)
        if not links:
            continue
        iso_link_count += len(links)

        if len(cells) < 3:
            malformed_count += 1
            continue

        date_raw = cells[0]
        location_text = extract_location(row_html, cells[1])
        fish_text = cells[2]

        if mode == "shibudai" and not SHIBUDAI_PATTERN.search(fish_text):
            filtered_count += len(links)
            continue

        for href in links:
            report_url = urljoin(base_url, href)
            repo_match = REPO_ID_PATTERN.search(report_url)
            repo_id = f"iso_repo{repo_match.group(1)}" if repo_match else Path(href).stem
            if repo_id in seen_repo_ids:
                continue
            seen_repo_ids.add(repo_id)
            records.append(
                {
                    "year": current_year,
                    "date_raw": date_raw,
                    "date": normalize_date(date_raw, current_year),
                    "list_location": location_text,
                    "list_fish_text": fish_text,
                    "report_url": report_url,
                    "repo_id": repo_id,
                }
            )

    reasons = []
    if not records:
        if iso_link_count == 0:
            reasons.append("no iso_repo*.htm links found")
        if mode == "shibudai" and filtered_count > 0:
            reasons.append(f"mode=shibudai filtered out all {filtered_count} linked rows because fish text did not include シブダイ or フエダイ")
        if malformed_count > 0:
            reasons.append(f"{malformed_count} linked rows had fewer than 3 table cells")
        if not reasons:
            reasons.append("no records extracted; check HTML table structure")

    print(f"Input: {input_path}")
    print(f"Input encoding: {encoding}")
    print(f"iso_repo links found: {iso_link_count}")
    print(f"mode filtered links: {filtered_count}")
    print(f"report_index rows: {len(records)}")
    for reason in reasons:
        print(f"EMPTY_REASON: {reason}", file=sys.stderr)
    return records, reasons


def build_outputs(report_index_rows: list[dict[str, object]] | None = None) -> dict[str, list[dict[str, object]]]:
    outputs = {sheet_name: [] for sheet_name in CSV_SCHEMAS}
    outputs["point_aliases"] = DEFAULT_POINT_ALIASES
    outputs["report_index"] = report_index_rows or []
    return outputs


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Write Portside analysis CSV files for Google Sheets import.")
    parser.add_argument(
        "--input",
        type=Path,
        help="Saved Portside catch-list HTML file, for example .\\私達の釣果.html",
    )
    parser.add_argument(
        "--mode",
        choices=("all", "shibudai"),
        default="all",
        help="Extraction mode. shibudai keeps rows whose list fish text contains シブダイ or フエダイ.",
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="CSV output directory. Default: data/portside",
    )
    parser.add_argument(
        "--templates-only",
        action="store_true",
        help="Write header/template CSV files without parsing --input.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    report_index_rows = []
    if args.input and not args.templates_only:
        report_index_rows, _ = extract_report_index(args.input, args.mode)
    elif not args.templates_only:
        print("No --input specified; writing template CSV files only.", file=sys.stderr)

    outputs = build_outputs(report_index_rows)
    written_paths = write_outputs(args.out_dir, outputs)

    print(f"CSV encoding: {CSV_ENCODING}")
    for path in written_paths:
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
