# Sports Connect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Launch a human-run WhatsApp Community that introduces newcomer athletes to verified local sports communities, with three small tools that make it faster to run and easier to demo, in 72 hours.

**Architecture:** The product is a WhatsApp Community with one group per town and sport. Pinned messages hold verified listings. A rota of four team members acts as connectors. The coder builds three standalone helpers: a listings-to-message script (Python, CSV in, WhatsApp text out), a static link-hub page, and a QR generator. No backend, no WhatsApp API.

**Tech Stack:** WhatsApp Community and groups, Python 3 (stdlib `csv`, `datetime`, `argparse`) with `pytest`, `segno` for QR codes, static HTML/JS on Cloudflare Pages (`wrangler`).

**Spec:** `docs/superpowers/specs/2026-11-25-athlete-connect-design.md`

## Global Constraints

- Intro template fields are exactly: name, sport, position, level. No age, weight, goals or nutrition.
- A phone number or link is listed only after its admin has agreed (`consent` = yes).
- Every listing shows a last-verified date. Listings older than 14 days are not shown.
- Only team members post listings. Newcomers post intros only.
- Connector target: reply to each new intro the same day.
- Works on cheap phones: link hub is one static page, no framework, no login.
- No WhatsApp Business API. Check current WhatsApp Community and group limits before creating groups.

## Review Focus

1. Consent entered as `no`, blank, or with odd case or spaces (`" YES "`): only a yes in any case, trimmed, is shown. (Task 1)
2. A listing verified exactly 14 days ago is shown; 15 days ago is not. (Task 1)
3. A town and sport with no valid listings gets a clear "No verified listings yet" message, not a blank post. (Task 1)
4. A bad or missing verified date skips that row and reports it, and never crashes the run. (Task 1)
5. Names with commas in quotes, non-English text, emoji, or WhatsApp markup characters (`*`, `_`, `~`) parse correctly and don't break the message formatting. (Task 1)

---

## People and roles (the four of you)

| Role | Owns |
|---|---|
| **Coder** | Tasks 1–3 |
| **Data lead** | Task 5 (admin outreach, listings spreadsheet) |
| **Community lead** | Tasks 4 and 6 (groups, playbook, connector rota) |
| **Pitch lead** | Task 7 (poster wording, demo, audience plan) |

Everyone joins the connector rota (Task 4).

## File Structure

- `data/listings.csv` — the team's source of truth. Columns: `town,sport,name,type,when,level,contact,consent,verified_on`.
- `tools/listings_to_message.py` — parse and format listings.
- `tests/test_listings_to_message.py`
- `tools/make_qr.py`, `tests/test_make_qr.py`
- `hub/index.html`, `hub/groups.json` — static link hub.
- `ops/connector-playbook.md` — intro template, reply templates, rota, weekly re-check.
- `ops/admin-outreach.md` — script for contacting group admins.

## Timeline

- **Hours 0–24:** Tasks 1, 4, 5 start. Community created, outreach begins, formatter done.
- **Hours 24–48:** Tasks 2, 3, 6. Groups live with listings pinned, link hub deployed, soft launch to real athletes.
- **Hours 48–72:** Task 7. Real athletes onboarded, demo rehearsed, poster out.

---

### Task 1: Listings-to-message script (Coder)

**Files:**
- Create: `data/listings.csv` (header row only plus 2 sample rows)
- Create: `tools/listings_to_message.py`
- Test: `tests/test_listings_to_message.py`

**Interfaces:**
- Produces:
  - `@dataclass Listing(town: str, sport: str, name: str, type: str, when: str, level: str, contact: str, verified_on: date)`
  - `parse_listings(path: str) -> tuple[list[Listing], list[str]]` — returns consented, valid-date listings and a list of human-readable problem strings for skipped rows.
  - `format_message(town: str, sport: str, listings: list[Listing], today: date, max_age_days: int = 14) -> str`
  - `main(argv: list[str] | None = None) -> int` — CLI: `python tools/listings_to_message.py data/listings.csv --today 2026-11-27`; prints one message per (town, sport), separated by a line `=====`, and prints problems to stderr.

