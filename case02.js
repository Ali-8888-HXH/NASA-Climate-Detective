// Case 02 is an evidence-led, browser-only investigation. Its compact data
// files ship with the static site and load only when the player opens the case.
const CASE02_STATES = ['Uttar Pradesh', 'Madhya Pradesh', 'Punjab', 'Haryana', 'Rajasthan', 'Bihar'];
const CASE02_STATE_COLORS = ['#22d3ee', '#34d399', '#fbbf24', '#a78bfa', '#fb7185', '#60a5fa'];
const CASE02_FILES = [
    { key: 'boundaries', file: 'six_states_boundary.geojson', kind: 'json', check: data => data?.type === 'FeatureCollection' && data.features?.length === 6 },
    { key: 'monthly', file: 'climate_vegetation_monthly_2001_2022.csv', kind: 'csv', columns: ['state', 'year', 'month', 'tmax_mean_c', 'climate_valid_days', 'tmax_baseline_c', 'tmax_anomaly_c', 'modis_valid'] },
    { key: 'anomalies', file: 'environmental_anomalies_2022.csv', kind: 'csv', columns: ['state', 'year', 'month', 'tmax_anomaly_c', 'precip_anomaly_mm', 'modis_valid'] },
    { key: 'caseCheck', file: 'wheat_yield_2021_22_case_check.csv', kind: 'csv', columns: ['state', 'season', 'yield_previous_season_kg_ha', 'yield_kg_ha', 'yield_change_pct', 'feb_apr_tmax_anomaly_c', 'feb_apr_precip_anomaly_mm', 'feb_apr_rh_anomaly_pp', 'environment_calendar_year'] },
    { key: 'vegetation', file: 'modis_mapspam2020_wheat_area_weighted_seasonal.csv', kind: 'csv', columns: ['state', 'year', 'period', 'ndvi_mean_static_2020_wheat_area_mask', 'evi_mean_static_2020_wheat_area_mask', 'wheat_mask_reference_year', 'source'] },
    { key: 'findings', file: 'final_case_findings.json', kind: 'json', check: payload => Boolean(payload?.numerical_highlights?.tmax_feb_apr_anomaly_c && payload?.numerical_highlights?.tmax_march_anomaly_c) }
];

const case02State = {
    status: 'idle',
    data: null,
    loadPromise: null,
    sourceByFile: {},
    loadError: '',
    hypothesis: '',
    selectedState: 'Rajasthan',
    classifications: {},
    charts: []
};

function case02Num(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function case02Format(value, digits = 2, sign = false) {
    const number = case02Num(value);
    if (number === null) return 'Not available';
    const text = number.toFixed(digits);
    return sign && number > 0 ? `+${text}` : text;
}

function case02StateRows(rows, state) {
    return rows.filter(row => row.state === state);
}

function case02ValidatePayload(definition, payload) {
    if (definition.kind === 'json') {
        if (!definition.check(payload)) throw new Error(`${definition.file} did not contain the expected six-state GeoJSON.`);
        if (definition.key === 'boundaries') {
            const names = payload.features.map(feature => feature.properties?.state);
            if (CASE02_STATES.some(state => !names.includes(state))) throw new Error('Boundary file is missing one or more study states.');
        }
        return payload;
    }
    if (!Array.isArray(payload) || !payload.length) throw new Error(`${definition.file} contains no rows.`);
    const missing = definition.columns.filter(column => !Object.prototype.hasOwnProperty.call(payload[0], column));
    if (missing.length) throw new Error(`${definition.file} is missing expected columns: ${missing.join(', ')}.`);
    return payload;
}

function case02ParseCsv(text, definition) {
    if (!window.Papa) throw new Error('Papa Parse did not load. Check the page connection and retry.');
    const parsed = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: 'greedy' });
    if (parsed.errors?.length) throw new Error(`${definition.file} could not be parsed: ${parsed.errors[0].message}`);
    return case02ValidatePayload(definition, parsed.data);
}

async function case02FetchText(url, timeoutMs = 7000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { signal: controller.signal, cache: 'default' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.text();
    } finally {
        clearTimeout(timeout);
    }
}

async function case02LoadOneFile(definition) {
    try {
        const localUrl = new URL(`data/case02/${definition.file}`, document.baseURI).href;
        const text = await case02FetchText(localUrl, 12000);
        const payload = definition.kind === 'json' ? JSON.parse(text) : case02ParseCsv(text, definition);
        case02State.sourceByFile[definition.file] = 'bundled static data';
        return case02ValidatePayload(definition, payload);
    } catch (error) {
        throw new Error(`${definition.file}: bundled research file could not be read (${error?.message || 'unknown error'}).`);
    }
}

