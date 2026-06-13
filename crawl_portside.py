#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Portside analysis CSV writer.

The first pass parses the saved catch-list HTML into report_index.csv. With
--resume it fetches or reuses cached detail HTML and writes analysis CSV files
for Google Sheets imports.
"""

from __future__ import annotations

import argparse
import csv
import html
from datetime import datetime
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin

import requests


CSV_ENCODING = "utf-8-sig"
DEFAULT_OUTPUT_DIR = Path("data") / "portside"
DEFAULT_BASE_URL = "https://portside-t.com/iso/"
RAW_HTML_DIRNAME = "raw_html"
INPUT_ENCODINGS = ("cp932", "shift_jis", "utf-8-sig", "utf-8")
SHIBUDAI_PATTERN = re.compile(r"シブダイ|フエダイ")
ISO_REPO_PATTERN = re.compile(r"""href\s*=\s*["']?([^"'\s>]*iso_repo\d+\.htm)["']?""", re.IGNORECASE)
REPO_ID_PATTERN = re.compile(r"iso_repo(\d+)\.htm", re.IGNORECASE)
TR_PATTERN = re.compile(r"<tr\b[^>]*>.*?</tr>", re.IGNORECASE | re.DOTALL)
TD_PATTERN = re.compile(r"<td\b[^>]*>(.*?)</td>", re.IGNORECASE | re.DOTALL)
TAG_PATTERN = re.compile(r"<[^>]+>")
YEAR_PATTERN = re.compile(r"(20\d{2}|19\d{2})")
DATE_PATTERN = re.compile(r"(?:(20\d{2}|19\d{2})年)?\s*(\d{1,2})月\s*(\d{1,2})日")
TIME_PATTERN = re.compile(r"(\d{1,2})\s*時")
SIZE_CM_PATTERN = re.compile(r"(\d+(?:\.\d+)?)\s*(?:cm|ｃｍ|センチ|㎝)", re.IGNORECASE)
WEIGHT_KG_PATTERN = re.compile(r"(\d+(?:\.\d+)?)\s*(?:kg|ｋｇ|キロ)", re.IGNORECASE)
FISH_SPLIT_PATTERN = re.compile(r"[、,，/／]+")
PRIORITY_REPO_IDS = ("iso_repo459", "iso_repo458", "iso_repo460")
REQUEST_HEADERS = {
    "User-Agent": "gamusha-portside-analysis/0.2 (+https://github.com/sysnaggengvdoo/gamusha)",
}
FETCH_TIMEOUT_SECONDS = 30
DETAIL_TEXT_MAX_CHARS = 600
EVIDENCE_MAX_CHARS = 120

FISH_NORMALIZATION_RULES = [
    ("シブダイ系", ("シブダイ", "フエダイ")),
    ("メイチダイ", ("メイチダイ",)),
    ("マダイ", ("マダイ", "真鯛")),
    ("イサキ", ("イサキ",)),
    ("シマアジ", ("シマアジ",)),
    ("メジナ", ("メジナ",)),
    ("クロダイ", ("クロダイ", "黒鯛")),
    ("ヘダイ", ("ヘダイ", "へダイ")),
    ("フエフキダイ", ("フエフキダイ",)),
    ("ハタンポ", ("ハタンポ",)),
    ("ブダイ", ("ブダイ",)),
    ("カサゴ", ("カサゴ",)),
    ("ムラソイ", ("ムラソイ", "ソイ")),
    ("ワカシ", ("ワカシ",)),
    ("カマス", ("カマス",)),
    ("アイゴ", ("アイゴ",)),
    ("タカノハダイ", ("タカノハダイ",)),
    ("イスズミ", ("イスズミ",)),
    ("サバ", ("サバ",)),
    ("エイ", ("エイ",)),
    ("ベラ", ("ベラ",)),
    ("フグ類", ("クサフグ", "ショウサイフグ", "アカメフグ", "フグ")),
]

METHOD_RULES = [
    ("夜釣り", ("夜釣り", "夜に", "夜中", "夕刻", "19時", "20時", "21時", "22時", "23時", "24時")),
    ("磯釣り", ("磯で実釣", "磯釣り", "地磯", "磯")),
    ("フカセ", ("フカセ", "道糸", "ハリス", "ロッド")),
    ("カゴ", ("カゴ",)),
    ("スルスル", ("スルスル",)),
    ("ぶっ込み", ("ぶっ込み", "ブッコミ")),
    ("エギング", ("エギング",)),
    ("ルアー", ("ルアー",)),
]

TITLE_POINT_CODES = {
    "kgr": ("カグラ根", "medium"),
}

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


def read_csv(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open("r", encoding=CSV_ENCODING, newline="") as handle:
        return list(csv.DictReader(handle))


def write_outputs(output_dir: Path, outputs: dict[str, list[dict[str, object]]]) -> list[Path]:
    written_paths = []
    for sheet_name, fieldnames in CSV_SCHEMAS.items():
        rows = outputs.get(sheet_name, [])
        path = csv_path(output_dir, sheet_name)
        write_csv(path, fieldnames, rows)
        written_paths.append(path)
    return written_paths


def decode_html_bytes(data: bytes) -> tuple[str, str]:
    errors = []
    for encoding in INPUT_ENCODINGS:
        try:
            return data.decode(encoding), encoding
        except UnicodeDecodeError as error:
            errors.append(f"{encoding}: {error}")
    raise UnicodeDecodeError("html", data, 0, 1, "; ".join(errors))


def read_html(path: Path) -> tuple[str, str]:
    return decode_html_bytes(path.read_bytes())


def clean_text(value: str) -> str:
    value = re.sub(r"(?i)<br\s*/?>", " ", value)
    value = TAG_PATTERN.sub("", value)
    value = html.unescape(value)
    value = value.replace("\u3000", " ")
    return re.sub(r"\s+", " ", value).strip()


def truncate_text(value: str, max_length: int) -> str:
    text = re.sub(r"\s+", " ", value).strip()
    return text if len(text) <= max_length else text[: max_length - 1].rstrip() + "…"


def html_to_lines(source: str) -> list[str]:
    source = re.sub(r"(?i)<br\s*/?>", "\n", source)
    source = re.sub(r"(?i)</(?:p|tr|td|div|h[1-6])>", "\n", source)
    text = TAG_PATTERN.sub(" ", source)
    text = html.unescape(text).replace("\u3000", " ")
    lines = []
    for line in text.splitlines():
        cleaned = re.sub(r"\s+", " ", line).strip()
        if cleaned:
            lines.append(cleaned)
    return lines


def extract_title(source: str, lines: list[str]) -> str:
    match = re.search(r"(?is)<title[^>]*>(.*?)</title>", source)
    if match:
        title = clean_text(match.group(1))
        if title:
            return title
    return lines[0] if lines else ""


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


def priority_report_rows(rows: list[dict[str, object]]) -> list[dict[str, object]]:
    priority = {repo_id: index for index, repo_id in enumerate(PRIORITY_REPO_IDS)}
    return sorted(
        rows,
        key=lambda row: (
            priority.get(str(row.get("repo_id", "")), len(priority)),
            str(row.get("repo_id", "")),
        ),
    )


def raw_html_path(output_dir: Path, repo_id: str) -> Path:
    return output_dir / RAW_HTML_DIRNAME / f"{repo_id}.htm"


def fetch_or_read_report_html(
    record: dict[str, object],
    output_dir: Path,
    session: requests.Session,
    sleep_seconds: float,
) -> tuple[str, str, dict[str, object] | None]:
    repo_id = str(record.get("repo_id") or "")
    url = str(record.get("report_url") or "")
    path = raw_html_path(output_dir, repo_id)

    if path.exists():
        text, _ = read_html(path)
        return text, "cached", None

    if not repo_id or not url:
        return "", "failed", failed_url_row(url, repo_id, "missing_url", "report_url or repo_id is empty")

    try:
        response = session.get(url, headers=REQUEST_HEADERS, timeout=FETCH_TIMEOUT_SECONDS)
        if response.status_code >= 400:
            return "", "failed", failed_url_row(url, repo_id, f"http_{response.status_code}", response.reason)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(response.content)
        text, _ = decode_html_bytes(response.content)
        return text, "fetched", None
    except requests.RequestException as error:
        return "", "failed", failed_url_row(url, repo_id, "request_error", str(error))
    finally:
        time.sleep(max(1.0, min(2.0, sleep_seconds)))


def failed_url_row(url: str, repo_id: str, status: str, message: str) -> dict[str, object]:
    return {
        "url": url,
        "source": "report_details",
        "repo_id": repo_id,
        "fetch_status": status,
        "error_message": truncate_text(message, 180),
        "last_attempt_at": datetime.now().isoformat(timespec="seconds"),
    }


def split_fish_text(fish_text: str) -> list[str]:
    normalized = (
        fish_text.replace("\n", " ")
        .replace("・", "、")
        .replace("　", " ")
        .replace("，", "、")
        .strip()
    )
    fishes = []
    seen = set()
    for fish in FISH_SPLIT_PATTERN.split(normalized):
        fish = fish.strip(" 。、.・")
        if not fish or fish in seen:
            continue
        seen.add(fish)
        fishes.append(fish)
    return fishes


def normalize_fish_name(fish_raw: str) -> str:
    for normalized, keywords in FISH_NORMALIZATION_RULES:
        if any(keyword in fish_raw for keyword in keywords):
            return normalized
    return fish_raw.strip()


def fish_terms(fish_raw: str, fish_normalized: str) -> list[str]:
    terms = [fish_raw, fish_normalized]
    if fish_normalized == "シブダイ系":
        terms.extend(["シブダイ", "フエダイ"])
    plain = re.sub(r"[（(].*?[）)]", "", fish_raw).strip()
    if plain:
        terms.append(plain)
    return [term for index, term in enumerate(terms) if term and term not in terms[:index]]


def detect_methods(text: str) -> list[str]:
    methods = []
    for method, keywords in METHOD_RULES:
        if any(keyword in text for keyword in keywords):
            methods.append(method)
    return methods


def detect_night_fishing(text: str) -> bool:
    if any(keyword in text for keyword in ("夜釣り", "夜に", "夜中", "夕刻", "日没", "24時")):
        return True
    for match in TIME_PATTERN.finditer(text):
        hour = int(match.group(1))
        if hour >= 18 or hour <= 4:
            return True
    return False


def extract_largest_number(pattern: re.Pattern[str], text: str) -> str:
    values = []
    for match in pattern.finditer(text):
        try:
            values.append(float(match.group(1)))
        except ValueError:
            continue
    if not values:
        return ""
    value = max(values)
    return str(int(value)) if value.is_integer() else str(value)


def find_evidence(lines: list[str], terms: list[str], fallback: str) -> str:
    for index, line in enumerate(lines):
        if any(term in line for term in terms):
            context = line
            if index + 1 < len(lines) and (
                SIZE_CM_PATTERN.search(lines[index + 1]) or WEIGHT_KG_PATTERN.search(lines[index + 1])
            ):
                context = f"{context} {lines[index + 1]}"
            return truncate_text(context, EVIDENCE_MAX_CHARS)
    return truncate_text(fallback, EVIDENCE_MAX_CHARS)


def detect_point(title: str, list_location: str, detail_text: str) -> tuple[str, str]:
    haystack = " ".join([title, list_location, detail_text])

    title_code = re.search(r"(?:repo|レポ)\d{6}([a-z]{2,4})", title.lower())
    if title_code:
        point = TITLE_POINT_CODES.get(title_code.group(1))
        if point:
            return point

    for alias in DEFAULT_POINT_ALIASES:
        alias_text = str(alias["alias"])
        if alias_text and alias_text in haystack:
            return str(alias["app_spot_name"]), str(alias["confidence"])

    if list_location:
        return list_location, "low"
    return "", "low"


def detail_body_lines(lines: list[str], record: dict[str, object], title: str) -> list[str]:
    skip_values = {
        "戻る",
        "私の釣果一覧",
        "次へ",
        title,
        str(record.get("date_raw") or ""),
        str(record.get("list_location") or ""),
        str(record.get("list_fish_text") or ""),
    }
    fish_parts = split_fish_text(str(record.get("list_fish_text") or ""))
    body = []
    for line in lines:
        if line in skip_values:
            continue
        if YEAR_PATTERN.fullmatch(line.strip(".")):
            continue
        if line in fish_parts:
            continue
        body.append(line)
    return body


def analyze_report_detail(
    record: dict[str, object],
    html_text: str,
    fetch_status: str,
) -> tuple[dict[str, object], list[dict[str, object]]]:
    lines = html_to_lines(html_text)
    title = extract_title(html_text, lines)
    body_lines = detail_body_lines(lines, record, title)
    joined_body = " ".join(body_lines)
    detected_point, point_confidence = detect_point(title, str(record.get("list_location") or ""), joined_body)
    methods = detect_methods(joined_body)
    is_night = detect_night_fishing(joined_body)
    evidence_seed = find_evidence(body_lines, ["シブダイ", "フエダイ"], joined_body)

    detail_row = {
        "repo_id": record.get("repo_id", ""),
        "report_url": record.get("report_url", ""),
        "title": title,
        "detail_text": truncate_text(joined_body, DETAIL_TEXT_MAX_CHARS),
        "detected_points": detected_point,
        "detected_methods": "、".join(methods),
        "detected_conditions": "夜釣りあり" if is_night else "",
        "evidence_text": evidence_seed,
        "fetch_status": fetch_status,
        "error_message": "",
    }

    fish_rows = []
    for fish_raw in split_fish_text(str(record.get("list_fish_text") or "")):
        fish_normalized = normalize_fish_name(fish_raw)
        terms = fish_terms(fish_raw, fish_normalized)
        evidence = find_evidence(body_lines, terms, str(record.get("list_fish_text") or ""))
        size_cm = extract_largest_number(SIZE_CM_PATTERN, evidence)
        weight_kg = extract_largest_number(WEIGHT_KG_PATTERN, evidence)
        fish_rows.append(
            {
                "date": record.get("date", ""),
                "year": record.get("year", ""),
                "month": month_from_date(str(record.get("date") or "")),
                "repo_id": record.get("repo_id", ""),
                "report_url": record.get("report_url", ""),
                "list_location": record.get("list_location", ""),
                "detected_point": detected_point,
                "fish_raw": fish_raw,
                "fish_normalized": fish_normalized,
                "size_cm": size_cm,
                "weight_kg": weight_kg,
                "method": "、".join(methods),
                "is_night_fishing": "true" if is_night else "false",
                "evidence_text": evidence,
                "confidence": point_confidence,
            }
        )
    return detail_row, fish_rows


def month_from_date(date_value: str) -> str:
    match = re.match(r"\d{4}-(\d{2})-\d{2}", date_value)
    return str(int(match.group(1))) if match else ""


def is_shibudai_candidate(row: dict[str, object]) -> bool:
    text = " ".join(str(row.get(key, "")) for key in ("fish_raw", "fish_normalized"))
    return str(row.get("fish_normalized", "")) == "シブダイ系" or bool(SHIBUDAI_PATTERN.search(text))


def summarize_point_month(catch_records: list[dict[str, object]]) -> list[dict[str, object]]:
    grouped: dict[tuple[str, str, str], dict[str, object]] = {}
    for row in catch_records:
        point = str(row.get("detected_point") or row.get("list_location") or "")
        month = str(row.get("month") or "")
        fish = str(row.get("fish_normalized") or "")
        if not point or not month or not fish:
            continue
        key = (point, month, fish)
        if key not in grouped:
            grouped[key] = {
                "point": point,
                "month": month,
                "fish_normalized": fish,
                "count": 0,
                "report_urls": [],
            }
        grouped[key]["count"] = int(grouped[key]["count"]) + 1
        url = str(row.get("report_url") or "")
        urls = grouped[key]["report_urls"]
        if url and url not in urls:
            urls.append(url)

    summaries = []
    for row in grouped.values():
        summaries.append(
            {
                "point": row["point"],
                "month": row["month"],
                "fish_normalized": row["fish_normalized"],
                "count": row["count"],
                "report_urls": " ".join(row["report_urls"]),
            }
        )
    return sorted(summaries, key=lambda row: (str(row["point"]), int(row["month"]), str(row["fish_normalized"])))


def analyze_report_rows(
    report_index_rows: list[dict[str, object]],
    output_dir: Path,
    sleep_seconds: float,
) -> dict[str, list[dict[str, object]]]:
    details = []
    catch_records = []
    failed_urls = []
    session = requests.Session()

    for record in priority_report_rows(report_index_rows):
        html_text, fetch_status, failure = fetch_or_read_report_html(record, output_dir, session, sleep_seconds)
        if failure:
            failed_urls.append(failure)
            continue
        detail_row, fish_rows = analyze_report_detail(record, html_text, fetch_status)
        details.append(detail_row)
        catch_records.extend(fish_rows)

    shibudai_candidates = [row for row in catch_records if is_shibudai_candidate(row)]
    point_summary = summarize_point_month(catch_records)

    return {
        "report_details": details,
        "catch_records": catch_records,
        "shibudai_candidates": shibudai_candidates,
        "point_month_summary": point_summary,
        "failed_urls": failed_urls,
    }


def build_outputs(
    report_index_rows: list[dict[str, object]] | None = None,
    detail_outputs: dict[str, list[dict[str, object]]] | None = None,
) -> dict[str, list[dict[str, object]]]:
    outputs = {sheet_name: [] for sheet_name in CSV_SCHEMAS}
    outputs["point_aliases"] = DEFAULT_POINT_ALIASES
    outputs["report_index"] = report_index_rows or []
    if detail_outputs:
        for sheet_name, rows in detail_outputs.items():
            outputs[sheet_name] = rows
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
        "--resume",
        action="store_true",
        help="Fetch cached/missing detail reports from report_index rows and build analysis CSV files.",
    )
    parser.add_argument(
        "--sleep-seconds",
        type=float,
        default=1.2,
        help="Sleep after each network fetch. Clamped to 1.0-2.0 seconds.",
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
    detail_outputs = {}
    if args.input and not args.templates_only:
        report_index_rows, _ = extract_report_index(args.input, args.mode)
    elif args.resume:
        report_index_rows = read_csv(csv_path(args.out_dir, "report_index"))
        print(f"Loaded report_index rows: {len(report_index_rows)}")
    elif not args.templates_only:
        print("No --input specified; writing template CSV files only.", file=sys.stderr)

    if args.resume:
        if report_index_rows:
            detail_outputs = analyze_report_rows(report_index_rows, args.out_dir, args.sleep_seconds)
        else:
            print("EMPTY_REASON: --resume requested but report_index rows are empty", file=sys.stderr)

    outputs = build_outputs(report_index_rows, detail_outputs)
    written_paths = write_outputs(args.out_dir, outputs)

    print(f"CSV encoding: {CSV_ENCODING}")
    for path in written_paths:
        print(path)
    print("CSV row counts:")
    for sheet_name in CSV_SCHEMAS:
        print(f"{sheet_name}: {len(outputs.get(sheet_name, []))}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
