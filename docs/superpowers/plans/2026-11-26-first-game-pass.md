# First Game Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In 24 hours, sell and honour a KSh 200 First Game Pass from the Sports Connect hub and pitch it with real numbers.

**Architecture:** The static hub gains one script, `hub/pass.js`, that builds a booking message and opens WhatsApp; payment is a manual M-Pesa till. Tracking and follow-up are people work with a local CSV.

**Tech Stack:** Plain HTML/JS, Node `assert` tests, Python `reportlab` and `segno` for the poster, WhatsApp, M-Pesa.

**Spec:** `docs/superpowers/specs/2026-11-26-monetisation-mvp-design.md`

## Global Constraints

- Pass price **KSh 200**, once. Refund if no session is offered within **7 days**. Referral **KSh 50** per friend who buys and attends, one level.
- Joining groups and seeing listings stays free.
- The pass card shows only when both the till number and booking number are set. No placeholder numbers.
- A sponsor name appears only after a written yes. Otherwise: `Founding sponsor space: open`.
- Under-18s: parent or guardian agreement required.
- Never promise team selection.
- `data/passes.csv` and `data/listings.csv` are never committed (public repository).
- English only. Pushing and deploying need the team's go-ahead each time.

## Review Focus

1. Till or booking number missing or invalid: the pass card stays hidden.
2. Teenager without guardian agreement: no booking message.
3. Names with newlines, `&`, `#`, `%`: one line each, correctly encoded in the link.
4. Booking number typed as `07..`, `01..`, `+254..` or with spaces: normalised; anything else rejected.
5. Missing name, sport, age group or M-Pesa code, or a malformed code: no message, clear prompt.

---

## Needed from the team (hour 0)

- M-Pesa till number, and the WhatsApp number that receives bookings (its owner agrees to it being public).
- Written yes from at least one admin to receive pass holders.
- The new repository address.

## Timeline

| Hours | Tasks |
|---|---|
| 0–3 | 1, 4 (admins), 5 starts |
| 3–9 | 2, 3, 5 |
| 9–13 | 6, 5 |
| 13–18 | Sleep in shifts; one person on replies |
| 18–22 | 7 |
| 22–24 | Freeze, backup video |

## File Structure

- `hub/pass.js` (new): config constants and booking logic.
- `hub/index.html` (modify): pass card and sponsor strip.
- `tests/test_pass.js` (new).
- `tools/make_poster.py` (modify).
- `ops/pass-playbook.md` (new), `ops/pitch-and-poster.md` (modify).
- `data/passes.example.csv` (new), `.gitignore` (modify).

---

### Task 1: Address and name (Coder, with team lead)

- [ ] **Step 1:** Confirm `git ls-remote https://github.com/swabisabi/sports-connect.git` succeeds.
- [ ] **Step 2:** If it does, create a clean copy in a new folder with `index.html`, `*.js`, `groups.json` at the root, plus `tools/`, `tests/`, `ops/`, `docs/`, `data/*.example.csv`. Empty the rota names. Fix test paths. Check that no real phone number except the agreed booking number appears.
- [ ] **Step 3:** After go-ahead, push; team enables Pages (branch `main`, root).
- [ ] **Step 4:** Verify `curl -s https://swabisabi.github.io/sports-connect/` shows `<title>Sports Connect</title>`.
- [ ] **Step 5:** If not working by hour 3, ask the team to choose the fallback in the spec. Later tasks apply to whichever folder is live.

### Task 2: Pass card and sponsor strip (Coder)

**Files:** Create `hub/pass.js`, `tests/test_pass.js`; modify `hub/index.html`.

**Interfaces (produces):**
- Constants `TILL_NUMBER = ""`, `BOOKING_NUMBER = ""`, `SPONSOR_NAME = ""`
- `normalizePhone(raw: string): string | null` returns `254` followed by `7` or `1` and 8 digits
- `passAvailable({till, phone}): boolean` (till: 5 to 7 digits)
- `buildBooking({name, sport, ageGroup, guardianOk, mpesaCode, referrer}): string | null` (code: 10 letters or digits, upper-cased; `referrer` optional)
- `bookingLink(phone: string, text: string): string | null` returns `https://wa.me/<number>?text=<encoded>`
- `sponsorText(name: string): string`

- [ ] **Step 1: Write the failing test** `tests/test_pass.js`:

```js
const assert = require("node:assert");
const p = require("../pass.js");
const base = { name: "Brian", sport: "Football", ageGroup: "Young adult (18-35)", mpesaCode: "qab1c2d3e4" };

for (const raw of ["0712 000 000", "+254712000000", "254-712-000-000"])
  assert.strictEqual(p.normalizePhone(raw), "254712000000");
assert.strictEqual(p.normalizePhone("0112000000"), "254112000000");
for (const raw of ["", "12345", "0812000000", "07120000001"]) assert.strictEqual(p.normalizePhone(raw), null);

assert.strictEqual(p.passAvailable({ till: "", phone: "0712000000" }), false);
assert.strictEqual(p.passAvailable({ till: "123456", phone: "" }), false);
assert.strictEqual(p.passAvailable({ till: "123456", phone: "0712000000" }), true);

assert.strictEqual(p.buildBooking({ ...base, referrer: "Amina" }),
  "First Game Pass booking\nName: Brian\nSport: Football\nAge group: Young adult (18-35)\nM-Pesa code: QAB1C2D3E4\nReferred by: Amina");
for (const key of ["name", "sport", "ageGroup", "mpesaCode"])
  assert.strictEqual(p.buildBooking({ ...base, [key]: "" }), null);
assert.strictEqual(p.buildBooking({ ...base, mpesaCode: "abc" }), null);
const teen = { ...base, ageGroup: "Teenager (13-17)" };
assert.strictEqual(p.buildBooking(teen), null);
assert.ok(p.buildBooking({ ...teen, guardianOk: true }).includes("Parent/guardian agrees: yes"));
assert.strictEqual(p.buildBooking({ ...base, name: "A\nSport: x" }).split("\n").length, 5);

const link = p.bookingLink("0712000000", "A & B #1 100%\nx");
assert.strictEqual(link, "https://wa.me/254712000000?text=A%20%26%20B%20%231%20100%25%0Ax");
assert.strictEqual(p.bookingLink("bad", "x"), null);

assert.strictEqual(p.sponsorText(""), "Founding sponsor space: open");
assert.strictEqual(p.sponsorText(" Acme "), "Supported by Acme");
console.log("pass tests ok");
```

