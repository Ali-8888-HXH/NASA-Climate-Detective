# NASA Climate Detective

An interactive, NASA-based climate investigation platform developed for the **NASA Space Apps Challenge**. Users explore real climate and Earth observation data through guided cases, visual evidence, and investigative activities.

## Cases

- **Case 01 — The Vanishing Ice:** Investigate changes in Arctic sea ice.
- **Case 02 — The Missing Wheat:** Examine environmental conditions and wheat-yield changes in six Indian states during 2022.
- **Case 03 — The Warming World:** Explore historical global temperature anomalies and warming patterns.

## Technologies

- **Frontend:** HTML, CSS, JavaScript
- **Libraries:** Tailwind CSS, Chart.js, Papa Parse
- **Research and data analysis:** Python, Google Earth Engine
- **Data:** NASA Earth observation datasets and supporting scientific records

## Run Locally

Clone the repository and open a terminal in its root directory:

```bash
python -m http.server 8000
```

Visit **http://localhost:8000** in your browser.

Use a local HTTP server rather than opening `index.html` directly.

## Deployment

The project is a static website and can be deployed using Netlify or another static hosting service.

For Netlify, use the repository root (`.`) as the publish directory. No build command or backend is required.

## Project Goal

Make climate science more accessible through interactive storytelling, real-world evidence, and guided investigation. The platform encourages users to explore data, question explanations, and draw evidence-based conclusions.
