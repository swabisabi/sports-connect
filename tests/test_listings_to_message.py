import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))

from listings_to_message import Listing, format_message, main, parse_listings  # noqa: E402

HEADER = "town,sport,name,type,when,level,contact,consent,verified_on\n"
TODAY = date(2026, 11, 27)


def write_csv(tmp_path, rows):
    p = tmp_path / "listings.csv"
    p.write_text(HEADER + "".join(rows), encoding="utf-8")
    return str(p)


def row(name="Run", consent="yes", verified="2026-11-24", town="Nakuru", sport="Basketball"):
    return f'{town},{sport},"{name}",pickup,Sat 4pm,all levels,https://chat.whatsapp.com/abc,{consent},{verified}\n'


def test_consent_required(tmp_path):
    path = write_csv(tmp_path, [row("A", "no"), row("B", ""), row("C", " YES ")])
    listings, _ = parse_listings(path)
    assert [l.name for l in listings] == ["C"]


def test_age_boundary(tmp_path):
    path = write_csv(tmp_path, [row("Fresh", verified="2026-11-13"), row("Old", verified="2026-11-12")])
    listings, _ = parse_listings(path)
    msg = format_message("Nakuru", "Basketball", listings, TODAY)
    assert "Fresh" in msg
    assert "Old" not in msg


def test_empty_group_message():
    assert format_message("Nakuru", "Basketball", [], TODAY) == (
        "*Nakuru · Basketball* — No verified listings yet. "
        "Know a run or team? Tell us and we'll add it."
    )


def test_message_format_exact():
    listing = Listing(
        town="Nakuru", sport="Basketball", name="Kiamunyi pickup run", type="pickup",
        when="Sat 4pm", level="all levels", contact="https://chat.whatsapp.com/abc",
        verified_on=date(2026, 11, 24),
    )
    assert format_message("Nakuru", "Basketball", [listing], TODAY) == (
        "*Nakuru · Basketball* — verified listings\n"
        "1. *Kiamunyi pickup run* (pickup, all levels)\n"
        "   Sat 4pm · Join: https://chat.whatsapp.com/abc\n"
        "   _verified 24 Nov_"
    )


def test_bad_date_reported_not_crash(tmp_path):
    path = write_csv(tmp_path, [row("Tomorrow", verified="tomorrow"), row("Blank", verified=""), row("Good")])
    listings, problems = parse_listings(path)
    assert [l.name for l in listings] == ["Good"]
    assert len(problems) == 2
    assert "Tomorrow" in problems[0] and "Blank" in problems[1]


def test_quoted_commas_swahili_emoji(tmp_path):
    name = 'Mtaa wa ""Hoops"", Nakuru 🏀'
    path = write_csv(tmp_path, [row(name)])
    listings, _ = parse_listings(path)
    assert listings[0].name == 'Mtaa wa "Hoops", Nakuru 🏀'


def test_markup_characters_neutralised():
    listing = Listing("Nakuru", "Basketball", "*Best* _run_ ~x~", "pickup", "Sat", "all", "https://x.co", date(2026, 11, 24))
    msg = format_message("Nakuru", "Basketball", [listing], TODAY)
    assert "1. *Best run x* (pickup, all)" in msg


def test_phone_contact_uses_message_label():
    listing = Listing("Nakuru", "Basketball", "Coach", "club", "Tue 6pm", "club", "+254700000000", date(2026, 11, 24))
    assert "Message: +254700000000" in format_message("Nakuru", "Basketball", [listing], TODAY)


def test_cli_prints_section_per_group(tmp_path, capsys):
    path = write_csv(tmp_path, [row("A"), row("B", town="Eldoret")])
    assert main([path, "--today", "2026-11-27"]) == 0
    out = capsys.readouterr().out
    assert out.count("=====") == 1
    assert "*Nakuru · Basketball*" in out and "*Eldoret · Basketball*" in out


def test_cli_survives_redirected_output_with_emoji(tmp_path):
    import subprocess
    path = write_csv(tmp_path, [row("Hoops 🏀")])
    script = str(Path(__file__).resolve().parent.parent / "tools" / "listings_to_message.py")
    out = tmp_path / "out.txt"
    with open(out, "wb") as f:
        r = subprocess.run([sys.executable, script, path, "--today", "2026-11-27"], stdout=f, stderr=subprocess.PIPE)
    assert r.returncode == 0, r.stderr.decode(errors="replace")
    assert "Hoops 🏀" in out.read_text(encoding="utf-8")
