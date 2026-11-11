# Oakland Track Club

Website for [Oakland Track Club](https://www.oaklandtrackclub.org), a running club in Oakland, CA.

It's plain HTML, CSS and a little JavaScript, with no build step or dependencies. It's hosted on GitHub Pages from `main`.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Structure

```
index.html            The whole site: one page with Home, Weekly Runs (#weekly-runs),
                      Events (#events) and Contact and Membership
                      (#membership) sections
about/, weekly-runs/, otc-events/, membership/
                      Redirects from the old page URLs to the page/sections above
css/style.css         Styles (colors and fonts are variables at the top)
js/main.js            Header, mobile menu, Instagram feed
images/               Images
```

## Editing

- Edit page text directly in `index.html`.
- **Weekly runs and events:** each one is an `<article>` block. Copy a block to add one, or delete it to remove one.
- **Header and footer:** these also appear in `404.html`. Update both when changing either.
