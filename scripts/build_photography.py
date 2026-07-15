#!/usr/bin/env python3
"""Build the photography manifest from collection folders."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
COLLECTIONS_ROOT = ROOT / "photography" / "collections"
OUTPUT = ROOT / "photography" / "collections.json"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif"}
SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
CATEGORY_ORDER = {"trips": 0, "everyday": 1, "portraits": 2}


def web_path(path: Path) -> str:
    return "/" + path.relative_to(ROOT).as_posix()


def natural_key(path: Path) -> list[object]:
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", path.name)]


def load_collection(metadata_path: Path) -> dict[str, object]:
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    folder = metadata_path.parent
    slug = metadata.get("slug", folder.name)

    if not isinstance(slug, str) or not SLUG_PATTERN.fullmatch(slug):
        raise ValueError(f"Invalid slug in {metadata_path}: {slug!r}")

    images = sorted(
        (
            path
            for path in folder.iterdir()
            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
        ),
        key=natural_key,
    )

    cover_name = metadata.get("cover", "cover.jpg")
    cover_path = folder / str(cover_name)
    cover_exists = cover_path.exists()
    captions = metadata.get("captions", {})
    if not isinstance(captions, dict):
        raise ValueError(f"captions must be an object in {metadata_path}")

    photos = []
    for image in images:
        if cover_exists and image == cover_path:
            continue
        photos.append(
            {
                "src": web_path(image),
                "alt": str(captions.get(image.name, "")),
                "filename": image.name,
            }
        )

    return {
        "slug": slug,
        "title": str(metadata.get("title", slug.replace("-", " ").title())),
        "category": str(metadata.get("category", folder.parent.name)),
        "location": str(metadata.get("location", "")),
        "year": str(metadata.get("year", "")),
        "order": int(metadata.get("order", 999)),
        "description": str(metadata.get("description", "")),
        "cover": web_path(cover_path) if cover_exists else None,
        "coverAlt": str(metadata.get("coverAlt", "")),
        "photos": photos,
    }


def main() -> int:
    metadata_files = sorted(COLLECTIONS_ROOT.rglob("collection.json"))
    collections = [load_collection(path) for path in metadata_files]

    slugs = [str(collection["slug"]) for collection in collections]
    duplicates = sorted({slug for slug in slugs if slugs.count(slug) > 1})
    if duplicates:
        raise ValueError(f"Duplicate collection slugs: {', '.join(duplicates)}")

    collections.sort(
        key=lambda collection: (
            CATEGORY_ORDER.get(str(collection["category"]), 99),
            int(collection["order"]),
            str(collection["title"]).lower(),
        )
    )

    payload = {"collections": collections}
    rendered = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"
    if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != rendered:
        OUTPUT.write_text(rendered, encoding="utf-8")

    missing_covers = [str(item["title"]) for item in collections if item["cover"] is None]
    print(f"Built {OUTPUT.relative_to(ROOT)} with {len(collections)} collections.")
    if missing_covers:
        print("Missing cover.jpg: " + ", ".join(missing_covers), file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
