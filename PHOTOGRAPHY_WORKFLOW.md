# Photography workflow

The website treats each shoot or trip as a collection folder. GitHub Actions
rebuilds `photography/collections.json` whenever `main` is updated, so the HTML
does not need to be edited when photographs are added.

## Lightroom export

- Export in sRGB.
- Use JPEG at roughly 80–90 quality.
- Limit the long edge to about 2400 px for normal gallery photographs.
- Keep gallery photographs in the crop that suits the frame: horizontal,
  vertical, square, 4:5, 3:4, 5:7, or another proportion.
- Make a separate `cover.jpg` cropped to 5:7. The Polaroid cover is the only
  image the website deliberately crops.
- Name gallery files in viewing order: `001.jpg`, `002.jpg`, `003.jpg`, and so
  on.

## Folder structure

```text
photography/
  collections/
    trips/
      maryland-2026/
        collection.json
        cover.jpg
        001.jpg
        002.jpg
      bandhavgarh/
        collection.json
        cover.jpg
        001.jpg
    everyday/
      street/
        collection.json
        cover.jpg
        001.jpg
    portraits/
      jane-doe-graduation/
        collection.json
        cover.jpg
        001.jpg
```

For a new collection, duplicate an existing folder, rename it, and edit its
`collection.json`. Use a lowercase hyphenated slug such as
`jane-doe-graduation`.

Optional captions and alt text go in the `captions` object:

```json
{
  "captions": {
    "001.jpg": "A person crossing a rain-soaked street in Baltimore",
    "002.jpg": "Late afternoon light along the harbor"
  }
}
```

## Preview locally

```bash
make photos
make serve
```

Then visit <http://localhost:8000>. The browser uses each gallery image's
natural dimensions, so portrait and landscape exports retain their proportions
and flow into the exhibition layout without being cropped.

## Publish

GitHub Pages should be configured once with **Settings → Pages → Source →
GitHub Actions**. After that, the normal publishing workflow is:

```bash
git add .
git commit -m "Add Maryland photography collection"
git push
```

The deployment workflow runs on pushes to `main`. On another branch, open a
pull request and merge it into `main` when the preview is ready.
