"""Turn the team's listings CSV into pinned WhatsApp messages, one per town and sport."""
import argparse
import csv
import re
import sys
from dataclasses import dataclass
from datetime import date, datetime, timedelta


@dataclass
class Listing:
    town: str
    sport: str
    name: str
    type: str
    when: str
    level: str
    contact: str
    verified_on: date


def parse_listings(path: str) -> tuple[list[Listing], list[str]]:
    """Return consented listings with valid dates, plus problems for skipped rows."""
    listings: list[Listing] = []
    problems: list[str] = []
    with open(path, newline="", encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            name = (r.get("name") or "").strip()
            if (r.get("consent") or "").strip().lower() != "yes":
                continue
            try:
                verified = datetime.strptime((r.get("verified_on") or "").strip(), "%Y-%m-%d").date()
            except ValueError:
                problems.append(f"Skipped '{name}': bad or missing verified_on date")
                continue
            listings.append(Listing(
                town=r["town"].strip(), sport=r["sport"].strip(), name=name,
                type=r["type"].strip(), when=r["when"].strip(), level=r["level"].strip(),
                contact=r["contact"].strip(), verified_on=verified,
            ))
    return listings, problems


def _clean(text: str) -> str:
    return re.sub(r"[*_~]", "", text)


def format_message(town: str, sport: str, listings: list[Listing], today: date,
                   max_age_days: int = 14) -> str:
    cutoff = today - timedelta(days=max_age_days)
    fresh = [l for l in listings if l.verified_on >= cutoff]
    title = f"*{town} · {sport}*"
    if not fresh:
        return f"{title} — No verified listings yet. Know a run or team? Tell us and we'll add it."
    lines = [f"{title} — verified listings"]
    for i, l in enumerate(sorted(fresh, key=lambda x: x.when), 1):
        label = "Message" if re.match(r"^\+?\d[\d\s-]*$", l.contact) else "Join"
        lines.append(f"{i}. *{_clean(l.name)}* ({_clean(l.type)}, {_clean(l.level)})")
        lines.append(f"   {_clean(l.when)} · {label}: {l.contact}")
        lines.append(f"   _verified {l.verified_on.day} {l.verified_on.strftime('%b')}_")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):  # redirected output on Windows defaults to cp1252
            stream.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("csv_path")
    ap.add_argument("--today", default=None, help="YYYY-MM-DD (default: today)")
    args = ap.parse_args(argv)
    today = datetime.strptime(args.today, "%Y-%m-%d").date() if args.today else date.today()
    listings, problems = parse_listings(args.csv_path)
    for p in problems:
        print(p, file=sys.stderr)
    groups = sorted({(l.town, l.sport) for l in listings})
    print("\n=====\n".join(
        format_message(t, s, [l for l in listings if (l.town, l.sport) == (t, s)], today)
        for t, s in groups
    ))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