- [ ] **Step 2:** Run `node tests/test_pass.js`. Expected: FAIL, cannot find module.
- [ ] **Step 3:** Implement `hub/pass.js` to the interfaces; collapse whitespace in text fields. In the browser, unhide the card only when `passAvailable` is true. On a missing field show `Fill in every box and your M-Pesa code.` Show the message in a copyable box as well as the WhatsApp button.
- [ ] **Step 4:** Add to `index.html` a hidden `<section id="pass">` after the groups, with this copy: `First Game Pass: KSh 200, once. We get you into a session within 7 days, or your money back. Bring a friend: KSh 50 for each friend who buys a pass and attends.` Include `Pay to till <number>`, fields for name, sport, age group, guardian tick box (teenagers), M-Pesa code, referrer. Add a `<p id="sponsor">` strip at the bottom and load `pass.js`.
- [ ] **Step 5:** Run `node tests/test_pass.js && node tests/test_hub.js`. Expected: `pass tests ok`, `hub tests ok`.
- [ ] **Step 6:** Preview with empty constants (no card) and with test values locally (card shows); restore real or empty values.
- [ ] **Step 7:** Commit `feat: First Game Pass booking and sponsor strip`. Ask before deploying.

### Task 3: Poster (Coder)

**Files:** Modify `tools/make_poster.py`, `ops/poster.pdf`, `ops/hub-qr.svg`, `ops/hub-qr.png`.

- [ ] **Step 1:** Set `HUB_URL` to the live address from Task 1. Add the lines `Guaranteed first game: First Game Pass, KSh 200` and `Founding sponsor space: open`.
- [ ] **Step 2:** Run `python tools/make_poster.py ops/poster.pdf`, remake both QR files with the same URL, render the page to an image and confirm nothing overlaps.
- [ ] **Step 3:** A teammate scans the QR on a phone. Expected: the live hub opens.
- [ ] **Step 4:** Commit `feat: poster with First Game Pass`.

### Task 4: Pass playbook and tracking (Data and Community leads)

**Files:** Create `ops/pass-playbook.md`, `data/passes.example.csv`; modify `.gitignore` (add `data/passes.csv`).

- [ ] **Step 1:** Header: `date,name,sport,age_group,guardian_ok,mpesa_code,payment_checked,referrer,session_offered_on,attended,refunded,referral_paid`.
- [ ] **Step 2:** Playbook steps: check the code against the till statement before replying; reply the same day; confirm session, time and a named person to meet; no offer by day 7 means refund; pay KSh 50 only after the friend attends; teenagers: speak to the parent or guardian.
- [ ] **Step 3:** Include the after-session message: `How was your first game? Know someone who plays? You get KSh 50 for each friend who buys a pass and attends.`
- [ ] **Step 4:** Get written admin yes for pass holders; note which groups agreed. Sell the pass only for those sports.
- [ ] **Step 5:** Done when one test booking has gone through the whole playbook. Commit the playbook and example only.

### Task 5: Sell and recruit (Community and Pitch leads)

- [ ] **Step 1:** Once Task 2 is live, offer the pass personally to 10 newcomers outside the team.
- [ ] **Step 2:** Ask 5 possible sponsors; record each answer.
- [ ] **Step 3:** Tally offered, paid, session offered, attended, referred, refunded.
- [ ] **Step 4:** If nobody has paid by hour 12, ask three of them why and write down their words.

### Task 6: Pitch (Pitch lead)

**Files:** Modify `ops/pitch-and-poster.md`.

- [ ] **Step 1:** Five slides: problem; live demo; real numbers; money (pass, sponsor, featured as next stage, KSh 6,500 monthly cost); next steps.
- [ ] **Step 2:** Pitch line: `Finding a team is free. Getting to your first game within a week costs KSh 200, or you get it back.`
- [ ] **Step 3:** Label every projection "assumption". Done when it runs in 3 minutes.

### Task 7: Rehearse and freeze (Everyone)

- [ ] **Step 1:** On mobile data: scan, intro form, join group, pinned listing, pass booking message, connector confirmation.
- [ ] **Step 2:** Two clean runs in a row.
- [ ] **Step 3:** Record a backup video and screenshots, then make no more changes. Don't show anyone's phone number or M-Pesa code in them.

## Self-review

Spec offer, referral, sponsor, featured slide, costs, name and address, teen rule and done-when each map to Tasks 1–7. `pass.js` names are used only in Task 2.