function case02ValidateDataset(data) {
    const expectedRows = { monthly: 396, anomalies: 18, caseCheck: 6, vegetation: 132 };
    for (const [key, rows] of Object.entries(expectedRows)) {
        if (data[key].length !== rows) throw new Error(`${CASE02_FILES.find(file => file.key === key).file} has ${data[key].length} rows; expected ${rows}.`);
    }
    const monthlyKeys = new Set(data.monthly.map(row => `${row.state}|${row.year}|${row.month}`));
    if (monthlyKeys.size !== data.monthly.length) throw new Error('The monthly panel contains duplicate state/year/month rows.');
    if (CASE02_STATES.some(state => !data.monthly.some(row => row.state === state))) throw new Error('The monthly panel does not include all six states.');
    const yearSet = new Set(data.monthly.map(row => row.year));
    if (yearSet.size !== 22 || !Array.from({ length: 22 }, (_, i) => 2001 + i).every(year => yearSet.has(year))) throw new Error('The monthly panel does not cover every year from 2001 through 2022.');
    const caseKeys = new Set(data.caseCheck.map(row => row.state));
    if (caseKeys.size !== 6 || data.caseCheck.some(row => row.season !== '2021-22' || row.environment_calendar_year !== 2022)) throw new Error('The wheat case check is not a six-state 2021-22 harvest matched to 2022 environmental data.');
    if (data.anomalies.some(row => row.year !== 2022)) throw new Error('The anomaly panel includes a year other than 2022.');
    if (CASE02_STATES.some(state => !data.caseCheck.some(row => row.state === state))) throw new Error('The harvest case check is missing a study state.');
    if (CASE02_STATES.some(state => !Object.prototype.hasOwnProperty.call(data.findings.numerical_highlights.tmax_feb_apr_anomaly_c, state))) throw new Error('The seasonal temperature findings are missing a study state.');
}

async function loadCase02ResearchData() {
    if (case02State.data) return case02State.data;
    if (case02State.loadPromise) return case02State.loadPromise;
    case02State.status = 'loading';
    case02State.loadError = '';
    case02State.sourceByFile = {};
    case02UpdateLoadUi();

    case02State.loadPromise = (async () => {
        try {
            const entries = await Promise.all(CASE02_FILES.map(async definition => [definition.key, await case02LoadOneFile(definition)]));
            const data = Object.fromEntries(entries);
            case02ValidateDataset(data);
            case02State.data = data;
            case02State.status = 'ready';
            case02State.loadError = '';
            return data;
        } catch (error) {
            case02State.status = 'error';
            case02State.loadError = error?.message || 'The research data could not be loaded.';
            case02State.data = null;
            throw error;
        } finally {
            case02State.loadPromise = null;
            case02UpdateLoadUi();
            if (case02State.status === 'ready' && currentCase === 2 && document.getElementById('docModal')?.classList.contains('active')) {
                if (currentPhase === 1) case02EnablePhaseOneContinue();
                else goToPhase(currentPhase);
            }
        }
    })();
    return case02State.loadPromise;
}

function case02LoadBadgeMarkup() {
    if (case02State.status === 'loading') return '<span class="c2-data-badge is-loading" role="status">Loading verified research files…</span>';
    if (case02State.status === 'error') return `<span class="c2-data-badge is-error" role="alert">Data not loaded: ${case02Escape(case02State.loadError)}</span>`;
    if (case02State.status === 'ready') return '<span class="c2-data-badge is-ready" role="status">Case research data is ready</span>';
    return '<span class="c2-data-badge" role="status">Research data has not loaded yet.</span>';
}

