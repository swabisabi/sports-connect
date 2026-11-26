# Connector playbook

**Before creating groups:** check WhatsApp's current Community and group size limits and note them here: ______

## Setup checklist (Community lead)
- [ ] Create Community "Sports Connect" with its announcements group.
- [ ] One group per seeded town and sport (e.g. "Nakuru Basketball").
- [ ] All four team members are admins in every group.
- [ ] Group info editable by admins only; everyone can post intros.
- [ ] Pin this intro template in every group:
  `Name: / Age group (13-17, 18-35, 36+): / Sports:` (the hub form builds this for newcomers)
- [ ] Teenagers: check that a parent, guardian or coach is involved before sharing any admin's number.
- [ ] Put the Community invite link in `COMMUNITY_URL` at the top of `hub.js` (shown on the hub until groups are listed).
- [ ] A friend outside the team joins from the invite link and posts an intro.

## Rules
- Only team members post or edit listings. Newcomers post intros.
- A number or link is listed only after its admin agrees.
- Reply to every new intro the same day.

## Rota
| Day | Morning | Evening |
|---|---|---|
| Day 1 | | |
| Day 2 | | |
| Day 3 | | |

## Reply templates
**Welcome and point to a listing**
> Karibu [name]! Glad to have you in [town]. Here's one that fits your level: [listing name], [when]. Join here: [link]. Tell them [name] from Sports Connect sent you.

**No match yet**
> Karibu [name]! We don't have a [sport] listing for your level in [town] yet. We're asking around and will message you as soon as we find one. Know a run or team nearby? Tell us.

**Suggest a group**
> Thanks! Can you share the group name, when it plays, and the admin's name? We'll ask them if we can list it.

## Weekly re-check
- [ ] Open `data/listings.csv`. For each row verified more than 7 days ago, message the admin and update `verified_on`.
- [ ] Run `python tools/listings_to_message.py data/listings.csv` and re-pin the output in each group.
- [ ] Remove any listing whose admin no longer agrees (set `consent` to `no`).
