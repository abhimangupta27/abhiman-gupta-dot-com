# Photography workflow

## The short version

The site has two photography collections: **Trips** and **Portraits**. Add
photographs directly to the appropriate folder; do not make a subfolder for a
particular trip, place, or person.

```text
photography/collections/trips/
photography/collections/portraits/
```

Add the photographs to that folder in the order you want them displayed:

```text
cover.jpg
picture 1.jpg
picture 2.jpg
picture 3.jpg
```

The next local build or website publish automatically finds the photographs
and puts them in that filename order. You do not need to add each photograph to
the website by hand. Numbered names are sorted naturally, so `picture 10.jpg`
comes after `picture 9.jpg`, not after `picture 1.jpg`.

Each of those two folders already contains its `collection.json`; normally you
only need to add or remove photographs.

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
- Name gallery files in viewing order. Either `001.jpg`, `002.jpg`, `003.jpg`
  or `picture 1.jpg`, `picture 2.jpg`, `picture 3.jpg` works.

## Folder structure

```text
photography/
  collections/
    trips/
      collection.json
      cover.jpg
      picture 1.jpg
      picture 2.jpg
    portraits/
      collection.json
      cover.jpg
      picture 1.jpg
      picture 2.jpg
```

Do not add another folder inside `trips` or `portraits`. The collection scanner
reads the image files placed directly in those folders.

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

`make photos` is the fetch step: it rescans all collection folders and updates
the photography manifest used by the site.

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