function case02Escape(value) {
    return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function case02UpdateLoadUi() {
    document.querySelectorAll('[data-case02-load-status]').forEach(element => { element.innerHTML = case02LoadBadgeMarkup(); });
    case02EnablePhaseOneContinue();
}

function case02EnablePhaseOneContinue() {
    const button = document.getElementById('c2-phase1-next');
    if (button) button.disabled = !(case02State.status === 'ready' && case02State.hypothesis);
}

function resetCase02State() {
    case02DestroyCharts();
    case02State.hypothesis = '';
    case02State.selectedState = 'Rajasthan';
    case02State.classifications = {};
}

const case02OriginalSelectCase = window.selectCase;
window.selectCase = function (caseNumber) {
    if (caseNumber === 2) void loadCase02ResearchData().catch(() => {});
    case02OriginalSelectCase(caseNumber);
    if (caseNumber === 2) {
        const introBody = document.getElementById('intro-body');
        if (introBody && !introBody.querySelector('[data-case02-load-status]')) {
            const status = document.createElement('div');
            status.dataset.case02LoadStatus = 'true';
            status.className = 'mt-3';
            introBody.appendChild(status);
        }
        case02UpdateLoadUi();
    }
};

function case02DestroyCharts() {
    case02State.charts.forEach(chart => chart?.destroy());
    case02State.charts = [];
}

function case02NextButton(phase, label = 'Continue to next clue') {
    return `<button type="button" class="c2-primary-button" onclick="goToPhase(${phase + 1})">${label} <span aria-hidden="true">→</span></button>`;
}

function case02Details(title, content) {
    return `<details class="c2-method-note"><summary>${title}</summary><div>${content}</div></details>`;
}

function case02RenderUnavailable(phase, body) {
    case02DestroyCharts();
    const error = case02State.status === 'error';
    body.innerHTML = `<section class="c2-panel"><p class="c2-kicker">${error ? 'DATA CONNECTION NEEDS ATTENTION' : 'CONNECTING TO THE EVIDENCE ARCHIVE'}</p><h3>${error ? 'We could not load the research data' : 'Loading the six-state research files'}</h3><p>${error ? 'The investigation will not use substitute numbers. Check your connection and try again.' : 'The case opens only the curated files it needs. This may take a moment.'}</p><div data-case02-load-status>${case02LoadBadgeMarkup()}</div>${error ? `<button type="button" class="c2-secondary-button" onclick="retryCase02Data()">Retry data load</button>` : '<div class="c2-loading-bar" aria-label="Loading"></div>'}<button type="button" class="c2-link-button" onclick="goToPhase(1)">Return to the case file</button></section>`;
    if (error) body.querySelector('[data-case02-load-status]')?.classList.add('mt-3');
    case02UpdateLoadUi();
}

function retryCase02Data() {
    case02State.status = 'idle';
    case02State.loadError = '';
    void loadCase02ResearchData().catch(() => {
        if (currentCase === 2 && document.getElementById('docModal')?.classList.contains('active')) goToPhase(currentPhase);
    });
    if (currentCase === 2 && document.getElementById('docModal')?.classList.contains('active')) goToPhase(currentPhase);
}

function renderCase02Phase(phase, body) {
    case02DestroyCharts();
    if (!case02State.data && phase !== 1) {
        case02RenderUnavailable(phase, body);
        return;
    }
    if (phase === 1) case02PhaseOne(body);
    else if (phase === 2) case02PhaseTwo(body);
    else if (phase === 3) case02PhaseThree(body);
    else if (phase === 4) case02PhaseFour(body);
    else if (phase === 5) case02PhaseFive(body);
    else if (phase === 6) case02PhaseSix(body);
    else if (phase === 7) case02PhaseSeven(body);
    else case02PhaseOne(body);
}

function case02PhaseOne(body) {
    updateHeader('CASE 02 — PHASE 01', 'The Case File: A Wheat Crisis', 'Phase 1 of 7', getCase1EvidenceText(), getCase2EvidenceText(), getCase3EvidenceText(), 'Status: Open investigation', 'Test the heat explanation against four independent clues.');
    body.innerHTML = `
        <section class="c2-intro-card">
            <p class="c2-kicker">FIELD NOTE · SPRING 2022</p>
            <h3>Reports pointed to heat. What does the evidence say?</h3>
            <p>India is an important wheat producer. Concerns about domestic supply followed an unusual spring, and India restricted wheat exports in May 2022. Reports identified extreme heat as a major factor.</p>
            <p>We will check environmental records alongside vegetation and official wheat yields. Keep an open mind: clues can support, weaken or complicate the first explanation.</p>
        </section>
        <section class="c2-panel"><div data-case02-load-status>${case02LoadBadgeMarkup()}</div>${case02State.status === 'error' ? '<button type="button" class="c2-secondary-button" onclick="retryCase02Data()">Retry data load</button>' : ''}<p class="c2-question">Choose a working hypothesis. There is no right or wrong choice yet.</p>
            <div class="c2-hypothesis-list">
                <button type="button" class="c2-hypothesis ${case02State.hypothesis === 'stress' ? 'is-selected' : ''}" data-hypothesis="stress"><span class="c2-hypothesis-letter">A</span><span>Unusual heat and dry conditions may have added to crop stress.</span><span class="c2-radio" aria-hidden="true"></span></button>
                <button type="button" class="c2-hypothesis ${case02State.hypothesis === 'vulnerability' ? 'is-selected' : ''}" data-hypothesis="vulnerability"><span class="c2-hypothesis-letter">B</span><span>Longer-term environmental changes may have increased vulnerability.</span><span class="c2-radio" aria-hidden="true"></span></button>
                <button type="button" class="c2-hypothesis ${case02State.hypothesis === 'other-factors' ? 'is-selected' : ''}" data-hypothesis="other-factors"><span class="c2-hypothesis-letter">C</span><span>Environmental conditions alone may not explain the crisis.</span><span class="c2-radio" aria-hidden="true"></span></button>
            </div>
            <button id="c2-phase1-next" type="button" class="c2-primary-button" ${case02State.hypothesis ? '' : 'disabled'} onclick="goToPhase(2)">Open the study map <span aria-hidden="true">→</span></button>
        </section>`;
    body.querySelectorAll('[data-hypothesis]').forEach(button => button.addEventListener('click', () => {
        case02State.hypothesis = button.dataset.hypothesis;
        body.querySelectorAll('[data-hypothesis]').forEach(option => option.classList.toggle('is-selected', option === button));
        case02EnablePhaseOneContinue();
    }));
    case02UpdateLoadUi();
}

function case02GeometryPaths(geometry) {
    if (!geometry) return [];
    if (geometry.type === 'Polygon') return [geometry.coordinates[0]];
    if (geometry.type === 'MultiPolygon') return geometry.coordinates.map(polygon => polygon[0]);
    return [];
}

function case02RenderMap() {
    const host = document.getElementById('c2-state-map');
    if (!host || !case02State.data) return;
    const features = case02State.data.boundaries.features;
    const points = features.flatMap(feature => case02GeometryPaths(feature.geometry).flat());
    const xs = points.map(point => point[0]);
    const ys = points.map(point => point[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const width = 520, height = 330, pad = 18;
    const project = ([lon, lat]) => [pad + (lon - minX) / (maxX - minX) * (width - pad * 2), height - pad - (lat - minY) / (maxY - minY) * (height - pad * 2)];
    const paths = features.map((feature, index) => {
        const name = feature.properties.state;
        const d = case02GeometryPaths(feature.geometry).map(ring => ring.map(project).map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z').join(' ');
        const selected = name === case02State.selectedState;
        return `<path class="c2-map-shape ${selected ? 'is-selected' : ''}" d="${d}" fill="${selected ? '#b9782d' : CASE02_STATE_COLORS[index % CASE02_STATE_COLORS.length]}" fill-opacity="${selected ? '0.82' : '0.48'}" stroke="${selected ? '#fde68a' : '#94a3b8'}" stroke-width="${selected ? '2.4' : '1.2'}" tabindex="0" role="button" aria-label="Select ${case02Escape(name)}" onclick="case02SelectState('${case02Escape(name)}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();case02SelectState('${case02Escape(name)}')}"><title>${case02Escape(name)}</title></path>`;
    }).join('');
    const buttons = CASE02_STATES.map(name => `<button type="button" class="c2-state-chip ${name === case02State.selectedState ? 'is-selected' : ''}" onclick="case02SelectState('${case02Escape(name)}')">${case02Escape(name)}</button>`).join('');
    host.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Map of six study states in northern and central India">${paths}</svg><div class="c2-state-chips" aria-label="Choose a study state">${buttons}</div><p class="c2-map-selection">Selected state: <strong>${case02Escape(case02State.selectedState)}</strong></p>`;
}

function case02SelectState(name) {
    if (!CASE02_STATES.includes(name)) return;
    case02State.selectedState = name;
    case02RenderMap();
    if (currentPhase === 3) case02RenderHeatChart();
}

function case02PhaseTwo(body) {
    updateHeader('CASE 02 — PHASE 02', 'Where and when?', 'Phase 2 of 7', getCase1EvidenceText(), getCase2EvidenceText(), getCase3EvidenceText(), 'Status: Study area selected', 'Six major wheat-producing states; environmental window: February–April 2022.');
    body.innerHTML = `<p class="c2-kicker">THE STUDY AREA</p><h3 class="c2-phase-heading">Six states. One shared season. Different local stories.</h3><p>These major wheat-producing states span northern and central India. Select a state on the map to carry it into the temperature clue.</p><div id="c2-state-map" class="c2-map-wrap"></div><div class="c2-timeline"><div><b>Feb–Apr 2022</b><span>Environmental observations</span></div><div><b>2021–22</b><span>Matching wheat harvest</span></div><div><b>May 2022</b><span>India restricts wheat exports</span></div></div><p class="c2-callout"><strong>Timing check:</strong> the 2021–22 harvest is paired with weather from calendar year 2022, not 2021 or 2023.</p>${case02Details('Why these places and months?', 'The six states are major wheat-producing regions. February–April captures the late rabi growing season used in this case. State averages are broad summaries and do not represent every district or farm.')}${case02NextButton(2, 'Examine the heat record')}`;
    case02RenderMap();
}

function case02TemperatureSeries(state, month) {
    return case02StateRows(case02State.data.monthly, state).filter(row => row.month === month).sort((a, b) => a.year - b.year);
}

function case02RenderHeatChart() {
    const canvas = document.getElementById('c2-heat-chart');
    if (!canvas || !window.Chart || !case02State.data) return;
    const month = Number(document.getElementById('c2-heat-month')?.value || 3);
    const rows = case02TemperatureSeries(case02State.selectedState, month);
    const context = canvas.getContext('2d');
    const chart = new Chart(context, {
        type: 'line',
        data: { labels: rows.map(row => row.year), datasets: [{ label: `${['', '', 'February', 'March', 'April'][month]} anomaly`, data: rows.map(row => case02Num(row.tmax_anomaly_c)), borderColor: '#22d3ee', backgroundColor: 'rgba(34, 211, 238, .12)', borderWidth: 2.5, tension: 0.24, fill: true, pointRadius: rows.map(row => row.year === 2022 ? 6 : 2), pointHoverRadius: 7, pointBackgroundColor: rows.map(row => row.year === 2022 ? '#fbbf24' : '#67e8f9'), pointBorderColor: rows.map(row => row.year === 2022 ? '#fde68a' : '#cffafe') }] },
        options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: item => ` ${case02Format(item.raw, 2, true)} °C vs 2001–2021 ${['', '', 'February', 'March', 'April'][month]} average` } } }, scales: { x: { title: { display: true, text: 'Year' }, grid: { color: 'rgba(148,163,184,.12)' } }, y: { title: { display: true, text: 'Temperature anomaly (°C)' }, grid: { color: 'rgba(148,163,184,.16)' }, ticks: { callback: value => `${value}°` } } } }
    });
    case02State.charts.push(chart);
}

