# Sports Connect

New in town? Find your team. A sign-up web page that leads athletes into WhatsApp sport groups.

- Web app: `index.html`, `*.js`, `groups.json` (repository root, for GitHub Pages)
- Tools: `python tools/listings_to_message.py data/listings.csv`, `python tools/make_poster.py ops/poster.pdf`
- Team documents: `ops/`
- Tests: `python -m pytest tests -q` and `node tests/test_signup.js` (also `test_hub.js`, `test_pass.js`)

Never commit `data/listings.csv` or `data/passes.csv`: they hold personal contacts.