Message format for one listing (exact):

```
*Nakuru · Basketball* — verified listings
1. *Kiamunyi pickup run* (pickup, all levels)
   Sat 4pm · Join: https://chat.whatsapp.com/abc
   _verified 24 Nov_
```

Empty group message (exact): `*Nakuru · Basketball* — No verified listings yet. Know a run or team? Tell us and we'll add it.`

- [ ] **Step 1: Write the failing tests** in `tests/test_listings_to_message.py`, each using `tmp_path` CSVs:
  - `test_consent_required`: rows with consent `no`, ``, ` YES ` → only the ` YES ` row is returned.
  - `test_age_boundary`: with `today=2026-11-27`, verified `2026-11-13` is included, `2026-11-12` is not.
  - `test_empty_group_message`: `format_message("Nakuru", "Basketball", [], today)` equals the empty-group message above.
  - `test_message_format_exact`: one listing formats to exactly the block above.
  - `test_bad_date_reported_not_crash`: a row with verified date `tomorrow` and one with a blank date are skipped; `problems` has two entries naming the row's group name.
  - `test_quoted_commas_swahili_emoji`: name `Mtaa wa "Hoops", Nakuru 🏀` parses unchanged in `Listing.name`.
  - `test_markup_characters_neutralised`: name `*Best* _run_` appears in the formatted message with `*`, `_` and `~` removed from the name.
  - `test_cli_prints_section_per_group`: two towns produce two sections separated by `=====`.
- [ ] **Step 2: Run** `pytest tests/test_listings_to_message.py -v`. Expected: all FAIL (module not found).
- [ ] **Step 3: Implement** the interface above in `tools/listings_to_message.py`. Use `csv.DictReader` with `encoding="utf-8-sig"` so spreadsheets exported from Excel work. Compare consent with `.strip().lower() == "yes"`. Parse dates as `YYYY-MM-DD`. Group by (town, sport) and sort by `when` text as given. Contact is shown after `Join: ` for links and `Message: ` for phone numbers.
- [ ] **Step 4: Run** `pytest tests/test_listings_to_message.py -v`. Expected: all PASS.
- [ ] **Step 5: Commit**

```bash
git add data/listings.csv tools/listings_to_message.py tests/test_listings_to_message.py
git commit -m "feat: listings to WhatsApp message script"
```

### Task 2: QR code generator (Coder)

**Files:**
- Create: `tools/make_qr.py`
- Test: `tests/test_make_qr.py`

**Interfaces:**
- Produces: `make_qr(url: str, out_path: str, scale: int = 10) -> None` writes an SVG; `main(argv) -> int` CLI: `python tools/make_qr.py <url> <out.svg>`.

- [ ] **Step 1: Write the failing tests:** `test_writes_svg_file` (output exists, starts with `<?xml` or `<svg`, size > 0) and `test_rejects_non_http_url` (`make_qr("hello", ...)` raises `ValueError`).
- [ ] **Step 2: Run** `pytest tests/test_make_qr.py -v`. Expected: FAIL.
- [ ] **Step 3: Implement** with `segno.make(url, error="m").save(out_path, scale=scale)`. Validate the URL starts with `http://` or `https://`. Add `segno` to `requirements.txt`.
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Commit** `git add tools/make_qr.py tests/test_make_qr.py requirements.txt && git commit -m "feat: QR code generator"`.

### Task 3: Link hub page (Coder)

**Files:**
- Create: `hub/index.html`, `hub/groups.json`

**Interfaces:**
- Consumes: `groups.json` as a list of `{"town": str, "sport": str, "name": str, "join_url": str}`.
- Produces: a deployed URL for the poster and posts.