function case02PhaseThree(body) {
    updateHeader('CASE 02 — PHASE 03', 'Clue 1: The heat', 'Phase 3 of 7', getCase1EvidenceText(), getCase2EvidenceText(), getCase3EvidenceText(), 'Evidence #1: Spring heat', 'Compare monthly temperature departures with the 2001–2021 baseline.');
    const seasonal = CASE02_STATES.map(state => ({ state, feb_apr_tmax_anomaly_c: case02State.data.findings.numerical_highlights.tmax_feb_apr_anomaly_c[state] }));
    const marchRows = case02State.data.anomalies.filter(row => row.month === 3);
    const aprilRows = case02State.data.anomalies.filter(row => row.month === 4);
    const marchCount = marchRows.filter(row => row.tmax_anomaly_c > 0).length;
    const aprilCount = aprilRows.filter(row => row.tmax_anomaly_c > 0).length;
    const cards = seasonal.map(row => `<div class="c2-metric-row"><span>${case02Escape(row.state)}</span><b>${case02Format(row.feb_apr_tmax_anomaly_c, 2, true)}°C</b></div>`).join('');
    body.innerHTML = `<p class="c2-kicker">CLUE 1 · NASA POWER</p><h3 class="c2-phase-heading">Spring was hot, even though February cooled the seasonal average.</h3><p>Choose a state and month. An anomaly is the difference from that same month's 2001–2021 average. The highlighted point marks 2022.</p><div class="c2-controls"><label for="c2-heat-state">State</label><select id="c2-heat-state">${CASE02_STATES.map(state => `<option value="${case02Escape(state)}" ${state === case02State.selectedState ? 'selected' : ''}>${case02Escape(state)}</option>`).join('')}</select><label for="c2-heat-month">Month</label><select id="c2-heat-month"><option value="2">February</option><option value="3" selected>March</option><option value="4">April</option></select></div><div class="c2-chart-card"><div class="c2-chart-area"><canvas id="c2-heat-chart" aria-label="Historical monthly temperature anomaly line chart"></canvas></div></div><p class="c2-chart-caption">NASA POWER daily maximum near-surface air temperature, summarized by state. Warm months plot above zero; cool months plot below zero.</p><div class="c2-insight"><b>What this tells us</b><span>All six states were warmer than baseline in March (${marchCount}/6) and April (${aprilCount}/6). February was cooler in five states. Rajasthan had the largest Feb–Apr anomaly (+2.13°C); Punjab and Haryana had the largest April anomalies (+3.60°C and +3.40°C).</span></div><div class="c2-panel"><h4>2022 February–April anomaly by state</h4><div class="c2-metric-list">${cards}</div></div><p class="c2-caveat">The 2001–2022 seasonal Mann–Kendall trend tests were not statistically significant in any state. This short record shows a 2022 spring heat signal, but does not establish a long-term seasonal trend.</p>${case02Details('Source and method', 'NASA POWER daily T2M_MAX (°C). State values use fractional grid-cell intersection area with the six state boundaries. Monthly anomalies compare each month with its 2001–2021 mean; seasonal values come from the season-matched case-check table. State-level air temperature is not field canopy or grain temperature.')}${case02NextButton(3, 'Check the rainfall clue')}`;
    document.getElementById('c2-heat-month').addEventListener('change', case02RenderHeatChart);
    document.getElementById('c2-heat-state').addEventListener('change', event => { case02State.selectedState = event.target.value; case02RenderHeatChart(); });
    case02RenderHeatChart();
}

