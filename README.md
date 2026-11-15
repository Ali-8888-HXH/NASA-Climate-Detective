# NASA Climate Detective — The Missing Wheat

This repository contains the research materials and static web experience for the NASA Space Apps Climate Detective case **The Missing Wheat**. The investigation examines environmental conditions in six wheat-producing Indian states during February–April 2022 and compares them with official state wheat-yield records. It presents evidence and uncertainty; it does not claim that climate conditions alone caused yield changes or export restrictions.

## Project contents

- `index.html`, `style.css`, `script.js`, `case02.js` — static browser application. Case 02 is a seven-phase guided investigation; Cases 01 and 03 remain available.
- `data/case02/` — the compact, curated GeoJSON, CSV, and JSON files required by Case 02. These files are part of the website deployment, so visitors do not need access to this research workspace or a local data folder.
- `00_metadata/` through `09_app_data/` — research metadata, source data, analysis outputs, reports, and curated app data. These are research materials; Netlify does not need to process them to serve the app.
- `08_scripts/` — reproducible research and Earth Engine scripts.

## Run the website locally

From the repository root, start any static HTTP server. For example, with Python:

```powershell
python -m http.server 8000
```

Open <http://localhost:8000>. Keep the server window open. Opening `index.html` directly as a `file://` URL is not supported because the browser fetches the Case 02 data files over HTTP.

The page uses CDN-hosted Tailwind CSS, Papa Parse, and Chart.js. An internet connection is needed for those libraries. Case 02 research data is loaded from the bundled `data/case02/` files when the case opens; no backend, API key, or Hugging Face login is required.

## Deploy the static website to Netlify

The publish directory is the repository root: `index.html` is at the root, and the site also needs `style.css`, `script.js`, `case02.js`, `assets/`, and `data/case02/`.

1. Push the branch containing the website files to the Git provider connected to Netlify.
2. In Netlify, choose **Add new site → Import an existing project** and connect the repository.
3. Select the branch to deploy (for example, `wheat_case`).
4. Set **Build command** to blank/no build command and **Publish directory** to `.` (the repository root). Do not set `data/case02/` as the publish directory.
5. Deploy. Netlify will provide a public `https://…netlify.app` site URL. Open it and test Case 02; the visitor only needs this link.

For a quick one-off preview, Netlify Drop can publish a folder of website files. Include `index.html`, the three shared app files, `case02.js`, the complete `assets/` directory, and the complete `data/case02/` directory while preserving their folder structure. Git-connected deployment is preferable for updates.

## Before pushing or deploying

Review the staged changes before committing. This is a research workspace as well as a website repository, and it may contain large raw datasets and intermediate analysis outputs that are not needed for the web app. Commit only the materials intended for the repository and deployment. In particular, never commit `.dodsrc` if it contains Earthdata credentials or other secrets; `.gitignore` excludes it for future additions, but a file already staged still needs to be removed from the Git index before committing. Do not upload credentials, raw satellite imagery, or unrelated research files to a public web deployment.

For the website alone, the required app paths are `index.html`, `style.css`, `script.js`, `case02.js`, `assets/`, and `data/case02/`. Include `README.md` for project and deployment instructions.

## Research sources and interpretation

Case 02 uses NASA POWER `T2M_MAX` temperature and `PRECTOTCORR` precipitation (MERRA-2 corrected; not GPM IMERG), NASA MODIS/Terra MOD13A1 NDVI/EVI, a fixed 2020 MapSPAM wheat-area weighting layer, official Government of India wheat-yield statistics, and six-state boundaries. Data sources, units, schemas, and key caveats are described in `data/case02/README.md` and `09_app_data/README.md`.

State-level averages can hide local conditions. Satellite NDVI/EVI describe vegetation greenness, not grain yield. The MapSPAM wheat mask is a static 2020 reference. Irrigation and soil moisture are not measured. Associations between environmental conditions and yield do not establish causation.
