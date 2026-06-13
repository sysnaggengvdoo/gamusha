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
from pathlib import Path


CSV_ENCODING = "utf-8-sig"
DEFAULT_OUTPUT_DIR = Path("data") / "portside"

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


def build_template_outputs() -> dict[str, list[dict[str, object]]]:
    outputs = {sheet_name: [] for sheet_name in CSV_SCHEMAS}
    outputs["point_aliases"] = DEFAULT_POINT_ALIASES
    return outputs


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Write Portside analysis CSV files for Google Sheets import.")
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="CSV output directory. Default: data/portside",
    )
    parser.add_argument(
        "--templates-only",
        action="store_true",
        help="Write header/template CSV files. This is currently the default behavior.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    outputs = build_template_outputs()
    written_paths = write_outputs(args.out_dir, outputs)

    print(f"CSV encoding: {CSV_ENCODING}")
    for path in written_paths:
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