function case02PhaseFour(body) {
    updateHeader('CASE 02 — PHASE 04', 'Clue 2: The rain', 'Phase 4 of 7', getCase1EvidenceText(), getCase2EvidenceText(), getCase3EvidenceText(), 'Evidence #2: Rainfall departures', 'Four states received less February–April precipitation than their baseline.');
    const rows = CASE02_STATES.map(state => case02State.data.caseCheck.find(row => row.state === state));
    const negative = rows.filter(row => row.feb_apr_precip_anomaly_mm < 0).length;
    const marchDry = case02State.data.anomalies.filter(row => row.month === 3 && row.precip_anomaly_mm < 0).length;
    const aprilDry = case02State.data.anomalies.filter(row => row.month === 4 && row.precip_anomaly_mm < 0).length;
    body.innerHTML = `<p class="c2-kicker">CLUE 2 · NASA POWER</p><h3 class="c2-phase-heading">Was the season also drier than usual?</h3><p>Bars to the left of zero show less February–April rainfall than the reference; bars to the right show more. Select a state on the chart to mark it on the map clue.</p><div class="c2-chart-card"><div class="c2-chart-area c2-chart-area-tall"><canvas id="c2-rain-chart" aria-label="Diverging rainfall anomaly chart by state"></canvas></div></div><div class="c2-insight"><b>What this tells us</b><span>${negative} of 6 states had below-baseline seasonal precipitation. March rainfall was below baseline in ${marchDry}/6 states and April rainfall in ${aprilDry}/6. Rainfall is one clue, not a direct measure of crop water stress.</span></div><p class="c2-caveat">Irrigation and soil moisture were not measured. A rainfall deficit alone cannot tell us how much water crops could access.</p>${case02Details('Source and units', 'NASA POWER PRECTOTCORR, precipitation corrected using MERRA-2. Values are February–April seasonal precipitation anomalies in millimetres; this is not GPM IMERG.')}${case02NextButton(4, 'Look at vegetation')}`;
    const ctx = document.getElementById('c2-rain-chart').getContext('2d');
    case02State.charts.push(new Chart(ctx, { type: 'bar', data: { labels: rows.map(row => row.state), datasets: [{ label: 'Feb–Apr rainfall anomaly (mm)', data: rows.map(row => case02Num(row.feb_apr_precip_anomaly_mm)), backgroundColor: rows.map(row => row.state === case02State.selectedState ? '#fbbf24' : row.feb_apr_precip_anomaly_mm < 0 ? '#fb7185' : '#34d399'), borderColor: rows.map(row => row.state === case02State.selectedState ? '#fde68a' : row.feb_apr_precip_anomaly_mm < 0 ? '#fecdd3' : '#a7f3d0'), borderWidth: 1, borderRadius: 5 }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, onClick: (event, elements, chart) => { if (elements.length) { case02State.selectedState = rows[elements[0].index].state; chart.data.datasets[0].backgroundColor = rows.map(row => row.state === case02State.selectedState ? '#fbbf24' : row.feb_apr_precip_anomaly_mm < 0 ? '#fb7185' : '#34d399'); chart.update(); } }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: item => ` ${case02Format(item.raw, 1, true)} mm vs 2001–2021 baseline` } } }, scales: { x: { title: { display: true, text: 'Rainfall anomaly (mm)' }, grid: { color: 'rgba(148,163,184,.18)' } }, y: { grid: { display: false } } } } }));
}