- [ ] **Step 1: Build `hub/index.html`:** one mobile-first page that fetches `groups.json` and shows a "Pick your town" list, each town expanding to its sport groups with a "Join on WhatsApp" button (`join_url`). No framework, one inline stylesheet, large tap targets. A group with an empty `join_url` is not rendered. If `groups.json` is empty or fails to load, show "Groups are opening soon — message us on WhatsApp" with the Community link.
- [ ] **Step 2: Verify locally:** run `python -m http.server -d hub 8000`, open on a phone-width browser window, and confirm: the list renders from `groups.json`, an entry with empty `join_url` is hidden, and an empty `[]` file shows the fallback text.
- [ ] **Step 3: Deploy:** `npx wrangler pages deploy hub --project-name athlete-connect`. Expected: a `*.pages.dev` URL that loads on mobile data.
- [ ] **Step 4: Commit** `git add hub && git commit -m "feat: static link hub"`.

### Task 4: Community, groups and connector playbook (Community lead)

**Files:**
- Create: `ops/connector-playbook.md`

- [ ] **Step 1:** Check current WhatsApp Community and group limits and note them at the top of the playbook.
- [ ] **Step 2:** Create the Community "Sports Connect" with its announcements group, and one group per seeded town and sport (towns and sports from the data lead, Task 5). Set groups so only admins can edit group info; keep everyone free to post intros.
- [ ] **Step 3:** In every group pin the intro template: `Name: / Sport: / Position: / Level (beginner, club, competitive):`.
- [ ] **Step 4:** Write into the playbook: the rota (names and hours), three reply templates (welcome and point to a listing; no match yet; how to suggest a group), the weekly re-check steps, and the rule that listings are posted by the team only.
- [ ] **Step 5:** Done when all four team members are admins in every group, the playbook is pinned in the team chat, and a test newcomer (a friend) can join from the invite link and post an intro.

### Task 5: Admin outreach and listings spreadsheet (Data lead)

**Files:**
- Create: `ops/admin-outreach.md`
- Update: `data/listings.csv`

- [ ] **Step 1:** Pick 2–3 towns and the sports to seed (with the team) in the first 2 hours.
- [ ] **Step 2:** Write `ops/admin-outreach.md`: a short message and call script that explains the idea, asks permission to list the group, and records what contact the admin approves.
- [ ] **Step 3:** Contact admins and fill `data/listings.csv`. Set `consent` to `yes` only when the admin has agreed. Set `verified_on` to the date of the call.
- [ ] **Step 4:** Run `python tools/listings_to_message.py data/listings.csv` once Task 1 is done. Fix any problems it prints.
- [ ] **Step 5:** Done when there are 30–50 consented listings across the seeded towns. Update `hub/groups.json` with each group's invite link.

### Task 6: Pin listings and soft launch (Community lead, with Coder)

- [ ] **Step 1:** Run the script and paste each (town, sport) section into its group; pin it.
- [ ] **Step 2:** Share the Community link in personal chats of at least 20 real athletes outside the team.
- [ ] **Step 3:** Connectors reply to every intro the same day, using the playbook templates.
- [ ] **Step 4:** Log in a shared note: intros received, replies sent, and athletes who say they attended a run or practice.
- [ ] **Step 5:** Done when real people outside the team have joined at least two town groups and received replies.

### Task 7: Poster, pitch and audience plan (Pitch lead, with Coder)

- [ ] **Step 1:** Use `tools/make_qr.py` with the hub URL to create the QR, then lay out a one-page poster with the QR, a line in English, and the Community invite link.
- [ ] **Step 2:** Write a 3-minute pitch: the newcomer's problem, the live groups, one real athlete's story, and the plan to reach more athletes through schools, clubs, federations and social media.
- [ ] **Step 3:** Rehearse the demo: join from the QR on a phone, post an intro, receive a connector reply, and show a pinned listing with its verified date.
- [ ] **Step 4:** Done when the demo runs end to end on a phone using mobile data, twice in a row.

---

## Self-review

- **Spec coverage:** hub structure (Task 4), newcomer flow and intro template (Tasks 4, 6), listings with verified date and consent (Tasks 1, 5), connector rota (Task 4), link hub, script and QR (Tasks 1–3), success measures (Tasks 5–7). Weekly re-check is in the playbook (Task 4). The poster is English only (Task 7); no translation is planned.
- **Types:** `Listing`, `parse_listings`, `format_message` and `main` are defined in Task 1 and used only there. `groups.json` shape is defined in Task 3 and filled in Task 5.
