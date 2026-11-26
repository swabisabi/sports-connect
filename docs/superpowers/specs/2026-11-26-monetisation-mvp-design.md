# Sports Connect: First Game Pass MVP (24 hours)

Status: Approved 2026-11-26

## Intent and why

Earn money in a way athletes understand, cover running costs, and show hackathon judges a working product with real payments if possible. A satisfied athlete refers others.

## Goals

- Live MVP, demonstrable end to end on a phone.
- First Game Pass bookable from the hub.
- Sponsor space on hub and poster.
- A 3-minute pitch with real numbers.

## Non-goals

Online payment integration, accounts, Whop, new towns or sports, Swahili, Game Day sessions.

## Anti-goals

- Fake sponsors, users, payments or testimonials.
- Charging to join groups or see listings.
- Taking money without a named admin willing to receive the athlete.
- Payments from under-18s without a parent or guardian.

## Offer

- **Free:** groups and listings.
- **First Game Pass, KSh 200 once:** a connector matches by sport and level, tells the admin, and gets the athlete into a session within 7 days. No session offered within 7 days: money back.
- **Referral:** KSh 50 for each friend who buys a pass and attends. One level only.
- **Payment:** M-Pesa to a business till, confirmed by hand. Team checks till requirements and charges.
- Never promise team selection.

## Other revenue

- Founding sponsor strip (proposed KSh 7,500 per month, untested). A name appears only after a written yes.
- Featured listings: one pitch slide only, labeled as the next stage.

## Approaches

- **Sponsor then featured listings only** (athletes free): little convincing of athletes, but depends on backers.
- **First Game Pass plus sponsor and featured:** athletes pay for a result; needs hand follow-up. **Chosen by the team.**
- **Weekly Game Day (KSh 200 per session, split with host):** recurring and larger, but needs venues and sessions. Proposed, not chosen.
- Whop with affiliates, memberships, joining fees: rejected (fees, retention, easy bypass).

## Design

Hub gains a pass card (hidden until till number and booking number are set) and a sponsor strip. The athlete pays, enters name, sport, age group, M-Pesa code and optional referrer, and the page opens a WhatsApp message to the team. Nothing is stored by the page. Payments are tracked in a local sheet that is never committed.

## Costs (assumptions)

Data 4,000, printing 1,500, contingency 1,000: KSh 6,500 per month. Team time unpaid.

## Name and address

"Sports Connect", on its own GitHub Pages address. If the new repository is not working by hour 3, the team chooses between the old address with the new name, or demoing the old page.

## Done when

Two clean demo runs in a row on mobile data.

## Change 2026-11-26: membership packages at sign-up

Requested by the team. The hub is now a sign-up: name, age group and sports, then Free Community (KES 0, added by the builder so joining stays free), Basic (KES 300-500), Advanced (KES 1,000-1,500) or Premium Training (KES 2,500-4,000) per month. Paid packages register interest only; no money is taken until coaches and sessions exist. The sign-up is sent on WhatsApp; nothing is stored by the page. The First Game Pass stays hidden.
