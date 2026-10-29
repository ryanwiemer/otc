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
index.html            Home
about/                Our story
weekly-runs/          Weekly runs
otc-events/           Events
membership/           Contact and membership
css/style.css         Styles (colors and fonts are variables at the top)
js/main.js            Header, mobile menu, Instagram feed, photo lightbox
images/               Images
```

## Editing

- Edit page text directly in each `index.html`.
- **Weekly runs and events:** each one is an `<article>` block. Copy a block to add one, or delete it to remove one.
- **Header and footer:** these are repeated in every page, including `404.html`. Update them all when changing either.
- **Instagram feed:** set `INSTAGRAM_FEED_URL` in `js/main.js` to a [Behold](https://behold.so) JSON feed URL.
  Without it, the footer shows a link to Instagram instead.