function case02VegetationAnomalies() {
    const rows = case02State.data.vegetation.filter(row => row.year === 2022 && row.period === 'February-April');
    return CASE02_STATES.map(state => {
        const row = rows.find(item => item.state === state);
        const history = case02State.data.vegetation.filter(item => item.state === state && item.year >= 2001 && item.year <= 2021 && item.period === 'February-April');
        const ndviBaseline = history.reduce((sum, item) => sum + Number(item.ndvi_mean_static_2020_wheat_area_mask), 0) / history.length;
        const eviBaseline = history.reduce((sum, item) => sum + Number(item.evi_mean_static_2020_wheat_area_mask), 0) / history.length;
        return { state, ndvi: Number(row.ndvi_mean_static_2020_wheat_area_mask) - ndviBaseline, evi: Number(row.evi_mean_static_2020_wheat_area_mask) - eviBaseline };
    });
}

function case02PhaseFive(body) {
    updateHeader('CASE 02 — PHASE 05', 'Clue 3: Was the land losing its green?', 'Phase 5 of 7', getCase1EvidenceText(), getCase2EvidenceText(), getCase3EvidenceText(), 'Evidence #3: Satellite greenness', 'The wheat-area-weighted vegetation signal was not broadly negative.');
    const rows = case02VegetationAnomalies();
    const negativeNdvi = rows.filter(row => row.ndvi < 0).length;
    body.innerHTML = `<p class="c2-kicker">CLUE 3 · NASA MODIS</p><h3 class="c2-phase-heading">A surprising clue: green signals were mixed, not broadly down.</h3><p>NDVI and EVI are satellite measures of how green and active vegetation looks. Positive values mean greener than the reference; negative values mean less green.</p><div class="c2-chart-card"><div class="c2-chart-area c2-chart-area-tall"><canvas id="c2-vegetation-chart" aria-label="Grouped NDVI and EVI anomaly chart by state"></canvas></div></div><div class="c2-insight"><b>What this tells us</b><span>The main wheat-area-weighted NDVI comparison is negative in ${negativeNdvi} of 6 states. EVI shows a broadly similar pattern. The results do not show a widespread negative vegetation anomaly across all six states.</span></div><p class="c2-caveat">Greenness is not grain weight, wheat yield or production. The wheat-area weighting uses a static MapSPAM 2020 mask, not a crop map updated every year.</p>${case02Details('Source and method', 'NASA MODIS/Terra MOD13A1.061 NDVI and EVI seasonal means. Each 2022 value is compared with that state’s 2001–2021 mean. Spatial weights use MapSPAM 2020 physical wheat area, held fixed across years; this improves crop-area relevance but does not represent annual planted or harvested area.')}${case02NextButton(5, 'Check the official harvest records')}`;
    const ctx = document.getElementById('c2-vegetation-chart').getContext('2d');
    case02State.charts.push(new Chart(ctx, { type: 'bar', data: { labels: rows.map(row => row.state), datasets: [{ label: 'NDVI anomaly', data: rows.map(row => row.ndvi), backgroundColor: 'rgba(52,211,153,.72)', borderColor: '#6ee7b7', borderWidth: 1, borderRadius: 4 }, { label: 'EVI anomaly', data: rows.map(row => row.evi), backgroundColor: 'rgba(34,211,238,.68)', borderColor: '#67e8f9', borderWidth: 1, borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { usePointStyle: true } }, tooltip: { callbacks: { label: item => ` ${item.dataset.label}: ${case02Format(item.raw, 3, true)} index units` } } }, scales: { x: { grid: { display: false } }, y: { title: { display: true, text: 'Index anomaly (unitless)' }, grid: { color: 'rgba(148,163,184,.18)' } } } } }));
}

