# Sports Connect — Design

Date: 2026-11-25
Status: Draft for approval (revised: WhatsApp hub)

## Intent and why

Athletes in Kenya who move to a new town (work, school, family) usually have no network. Teams, pickup runs, clubs and leagues already exist there, but newcomers can't see them and the groups can't reach newcomers. The gap is discovery and outreach, not a shortage of teams.

We are building a front door on WhatsApp, where athletes already are. A newcomer joins one WhatsApp Community through a single link, lands in the group for their town and sport, and is welcomed and pointed to real, verified local communities by a human connector. The goal is that within a day or two of arriving, the athlete has made contact with a community without needing a friend to introduce them.

Context: a 72-hour hackathon in Kenya. Team of four, one coder. Starts with basketball as the lead example; the product covers any sport. The team's group suggested WhatsApp as the home of the product.

## Goals

- A newcomer joins with one link and finds their town and sport group in under a minute.
- A connector replies to a new intro and points them to a specific community, ideally the same day.
- Every listing shown is real, agreed to by its admin, and carries a last-verified date.
- Works on cheap phones and weak connections, with no app install and no account.
- The demo shows live groups with real members and real listings, not placeholders.
- Groups are asked to host a monthly newcomers' session, so a newcomer always has a welcoming first day to aim for. We ask existing groups; we do not host regular games ourselves.
- One shareable link and a QR poster, so it can spread through schools, clubs, federations and social media.

## Non-goals

- Our own app, website with search, accounts, or logins.
- A WhatsApp bot or API integration.
- Collecting age, weight, diet or fitness goals, or giving nutrition advice.
- Open crowdsourced listing by anyone.
- Payments, ranking, scouting, match-making algorithms.

## Anti-goals (a failure even if it technically works)

- Empty or stale groups. A listing nobody has checked recently is worse than none.
- Success counted as members or clicks. The real measure is an athlete showing up at a run or practice.
- Exposing someone's phone number without consent.
- Becoming a noisy general chat. Groups stay useful: listings from the team, intros from newcomers.
- A hub that depends on one tired person. The connector role must be shared.

## Constraints

- 72 hours, four people, one coder. Most of the work is people work: data collection, welcoming, verifying.
- Users: low-end phones, patchy data, English-speaking athletes (English only; no translation planned).
- WhatsApp Community and group size limits and features change; the builder checks current limits before setting up groups.
- No WhatsApp Business API approval is available in the time.

## Approaches considered

- **A. WhatsApp bot.** Widest reach in theory, but API approval takes days; in 72 hours it runs only on a test setup with a few pre-registered numbers. Rejected.
- **B. Mobile web app with a directory.** Safe for one coder and easy to demo, but the team preferred to meet athletes inside WhatsApp, and a web page adds a step. Rejected for this round; it can be added later.
- **C. Crowdsourced listings.** Starts empty and unverified, which is the main anti-goal. Rejected.
- **D. Human-run WhatsApp hub with light supporting tools (chosen).** No approvals needed, real athletes can use it on day one, and the coder's tools make it faster to run and easier to show.

Chosen: **D**, by the team, because it follows the team group's suggestion, reaches athletes where they already are, and can be live and used within the hackathon.

## Design

**Structure.**
- One WhatsApp Community, "Sports Connect", with an announcements group for news and new-town openings.
- One group per town and sport, such as "Nakuru Basketball". Seed only the towns and sports the team can verify (see Open for the team).
- Each town group's pinned message holds the verified listings.

**Newcomer flow.**
1. They find the Community link (poster QR, school or club chat, social post).
2. They join and open their town and sport group.
3. They post a short intro using the template: name, sport, position, level.
4. A connector replies, welcomes them, and points them to a specific run, practice or league from the listings, or to the group admin.

**Intro template** (pinned in every group):
`Name: / Sport: / Position: / Level (beginner, club, competitive):`

**Listings.** Each listing in the pinned message has: group or event name, type (pickup, practice, club, league), when, level, and one contact (a group invite link, or an admin's number only if consent is confirmed). Each carries "verified <date>". Only team members post or edit listings; newcomers post intros only.

**Connector role.** A rota across the four team members. Target: reply to each new intro the same day. A short list of reply templates keeps this fast.

**Supporting tools (the coder's work).**
1. A one-page link hub listing each town and sport group's join link, mobile-first and light, hosted as a static page (Cloudflare Pages, since the repo already uses wrangler).
2. A script that turns the team's listings spreadsheet into the formatted pinned-message text, with the verified date, ready to paste.
3. A QR code and poster for the Community link.
These are helpers. The product still works without them.

**Trust and privacy.** A number or link is listed only after its admin agrees. Listings older than a set age are marked or removed at a weekly re-check. Intros in the groups use only name, sport, position and level.

## Success at the hackathon

- 30–50 verified listings across 2–3 towns, with real admins' consent.
- Town groups live with real members from outside the team.
- Stretch: at least a few athletes reach a listed run or practice before the demo.

## Left to the builder

- Group names and exact wording of the pinned messages and reply templates.
- Exact stack and styling of the link hub and script.
- The staleness cutoff for listings.

## Open for the team

- Which 2–3 towns and which sports to seed first. This decides who calls admins on day one.
- App name.
- Who is on the connector rota and their hours.

## Change 2026-11-26: intro form

The team replaced the intro fields (name, sport, position, level) with **name, age group (13-17, 18-35, 36+) and sports**, filled in with tick boxes on the hub page. The form builds text the newcomer copies into their group; nothing is stored or sent by the page. This supersedes the "name, sport, position, level" wording and the age non-goal above (age *group* only; weight, goals and nutrition stay out). Teenagers are asked to involve a parent, guardian or coach.
