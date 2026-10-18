"""Import WIPO's 2026 edition, without third-party spreadsheet dependencies.

Usage: python3 scripts/import-gii.py [official-workbook.xlsx]
Without a path, downloads the official workbook. Review the next edition before
changing YEAR/URL: this is an edition-specific importer, not an automatic feed.
"""
import io
import json
import math
from pathlib import Path
import sys
from datetime import datetime, timezone
from urllib.request import urlopen
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
YEAR = 2026
URL = "https://www.wipo.int/edocs/pubdocs/en/wipo-pub-2000-2026-tech1.xlsx"
PAGE = "https://www.wipo.int/en/web/global-innovation-index/2026/index"
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
METRICS = [
    ("", "global-innovation-index", "Global Innovation Index", "tech", "💡"),
    ("IN", "innovation-inputs", "Innovation Inputs", "tech", "🔬"),
    ("OUT", "innovation-outputs", "Innovation Outputs", "tech", "💡"),
    ("IN.1", "innovation-institutions", "Institutions for Innovation", "society", "⚖️"),
    ("IN.2", "innovation-human-capital-research", "Innovation Human Capital & Research", "education", "🎓"),
    ("IN.3", "innovation-infrastructure", "Innovation Infrastructure", "tech", "📡"),
    ("IN.4", "innovation-market-sophistication", "Innovation Market Sophistication", "markets", "📈"),
    ("IN.5", "innovation-business-sophistication", "Innovation Business Sophistication", "markets", "🏢"),
    ("OUT.6", "innovation-knowledge-technology", "Knowledge & Technology Outputs", "tech", "🔬"),
    ("OUT.7", "innovation-creative-outputs", "Creative Innovation Outputs", "tech", "🎨"),
]


def import_workbook(raw):
    countries = {c["code3"]: c for c in json.loads((ROOT / "data/countries.json").read_text())}
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        strings = ["".join(t.text or "" for t in s.findall(".//m:t", NS))
                   for s in ET.fromstring(archive.read("xl/sharedStrings.xml")).findall("m:si", NS)]

        def sheet(number):
            rows = []
            xml = ET.fromstring(archive.read(f"xl/worksheets/sheet{number}.xml"))
            for row in xml.findall("m:sheetData/m:row", NS):
                cells = {}
                for cell in row:
                    value = cell.find("m:v", NS)
                    if value is not None:
                        cells[cell.attrib["r"].rstrip("0123456789")] = (
                            strings[int(value.text)] if cell.attrib.get("t") == "s" else value.text)
                rows.append(cells)
            return rows

        structure, data = sheet(1), sheet(3)
    if data[0] != dict(zip("ABCDEFGHIJKL", ["ISO3", "ECONOMY_NAME", "NUM", "NAME", "DATAYR",
                                                   "VALUE_SCREEN", "SCORE", "RANK", "SW_OVERALL",
                                                   "SW_INCGRP", "OUTDATED", "DMC"])):
        raise ValueError("WIPO data columns changed")
    definitions = {r.get("A", ""): r for r in structure
                   if r.get("C") in ("Index", "SubIndex", "Pillar")}
    output = []
    for metric, ranking_id, title, category, icon in METRICS:
        definition = definitions[metric]
        items, seen, published_ranks, ranked_scores = [], set(), set(), []
        for row in data[1:]:
            if row.get("C", "") != metric:
                continue
            country = countries[row["A"]]  # Fail rather than silently omit an economy.
            score, rank = float(row["G"]), int(row["H"])
            if country["code"] in seen or not math.isfinite(score) or not 0 <= score <= 100:
                raise ValueError(f"Invalid/duplicate {metric} score: {row}")
            if not 1 <= rank <= 139 or rank in published_ranks:
                raise ValueError(f"Invalid/duplicate published rank: {row}")
            seen.add(country["code"])
            published_ranks.add(rank)
            ranked_scores.append((rank, score))
            items.append({"name": country["name"], "country": country["code"], "value": round(score, 6)})
        if len(items) != 139:
            raise ValueError(f"{metric}: expected 139 economies, got {len(items)}")
        scores_by_rank = [score for _, score in sorted(ranked_scores)]
        if any(a < b for a, b in zip(scores_by_rank, scores_by_rank[1:])):
            raise ValueError(f"{metric}: scores disagree with published rank order")
        items.sort(key=lambda i: (-i["value"], i["name"]))
        if metric == "" and [i["country"] for i in items[:5]] != ["CH", "SE", "US", "KR", "SG"]:
            raise ValueError("Overall leaders disagree with WIPO's 2026 release")
        output.append({
            "id": ranking_id, "title": title, "category": category, "icon": icon,
            "desc": f"WIPO Global Innovation Index 2026 — {definition['B']}. {definition['F']} Higher scores rank first.",
            "unit": "GII score (0–100)", "prefix": "", "suffix": "", "decimals": 2,
            "order": "desc", "year": YEAR,
            "source": {
                "kind": "manual", "name": "WIPO — Global Innovation Index 2026",
                "url": PAGE, "urls": [URL], "verified": True,
                "note": f"2026 edition, released September 29, 2026; {definition['B']} SCORE column in the official Data sheet, covering all 139 economies. Edition year is not the observation year of every underlying indicator, which uses mixed reference years. Scores retain six decimal places; displayed scores are rounded to two decimals, so equal displayed values can have different ranks. Imported reproducibly with scripts/import-gii.py; future editions require review.",
            },
            "updatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"), "items": items,
        })
    # Validate every metric before writing any file; repeat imports preserve timestamps.
    for ranking in output:
        path = ROOT / "data/rankings" / f"{ranking['id']}.json"
        if path.exists():
            previous = json.loads(path.read_text())
            ranking["updatedAt"] = previous["updatedAt"]
            if ranking == previous:
                print(f"= {ranking['id']}: unchanged")
                continue
            ranking["updatedAt"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        path.write_text(json.dumps(ranking, ensure_ascii=False, indent=2) + "\n")
        print(f"+ {ranking['id']}: {len(ranking['items'])} economies")


if __name__ == "__main__":
    raw = Path(sys.argv[1]).read_bytes() if len(sys.argv) > 1 else urlopen(URL, timeout=60).read()
    import_workbook(raw)
