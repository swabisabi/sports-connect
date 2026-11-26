# First Game Pass playbook

KSh 200, once. A session within 7 days or money back. KSh 50 to the referrer for each friend who buys a pass and attends (one level). Joining groups and seeing listings stays free. Never promise team selection.

## Before selling (Data and Community leads)
- [ ] M-Pesa till set up; charges checked: ______
- [ ] Booking WhatsApp number chosen; its owner agrees it is public.
- [ ] Written yes from an admin to receive pass holders. Sell only these sports:
  | Sport | Admin said yes on |
  |---|---|
  | | |
- [ ] Fill in `TILL_NUMBER`, `BOOKING_NUMBER` and `PASS_SPORTS` at the top of `pass.js`, then redeploy.
- [ ] Copy `data/passes.example.csv` to `data/passes.csv` (stays on your computer, never committed).

## Each booking
1. Check the M-Pesa code against the till statement. The message alone is not proof of payment. Reject a code already in the sheet.
2. Reply the same day.
3. Teenagers (13-17): speak to the parent or guardian before arranging anything. If they don't agree, or can't be reached by day 7, refund the money.
4. Tell the admin, then confirm to the athlete: session, time, place and a named person to meet.
5. No session offered by day 7: refund, and mark `refunded`.
6. After the session mark `attended` and send:
   > How was your first game? Know someone who plays? You get KSh 50 for each friend who buys a pass and attends.
7. Pay KSh 50 only after the referred friend attends; mark `referral_paid`.

## Tally for the pitch
Offered: ___  Paid: ___  Session offered: ___  Attended: ___  Referred: ___  Refunded: ___

## Practice run
- [ ] One test booking goes through every step above.