function case02PhaseSix(body) {
    updateHeader('CASE 02 — PHASE 06', 'Clue 4: What did the harvest show?', 'Phase 6 of 7', getCase1EvidenceText(), getCase2EvidenceText(), getCase3EvidenceText(), 'Evidence #4: Official wheat yield', 'State outcomes moved in more than one direction.');
    const rows = CASE02_STATES.map(state => case02State.data.caseCheck.find(row => row.state === state));
    const previous = rows.filter(row => row.yield_change_pct < 0).length;
    body.innerHTML = `<p class="c2-kicker">CLUE 4 · GOVERNMENT OF INDIA</p><h3 class="c2-phase-heading">The harvest record complicates the heat story.</h3><p>Yield means wheat produced per hectare. It is different from total production, which also depends on harvested area, and different again from exports.</p><div class="c2-chart-card"><div class="c2-chart-area c2-chart-area-tall"><canvas id="c2-yield-chart" aria-label="Diverging wheat yield percentage change chart"></canvas></div></div><div class="c2-yield-table"><div class="c2-table-head"><span>State</span><span>Yield (kg/ha)</span><span>Change</span></div>${rows.map(row => `<div class="c2-table-row"><span>${case02Escape(row.state)}</span><span>${Number(row.yield_kg_ha).toLocaleString('en-US')}</span><b>${case02Format(row.yield_change_pct, 2, true)}%</b></div>`).join('')}</div><div class="c2-insight"><b>What this tells us</b><span>${previous} states had lower yield than 2020–21. Punjab and Haryana declined; Madhya Pradesh and Rajasthan increased; Bihar rose slightly; Uttar Pradesh was unchanged. This is a mixed result, not a six-state harvest failure.</span></div><p class="c2-caveat">The 2021–22 harvest is matched to February–April 2022 climate conditions. Co-occurring changes do not prove that heat caused a yield change.</p>${case02Details('Source and timing', 'Official Government of India, Department of Agriculture & Farmers Welfare wheat yield data. Change is the percentage difference from 2020–21 yield. The season-matched case-check aligns harvest 2021–22 with environmental calendar year 2022.')}${case02NextButton(6, 'Review the evidence board')}`;
    const ctx = document.getElementById('c2-yield-chart').getContext('2d');
    case02State.charts.push(new Chart(ctx, { type: 'bar', data: { labels: rows.map(row => row.state), datasets: [{ label: 'Yield change from 2020–21 (%)', data: rows.map(row => case02Num(row.yield_change_pct)), backgroundColor: rows.map(row => row.yield_change_pct < 0 ? '#fb7185' : '#34d399'), borderColor: rows.map(row => row.yield_change_pct < 0 ? '#fecdd3' : '#a7f3d0'), borderWidth: 1, borderRadius: 5 }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: item => ` ${case02Format(item.raw, 2, true)}% yield change from 2020–21` } } }, scales: { x: { title: { display: true, text: 'Wheat yield change (%)' }, grid: { color: 'rgba(148,163,184,.18)' }, ticks: { callback: value => `${value}%` } }, y: { grid: { display: false } } } } }));
}

const CASE02_CLUES = [
    { key: 'heat', title: 'Heat', detail: 'All six states were warmer than baseline in March and April; no state had a statistically significant 2001–2022 seasonal trend.' },
    { key: 'rain', title: 'Rainfall', detail: 'Four states had below-baseline February–April rainfall; irrigation and soil moisture were not measured.' },
    { key: 'green', title: 'Vegetation', detail: 'Wheat-area-weighted NDVI was not broadly negative across the six states.' },
    { key: 'yield', title: 'Wheat yield', detail: 'Official yield changes were mixed, ranging from a 13.39% decline in Punjab to an 18.27% increase in Madhya Pradesh.' }
];

