# abhiman-gupta-dot-com

Personal website for Abhiman Gupta.

## Local preview

```bash
make serve
```

Then open <http://localhost:8000>.

Photography collections are folder-driven. See
[`PHOTOGRAPHY_WORKFLOW.md`](PHOTOGRAPHY_WORKFLOW.md) for the Lightroom export,
collection, preview, and GitHub Pages workflow.

## Google Analytics

The GitHub Pages build adds Google Analytics 4 when the repository variable
`GA_MEASUREMENT_ID` is set to the site's public measurement ID (for example,
`G-ABC123DEF4`). Local previews do not load Analytics, which keeps development
traffic out of reports.

The deployed tag enables standard analytics while disabling advertising
storage, Google Signals, and ad-personalization signals.
