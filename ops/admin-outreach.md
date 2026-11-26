# Admin outreach (Data lead)

Seed towns and sports (decide in the first 2 hours): ______

## First message (WhatsApp)
> Hi [name], I'm [you] from Sports Connect. We help athletes who've just moved to a new town find teams and runs. Could we list [group name] so newcomers can find you? We'd show the name, when you play, the level, and one contact you choose. Nothing is listed unless you say yes.

## Call script
1. Say who you are and the one-line idea.
2. Ask: when does the group play, and what level?
3. Ask: which contact should we show, the group invite link or your number?
4. Ask clearly: "Do we have your permission to list this?" Only a yes counts.
5. Tell them we'll check back weekly to keep the listing current.

## Recording (data/listings.csv)
`town,sport,name,type,when,level,contact,consent,verified_on`
- `type`: pickup, practice, club, or league.
- `consent`: `yes` only after the admin agrees; otherwise `no`.
- `verified_on`: today's date, `YYYY-MM-DD`.
- Also add the group's invite link to `groups.json`:
  `{"town": "...", "sport": "...", "name": "...", "join_url": "https://chat.whatsapp.com/..."}`

Target: 30 to 50 consented listings across the seeded towns.

## Newcomer sessions (decision: ask existing groups, don't host ourselves)
Ask every admin a second, separate question: "Would you be willing to host a monthly newcomers' session?"
- A group can be listed without agreeing to host. Record the two answers separately.
- If they agree, put it in the listing's `when` column, e.g. `Sat 4pm; newcomers welcome 1st Sat`.
- We host a one-off open run ourselves only if an admin says a sport is dying in a town.

### Short message (English)
Hi [name], I'm [your name] from Sports Connect. We help athletes new to a town find teams and runs. Can we list [group name] so newcomers can find you? We'd show your group name, when you play, the level, and one contact you choose. Nothing is listed unless you say yes.

If yes, please reply with: day and time, level, and whether to share your group link or your number. Would you also be willing to host a monthly newcomers' session? Thanks!