function case02PhaseSeven(body) {
    updateHeader('CASE 02 — PHASE 07', 'The Evidence Board: Your verdict', 'Phase 7 of 7', getCase1EvidenceText(), getCase2EvidenceText(), getCase3EvidenceText(), 'Status: Evidence reviewed', 'Classify each clue, then write a balanced case summary.');
    const cards = CASE02_CLUES.map(clue => `<article class="c2-verdict-clue"><div><b>${clue.title}</b><p>${clue.detail}</p></div><label class="c2-visually-hidden" for="c2-classify-${clue.key}">How does the ${clue.title.toLowerCase()} clue affect your hypothesis?</label><select id="c2-classify-${clue.key}" data-clue="${clue.key}"><option value="">Choose a reading</option><option value="supports" ${case02State.classifications[clue.key] === 'supports' ? 'selected' : ''}>Supports the hypothesis</option><option value="weakens" ${case02State.classifications[clue.key] === 'weakens' ? 'selected' : ''}>Weakens the hypothesis</option><option value="mixed" ${case02State.classifications[clue.key] === 'mixed' ? 'selected' : ''}>Inconclusive / mixed</option></select></article>`).join('');
    body.innerHTML = `<p class="c2-kicker">FINAL REVIEW · NO SINGLE CLUE SOLVES THE CASE</p><h3 class="c2-phase-heading">What does the full evidence board support?</h3><p>Choose how each clue affects your working idea. Reasonable investigators may weigh evidence differently; there is no pass/fail verdict.</p><div class="c2-verdict-grid">${cards}</div><button id="c2-build-verdict" type="button" class="c2-primary-button" disabled onclick="case02BuildVerdict()">Write my evidence report</button><div id="c2-final-report" aria-live="polite"></div>`;
    body.querySelectorAll('[data-clue]').forEach(select => select.addEventListener('change', () => {
        case02State.classifications[select.dataset.clue] = select.value;
        document.getElementById('c2-build-verdict').disabled = CASE02_CLUES.some(clue => !case02State.classifications[clue.key]);
    }));
    document.getElementById('c2-build-verdict').disabled = CASE02_CLUES.some(clue => !case02State.classifications[clue.key]);
    if (Object.keys(case02State.classifications).length === 4 && CASE02_CLUES.every(clue => case02State.classifications[clue.key])) case02BuildVerdict();
}

function case02BuildVerdict() {
    const report = document.getElementById('c2-final-report');
    if (!report || !case02State.data) return;
    const caseCheck = case02State.data.caseCheck;
    const seasonalHeat = case02State.data.findings.numerical_highlights.tmax_feb_apr_anomaly_c;
    const mostHeat = Object.entries(seasonalHeat).reduce((best, [state, anomaly]) => anomaly > best.anomaly ? { state, anomaly } : best, { state: '', anomaly: -Infinity });
    const rainfallDeficits = caseCheck.filter(row => row.feb_apr_precip_anomaly_mm < 0).length;
    const initial = {
        stress: 'Unusual heat and dry conditions may have added to crop stress.',
        vulnerability: 'Longer-term environmental changes may have increased vulnerability.',
        'other-factors': 'Environmental conditions alone may not explain the crisis.'
    }[case02State.hypothesis] || 'No initial hypothesis was selected.';
    const feedback = CASE02_CLUES.map(clue => {
        const status = case02State.classifications[clue.key];
        const label = status === 'supports' ? 'You marked this as supporting your hypothesis.' : status === 'weakens' ? 'You marked this as weakening your hypothesis.' : 'You marked this clue as mixed or inconclusive.';
        return `<li><b>${clue.title}:</b> ${label} ${clue.detail}</li>`;
    }).join('');
    report.innerHTML = `<section class="c2-final-card"><p class="c2-kicker">INVESTIGATOR’S REPORT</p><h3>A mixed verdict, supported by the records</h3><p class="c2-hypothesis-revisit"><b>Your starting idea:</b> ${case02Escape(initial)}</p><p>NASA and agricultural records show that spring 2022 was unusually hot in several major wheat-producing states, while rainfall was below baseline in ${rainfallDeficits} states. The largest seasonal heat anomaly was in ${case02Escape(mostHeat.state)} (${case02Format(mostHeat.anomaly, 2, true)}°C). However, satellite vegetation indicators did not show a widespread negative anomaly, and official wheat yield changes varied considerably between states.</p><p>These findings show that environmental conditions may have contributed to regional agricultural pressure, but they do not establish that heat alone caused India’s wheat crisis or its export restrictions.</p><h4>Your clue notes</h4><ul>${feedback}</ul><h4>Limits to keep in the case file</h4><ul><li>State averages hide local differences.</li><li>MODIS greenness is not a direct measure of wheat yield.</li><li>MapSPAM’s wheat mask is a fixed 2020 reference.</li><li>Irrigation and soil moisture were not included.</li><li>Correlation does not prove causation.</li><li>Export restrictions also involve policy, markets and food-security considerations beyond these environmental data.</li></ul><p class="c2-final-status">Case status: evidence reviewed; explanation remains open.</p></section>${case02Details('Sources and definitions', 'Temperature and precipitation: NASA POWER T2M_MAX and PRECTOTCORR (MERRA-2 corrected), summarized for six states. Vegetation: NASA MODIS/Terra MOD13A1.061 NDVI/EVI, weighted with a static MapSPAM 2020 physical wheat-area mask. Wheat yield: Government of India Agricultural Statistics at a Glance 2023. The 2021–22 crop is paired with February–April 2022 environmental observations. The historical 2001–2021 baseline contains 21 years.')}`;
    report.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.retryCase02Data = retryCase02Data;
window.case02SelectState = case02SelectState;
window.case02BuildVerdict = case02BuildVerdict;
