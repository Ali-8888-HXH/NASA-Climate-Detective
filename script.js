let currentCase = 1;
let currentPhase = 1;
let mainFontSize = 14;
let modalFontSize = 14;

let case1MaxPhase = 1;
let case2MaxPhase = 1;
let case3MaxPhase = 1;
let solvedPhasesC1 = {}; 
let solvedPhasesC2 = {}; 
let solvedPhasesC3 = {};
let detectiveName = "Lead Detective";

let currentZoom = 1;
let panX = 0;
let panY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

let case1IntroSeen = false; 
let case2IntroSeen = false; 
let case3IntroSeen = false;

function changeMainFontSize(delta) {
    mainFontSize = Math.max(11, Math.min(24, mainFontSize + delta));
    const mainBody = document.getElementById('main-body');
    if (mainBody) mainBody.style.fontSize = mainFontSize + 'px';
}
function resetMainFontSize() {
    mainFontSize = 14;
    const mainBody = document.getElementById('main-body');
    if (mainBody) mainBody.style.fontSize = '14px';
}

function changeModalFontSize(delta) {
    modalFontSize = Math.max(12, Math.min(28, modalFontSize + delta));
    applyModalFontSize();
}
function resetModalFontSize() {
    modalFontSize = 14;
    applyModalFontSize();
}
function applyModalFontSize() {
    const modalContent = document.getElementById('modal-body-content');
    if (modalContent) modalContent.style.fontSize = modalFontSize + 'px';
}

function zoomIn() {
    currentZoom = Math.min(currentZoom + 0.5, 4);
    updateImageTransform();
}
function zoomOut() {
    currentZoom = Math.max(currentZoom - 0.5, 1);
    if (currentZoom === 1) { panX = 0; panY = 0; }
    updateImageTransform();
}
function resetZoom() {
    currentZoom = 1;
    panX = 0;
    panY = 0;
    updateImageTransform();
}
function updateImageTransform() {
    const img = document.getElementById('active-exhibit-img');
    const zoomIndicator = document.getElementById('zoom-level-text');
    if (img) img.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
    if (zoomIndicator) zoomIndicator.innerText = Math.round(currentZoom * 100) + '%';
}

function initImageDrag() {
    const container = document.getElementById('zoom-box');
    const img = document.getElementById('active-exhibit-img');
    if (!container || !img) return;

    img.ondragstart = (e) => e.preventDefault();

    container.onmousedown = (e) => {
        if (currentZoom > 1) {
            isDragging = true;
            startX = e.clientX - panX;
            startY = e.clientY - panY;
        }
    };
    window.onmousemove = (e) => {
        if (!isDragging) return;
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        updateImageTransform();
    };
    window.onmouseup = () => { isDragging = false; };
}

function selectCase(caseNum) {
    currentCase = caseNum;
    
    const hasSeenIntro = (caseNum === 1) ? case1IntroSeen : (caseNum === 2) ? case2IntroSeen : case3IntroSeen;

    if (!hasSeenIntro) {
        if (caseNum === 1) case1IntroSeen = true;
        if (caseNum === 2) case2IntroSeen = true;
        if (caseNum === 3) case3IntroSeen = true;

        const introModal = document.getElementById('introModal');
        const introTitle = document.getElementById('intro-title');
        const introBody = document.getElementById('intro-body');
        const introRefTag = document.getElementById('intro-ref-tag');

        if (caseNum === 1) {
            introRefTag.innerText = "🔒 CASE 01 BRIEFING // ARCTIC TELEMETRY";
            introTitle.innerText = "The Vanishing Ice: Arctic Mystery";
            introBody.innerHTML = `
                <p><strong>The Year: Present Day.</strong> Satellites monitoring Earth's northernmost cap have detected an alarming anomaly in the September sea ice minimums.</p>
                <p>For decades, the Arctic ice sheet has acted as Earth's primary air conditioner, reflecting solar radiation back into space. But recent orbital telemetry reveals a systemic retreat that defies historical norms.</p>
                <p>Your directive as Lead Detective: Analyze the satellite archives from 1979 onward, isolate the seasonal variables, and uncover whether this downward spiral is a natural fluctuation or an irreversible tipping point.</p>
            `;
        } else if (caseNum === 2) {
            introRefTag.innerText = "🔒 CASE 02 BRIEFING // SOUTH ASIA FOOD SECURITY";
            introTitle.innerText = "The Missing Wheat: Heatwave Crisis";
            introBody.innerHTML = `
                <p><strong>The Year: Spring 2022.</strong> South Asia is bracing for what was projected to be a record-breaking agricultural harvest to feed millions.</p>
                <p>Suddenly, without warning, the government announces an emergency restriction on wheat exports. Global markets plunge into panic. Initial reports point toward an invisible, scorching catalyst sweeping across the agricultural belt.</p>
                <p>Your directive as Lead Detective: Cross-reference NASA POWER meteorological data with MODIS vegetation indices to track the thermal anomaly, verify crop stress, and reconstruct the chain of events before global food security is compromised.</p>
            `;
        } else if (caseNum === 3) {
            introRefTag.innerText = "🔒 CASE 03 BRIEFING // GLOBAL CLIMATE ANOMALY";
            introTitle.innerText = "The Warming World: Temperature Anomalies";
            introBody.innerHTML = `
                <p><strong>The Year: Present Day.</strong> Earth's climate has never remained perfectly constant, but scientists are recording an unprecedented shift across more than a century.</p>
                <p>Some regions warm much faster than others. Is the planet experiencing random fluctuations, or is there a deeper pattern hidden within the global data?</p>
                <p>Your directive as Lead Detective: Analyze historical temperature records, compare NASA GISTEMP anomaly maps, and establish what the evidence reveals about global warming.</p>
            `;
        }

        if (introModal) {
            introModal.classList.remove('opacity-0', 'pointer-events-none');
            introModal.classList.add('opacity-100', 'pointer-events-auto');
        }
    } else {
        currentPhase = (caseNum === 1) ? case1MaxPhase : (caseNum === 2) ? case2MaxPhase : case3MaxPhase;
        const modal = document.getElementById('docModal');
        if (modal) {
            modal.classList.add('active');
            applyModalFontSize();
            goToPhase(currentPhase);
        }
    }
}

function startCaseFromIntro() {
    const introModal = document.getElementById('introModal');
    if (introModal) {
        introModal.classList.remove('opacity-100', 'pointer-events-auto');
        introModal.classList.add('opacity-0', 'pointer-events-none');
    }

    currentPhase = (currentCase === 1) ? case1MaxPhase : (currentCase === 2) ? case2MaxPhase : case3MaxPhase;
    const modal = document.getElementById('docModal');
    if (modal) {
        modal.classList.add('active');
        applyModalFontSize();
        goToPhase(currentPhase);
    }
}

function closeDocumentModal() {
    const modal = document.getElementById('docModal');
    if (modal) modal.classList.remove('active');
}

function resetCase() {
    if (confirm(`Are you sure you want to reset Case 0${currentCase} investigation back to Phase 1?`)) {
        currentPhase = 1;
        
        if (currentCase === 1) {
            case1MaxPhase = 1;
            case1IntroSeen = false;
            solvedPhasesC1 = {}; 
            for (let i = 2; i <= 7; i++) {
                const el = document.getElementById(`c1-ev-${i}`);
                if (el) { el.innerText = "LOCKED"; el.className = "text-slate-400 font-bold text-[9px]"; }
            }
        } else if (currentCase === 2) {
            case2MaxPhase = 1;
            case2IntroSeen = false;
            solvedPhasesC2 = {}; 
            for (let i = 2; i <= 5; i++) {
                const el = document.getElementById(`c2-ev-${i}`);
                if (el) { el.innerText = "LOCKED"; el.className = "text-slate-400 font-bold text-[9px]"; }
            }
        } else if (currentCase === 3) {
            case3MaxPhase = 1;
            case3IntroSeen = false;
            solvedPhasesC3 = {}; 
            for (let i = 2; i <= 5; i++) {
                const el = document.getElementById(`c3-ev-${i}`);
                if (el) { el.innerText = "LOCKED"; el.className = "text-slate-400 font-bold text-[9px]"; }
            }
        }
        
        document.getElementById('metrics-status').innerText = 'Investigation';
        document.getElementById('metrics-status').className = 'text-amber-400 font-bold';
        goToPhase(1);
    }
}

function goToPreviousPhase() {
    if (currentPhase > 1) {
        currentPhase--;
        goToPhase(currentPhase);
    }
}

function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function getCase1EvidenceText() {
    if (case1MaxPhase >= 8) return '6 / 6';
    return Math.max(0, case1MaxPhase - 1) + ' / 6';
}

function getCase2EvidenceText() {
    if (case2MaxPhase >= 6) return '5 / 5';
    return Math.max(0, case2MaxPhase - 1) + ' / 5';
}

function getCase3EvidenceText() {
    if (case3MaxPhase >= 6) return '5 / 5';
    return Math.max(0, case3MaxPhase - 1) + ' / 5';
}

function updateHeader(refTag, title, pageIndicator, c1CountText, c2CountText, c3CountText, boardTitle, boardText) {
    document.getElementById('doc-ref-tag').innerText = refTag;
    document.getElementById('doc-title').innerText = title;
    document.getElementById('page-indicator').innerText = pageIndicator;
    
    document.getElementById('evidence-counter-1').innerText = c1CountText;
    document.getElementById('evidence-counter-2').innerText = c2CountText;
    document.getElementById('evidence-counter-3').innerText = c3CountText;
    
    document.getElementById('board-title-status').innerText = boardTitle;
    document.getElementById('board-status-text').innerText = boardText;
}

function showFeedbackWithNext(message, isSuccess, nextPhaseNum) {
    const feedbackBox = document.getElementById('feedback-terminal') || document.getElementById('feedback-container');
    if (!feedbackBox) return;
    
    feedbackBox.classList.remove('hidden');
    if (isSuccess) {
        if (currentCase === 1) {
            solvedPhasesC1[currentPhase] = { message: message, nextPhase: nextPhaseNum };
        } else if (currentCase === 2) {
            solvedPhasesC2[currentPhase] = { message: message, nextPhase: nextPhaseNum };
        } else if (currentCase === 3) {
            solvedPhasesC3[currentPhase] = { message: message, nextPhase: nextPhaseNum };
        }

        feedbackBox.className = "p-3 rounded-lg text-xs font-mono bg-slate-900 border border-emerald-500 text-emerald-300 flex flex-col gap-2 mt-2 evidence-reveal";
        feedbackBox.innerHTML = `
            <div><strong class="text-emerald-400">✅ ANALYSIS VERIFIED:</strong> <span class="text-white">${message}</span></div>
            <button onclick="goToPhase(${nextPhaseNum})" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded text-center cursor-pointer shadow transition mt-1">
                Proceed to Next Evidence ➔
            </button>
        `;
    } else {
        feedbackBox.className = "p-3 rounded-lg text-xs font-mono bg-slate-900 border border-red-500 text-red-300 mt-2";
        feedbackBox.innerHTML = `<strong class="text-red-400">❌ ANALYSIS ERROR:</strong> <span class="text-white">${message}</span>`;
    }
}

function renderOptions(containerId, optionsArray, callbackName) {
    let container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    
    let savedData = (currentCase === 1) ? solvedPhasesC1[currentPhase] : (currentCase === 2) ? solvedPhasesC2[currentPhase] : solvedPhasesC3[currentPhase];
    let displayOptions = savedData ? optionsArray : shuffleArray([...optionsArray]);
    
    displayOptions.forEach((item, index) => {
        let letter = String.fromCharCode(65 + index);
        let btn = document.createElement('button');
        btn.style.fontSize = "0.95em";
        btn.innerHTML = `<span class="font-bold text-amber-800">[${letter}]</span> <span>${item.text}</span>`;

        if (savedData) {
            btn.disabled = true;
            if (item.correct) {
                btn.className = "bg-emerald-100 border-2 border-emerald-500 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm font-bold text-emerald-900";
            } else {
                btn.className = "bg-white border border-stone-300 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm opacity-50";
            }
        } else {
            btn.className = "bg-white hover:bg-amber-200 border border-stone-300 p-2.5 rounded text-left cursor-pointer transition flex gap-2 items-center w-full shadow-sm";
            btn.onclick = () => window[callbackName](item.correct, btn);
        }
        container.appendChild(btn);
    });

    if (savedData) {
        showFeedbackWithNext(savedData.message, true, savedData.nextPhase);
    }
}

function loadExhibit(titleText, imgSrc, extraInfoHtml) {
    resetZoom();
    const exhibit = document.getElementById('exhibit-box');
    if (!exhibit) return;
    exhibit.innerHTML = `
        <div class="flex justify-between items-center mb-1">
            <p class="text-amber-400 font-mono" style="font-size: 0.85em;">${titleText}</p>
            <div class="flex items-center gap-1.5 bg-stone-950 px-2 py-0.5 rounded border border-stone-700 text-[10px] font-mono">
                <span class="text-stone-400">ZOOM:</span>
                <span id="zoom-level-text" class="text-cyan-300 font-bold w-9 text-center">100%</span>
                <button onclick="zoomOut()" class="bg-stone-800 hover:bg-stone-700 text-white px-1.5 rounded font-bold cursor-pointer">－</button>
                <button onclick="resetZoom()" class="bg-stone-800 hover:bg-stone-700 text-amber-300 px-1 rounded cursor-pointer">⊙</button>
                <button onclick="zoomIn()" class="bg-stone-800 hover:bg-stone-700 text-white px-1.5 rounded font-bold cursor-pointer">＋</button>
            </div>
        </div>
        <div id="zoom-box" class="zoom-container rounded border border-stone-700 h-36 bg-black flex items-center justify-center relative overflow-hidden shadow-inner">
            <img id="active-exhibit-img" src="${imgSrc}" loading="lazy" alt="Exhibit" style="max-width:100%; max-height:100%; object-fit:contain; transition: transform 0.1s ease-out; transform-origin:center center;">
        </div>
        ${extraInfoHtml}
    `;
    setTimeout(initImageDrag, 50);
}

function goToPhase(phase) {
    currentPhase = phase;
    
    if (currentCase === 1) {
        case1MaxPhase = Math.max(case1MaxPhase, phase);
    } else if (currentCase === 2) {
        case2MaxPhase = Math.max(case2MaxPhase, phase);
    } else if (currentCase === 3) {
        case3MaxPhase = Math.max(case3MaxPhase, phase);
    }

    const body = document.getElementById('modal-body-content');
    if (body) {
        body.classList.remove('phase-fade-in');
        void body.offsetWidth; 
        body.classList.add('phase-fade-in');
    }
    const backBtn = document.getElementById('back-btn');
    
    const feedbackTerminal = document.getElementById('feedback-terminal');
    if (feedbackTerminal) feedbackTerminal.classList.add('hidden');

    let maxPhases = (currentCase === 1) ? 8 : 6;
    
    if (currentPhase > 1 && currentPhase < maxPhases) {
        backBtn.classList.remove('hidden');
    } else {
        backBtn.classList.add('hidden');
    }

    if (currentCase === 1) {
        loadCase1Phases(phase, body);
    } else if (currentCase === 2) {
        loadCase2Phases(phase, body);
    } else if (currentCase === 3) {
        loadCase3Phases(phase, body);
    }

    updateDetectiveBoard(phase, currentCase);

    let savedChain = (currentCase === 1) ? solvedPhasesC1[phase] : (currentCase === 2) ? solvedPhasesC2[phase] : solvedPhasesC3[phase];    
    if (savedChain) {
        const listId = (currentCase === 1 && phase === 7) ? 'causal-list-c1' : (currentCase === 2 && phase === 5) ? 'causal-list' : null;
        if (listId) {
            const container = document.getElementById(listId);
            if (container) {
                const items = Array.from(container.querySelectorAll('[data-id]'));
                items.sort((a, b) => parseInt(a.getAttribute('data-id')) - parseInt(b.getAttribute('data-id')));
                container.innerHTML = '';
                items.forEach(i => {
                    i.className = "bg-emerald-50 border-2 border-emerald-500 p-2.5 rounded-lg flex items-center justify-between shadow-sm text-xs font-sans font-bold text-emerald-900";
                    container.appendChild(i);
                });
                showFeedbackWithNext(savedChain.message, true, savedChain.nextPhase);
            }
        }
    }
}

// ==========================================
function loadCase1Phases(phase, body) {
    let c1Count = getCase1EvidenceText();
    let c2Count = getCase2EvidenceText();
    let c3Count = getCase3EvidenceText();

    if (phase === 1) {
        updateHeader('PHASE 01 — CASE FILE', 'The Vanishing Ice', 'Phase 1 of 8', c1Count, c2Count, c3Count, 'Status: Active Investigation', 'Investigating Arctic Sea Ice minimum anomalies...');
        body.innerHTML = `
            <p>Every year, the Arctic Ocean freezes and melts with the seasons. In winter, sea ice expands. In summer, it retreats.</p>
            <p>Satellite observations spanning decades show an unusual downward shift. Your mission is to determine if this is natural or system-wide.</p>
            <div class="bg-amber-100 border border-amber-300 p-3 rounded-lg mt-3">
                <p class="font-bold text-stone-900 mb-2">🔍 PHASE 1 OBJECTIVE:</p>
                <button onclick="goToPhase(2)" class="bg-stone-900 hover:bg-stone-800 text-white font-bold px-4 py-2.5 rounded cursor-pointer w-full text-center">Begin Investigation ➔</button>
            </div>
        `;
        loadExhibit('🛰️ EXHIBIT #01 — HISTORICAL BASELINE (1979)', 'assets/P1.png', `<div class="mt-2 bg-stone-950 p-2 rounded text-cyan-300 font-mono text-xs">Baseline Status: Stable Ice Cover</div>`);
    } 
    else if (phase === 2) {
        updateHeader('PHASE 02 — THE FIRST CLUE', 'Evidence #01 — Seasonal Cycles', 'Phase 2 of 8', c1Count, c2Count, c3Count, 'Status: Active Investigation', 'Evidence #01 Logged.');
        body.innerHTML = `
            <p>Sea ice naturally expands in winter and shrinks in summer. We need to compare the Arctic across many years to find the real pattern.</p>
            <div class="bg-amber-100 border border-amber-300 p-3 rounded-lg mt-3"><div class="flex flex-col gap-2" id="p2-options-container"></div></div>
        `;
        loadExhibit('📊 EXHIBIT #02 — ANNUAL SEASONAL CURVES', 'assets/P3.png', `<div class="mt-2 bg-stone-950 p-2 rounded text-cyan-300 font-mono text-xs">Seasonal Amplitude Tracked</div>`);
        renderOptions('p2-options-container', [
            { text: 'Compare individual months across random years.', correct: false },
            { text: 'Compare the same season across many years.', correct: true }
        ], 'answerPhase2');
    }
    else if (phase === 3) {
        updateHeader('PHASE 03 — SATELLITE RECORD', 'Evidence #02 — 40+ Years Observation', 'Phase 3 of 8', c1Count, c2Count, c3Count, 'Status: Active Investigation', 'Evidence #02 Logged.');
        body.innerHTML = `
            <p>Let's examine satellite observations of September minimums from 1979 to the present.</p>
            <div class="bg-amber-100 border border-amber-300 p-3 rounded-lg mt-3"><div class="flex flex-col gap-2" id="p3-options-container"></div></div>
        `;
        loadExhibit('📈 EXHIBIT #03 — SUMMER MINIMUM TREND', 'assets/P2.png', `<div class="mt-2 bg-stone-950 p-2 rounded text-cyan-300 font-mono text-xs">Multi-year decline observed</div>`);
        renderOptions('p3-options-container', [
            { text: 'Arctic sea ice disappears completely every summer.', correct: false },
            { text: 'Ice levels fluctuate with no long-term direction.', correct: false },
            { text: 'Arctic sea ice has generally decreased despite year-to-year fluctuations.', correct: true }
        ], 'answerPhase3');
    }
    else if (phase === 4) {
        updateHeader('PHASE 04 — SPATIAL ANALYSIS', 'Evidence #03 & #04 — Regional Sectors', 'Phase 4 of 8', c1Count, c2Count, c3Count, 'Status: Active Investigation', 'Evidence #03/04 Logged.');
        body.innerHTML = `
            <p>Let's inspect regional satellite maps and spatial boundaries where ice is lost.</p>
            
            <div class="my-3 bg-stone-900 p-3 rounded-lg text-white font-mono text-xs shadow-inner border border-amber-600/30">
                <div class="flex justify-between items-center mb-1.5">
                    <span class="text-amber-400 font-bold flex items-center gap-1">⏱️ NASA Time Machine Slider:</span>
                    <span id="slider-year-label" class="text-cyan-300 font-bold text-sm bg-stone-950 px-2 py-0.5 rounded border border-stone-700">1979</span>
                </div>
                <input type="range" min="1979" max="2022" value="1979" step="1" class="w-full accent-amber-500 cursor-pointer" oninput="updateTimeSlider(this.value)">
                <p class="text-stone-400 text-[10px] mt-1 text-center">Arctic Sea Ice Extent - September Minimum.</p>
            </div>

            <div class="bg-amber-100 border border-amber-300 p-3 rounded-lg mt-3"><div class="flex flex-col gap-2" id="p4-options-container"></div></div>
        `;
        loadExhibit('🛰️ EXHIBIT #04 — SPATIAL BOUNDARY MAP', 'assets/1979.png', `<div class="mt-2 bg-stone-950 p-2 rounded text-stone-300 font-mono text-xs">Edge boundary reductions</div>`);
        renderOptions('p4-options-container', [
            { text: 'Ice is melting evenly across the entire deep Arctic sheet.', correct: false },
            { text: 'Ice has retreated from the edges; large areas are now open ocean.', correct: true }
        ], 'answerPhase4');
    }
    else if (phase === 5) {
        updateHeader('PHASE 05 — TEMPERATURE', 'Evidence #05 — Temperature Connection', 'Phase 5 of 8', c1Count, c2Count, c3Count, 'Status: Active Investigation', 'Evidence #05 Logged.');
        body.innerHTML = `
            <p>If warming contributes to ice decline, what should we expect in temperature records?</p>
            <div class="bg-amber-100 border border-amber-300 p-3 rounded-lg mt-3"><div class="flex flex-col gap-2" id="p5-options-container"></div></div>
        `;
        loadExhibit('🌡️ EXHIBIT #06 — TEMPERATURE ANOMALIES', 'assets/P6.png', `<div class="mt-2 bg-stone-950 p-2 rounded text-red-400 font-mono text-xs">Arctic Warming Rate: +0.75°C/decade</div>`);
        renderOptions('p5-options-container', [
            { text: 'Temperatures should remain roughly unchanged.', correct: false },
            { text: 'Temperatures should become progressively colder.', correct: false },
            { text: 'Arctic temperatures should show a long-term warming pattern.', correct: true }
        ], 'answerPhase5Pred');
    }
    else if (phase === 6) {
        updateHeader('CASE 01 — PHASE 06 — ARCTIC AMPLIFICATION', 'NASA Earth Observatory Evidence', 'Phase 6 of 8', c1Count, c2Count, c3Count, 'Status: Active Investigation', 'Analyzing Arctic Amplification metrics...');
        body.innerHTML = `
            <div class="space-y-3">
                <div class="flex items-center gap-2 border-b border-amber-800/30 pb-2">
                    <span class="text-amber-900 font-mono text-xs font-bold tracking-wider">PHASE 06 — ARCTIC AMPLIFICATION</span>
                    <span class="text-xs bg-amber-800/10 text-amber-900 px-2 py-0.5 rounded border border-amber-800/20">NASA Earth Observatory</span>
                </div>
                
                <p class="text-stone-800 leading-relaxed">
                    NASA reports indicate that the Arctic is warming much faster than the rest of the planet, based on data from the Earth Observatory. What is the main reason for the acceleration of this warming?
                </p>

                <div class="bg-amber-100 border border-amber-300 p-3 rounded-lg">
                    <p class="font-bold text-stone-900 mb-2 text-xs">🎯 Choose the correct scientific analysis:</p>
                    <div class="flex flex-col gap-2" id="p6-options-container"></div>
                </div>

                <div id="p6-feedback" class="hidden text-xs p-2.5 rounded-lg border"></div>
            </div>
        `;

        loadExhibit('🛰️ EXHIBIT #07 — ARCTIC AMPLIFICATION', 'assets/P67.png', `<div class="mt-2 bg-stone-950 p-2 rounded text-amber-300 font-mono text-xs">NASA Earth Observatory Data Verified</div>`);
        renderOptions('p6-options-container', [
            { text: 'Nothing changes.', correct: false },
            { text: 'More sunlight is reflected back to space.', correct: false },
            { text: 'More sunlight is absorbed by the ocean.', correct: true }
        ], 'answerPhase6');
    }
    else if (phase === 7) {
        updateHeader('CASE 01 — PHASE 07', 'Evidence #07 — Causal Chain Assembly', 'Phase 7 of 8', c1Count, c2Count, c3Count, 'Status: Active Investigation', 'Arranging Ice-Albedo feedback chain...');
        body.innerHTML = `
            <div class="space-y-3">
                <p class="text-stone-800 font-sans">Arrange the Ice-Albedo feedback loop elements into the correct logical sequence using the <strong>(↑ ↓)</strong> arrows:</p>
                
                <div class="bg-amber-100 border border-amber-300 p-3 rounded-lg space-y-2 font-mono" id="causal-list-c1">
                    <div data-id="3" class="bg-white p-2.5 rounded border border-stone-300 flex items-center justify-between shadow-sm">
                        <span> Less reflective ice remains</span>
                        <div class="flex gap-1">
                            <button onclick="moveItemC1(this, -1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold cursor-pointer">↑</button>
                            <button onclick="moveItemC1(this, 1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold cursor-pointer">↓</button>
                        </div>
                    </div>
                    <div data-id="1" class="bg-white p-2.5 rounded border border-stone-300 flex items-center justify-between shadow-sm">
                        <span>Rising temperatures</span>
                        <div class="flex gap-1">
                            <button onclick="moveItemC1(this, -1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold cursor-pointer">↑</button>
                            <button onclick="moveItemC1(this, 1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold cursor-pointer">↓</button>
                        </div>
                    </div>
                    <div data-id="5" class="bg-white p-2.5 rounded border border-stone-300 flex items-center justify-between shadow-sm">
                        <span>More solar energy is absorbed</span>
                        <div class="flex gap-1">
                            <button onclick="moveItemC1(this, -1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold cursor-pointer">↑</button>
                            <button onclick="moveItemC1(this, 1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold cursor-pointer">↓</button>
                        </div>
                    </div>
                    <div data-id="2" class="bg-white p-2.5 rounded border border-stone-300 flex items-center justify-between shadow-sm">
                        <span>Sea ice melts</span>
                        <div class="flex gap-1">
                            <button onclick="moveItemC1(this, -1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold cursor-pointer">↑</button>
                            <button onclick="moveItemC1(this, 1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold cursor-pointer">↓</button>
                        </div>
                    </div>
                    <div data-id="7" class="bg-white p-2.5 rounded border border-stone-300 flex items-center justify-between shadow-sm">
                        <span>Further sea-ice loss</span>
                        <div class="flex gap-1">
                            <button onclick="moveItemC1(this, -1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold cursor-pointer">↑</button>
                            <button onclick="moveItemC1(this, 1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold cursor-pointer">↓</button>
                        </div>
                    </div>
                    <div data-id="4" class="bg-white p-2.5 rounded border border-stone-300 flex items-center justify-between shadow-sm">
                        <span>More dark ocean is exposed</span>
                        <div class="flex gap-1">
                            <button onclick="moveItemC1(this, -1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold cursor-pointer">↑</button>
                            <button onclick="moveItemC1(this, 1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold cursor-pointer">↓</button>
                        </div>
                    </div>
                    <div data-id="6" class="bg-white p-2.5 rounded border border-stone-300 flex items-center justify-between shadow-sm">
                        <span>Additional warming</span>
                        <div class="flex gap-1">
                            <button onclick="moveItemC1(this, -1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold cursor-pointer">↑</button>
                            <button onclick="moveItemC1(this, 1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold cursor-pointer">↓</button>
                        </div>
                    </div>
                </div>

                <div class="mt-3">
                    <button onclick="verifyCausalChainC1()" class="bg-amber-800 hover:bg-amber-900 text-white font-bold px-4 py-2.5 rounded cursor-pointer w-full text-center shadow-sm transition-colors">Confirm Chain & View Verdict ➔</button>
                </div>

                <div id="feedback-container"></div>
            </div>
        `;
        loadExhibit('🔗 EXHIBIT — ICE-ALBEDO FEEDBACK', 'assets/P67.png', `<div class="mt-2 bg-stone-950 p-2 rounded text-amber-200 font-mono">Positive Feedback Loop Mechanism</div>`);
    }
    else if (phase === 8) {
        updateHeader('CASE 01 — VERDICT // CLOSED', 'Detective Report: Case 01 Solved', 'Completed (8/8)', c1Count, c2Count, c3Count, 'CASE SOLVED / CLOSED', 'Investigation concluded successfully.');
        document.getElementById('metrics-status').innerText = 'Completed';
        document.getElementById('metrics-status').className = 'text-emerald-400 font-bold';
        document.getElementById('back-btn').classList.add('hidden');

        body.innerHTML = `
            <div class="bg-emerald-100 border border-emerald-400 p-4 rounded-lg mb-3 shadow-inner">
                <h3 class="font-bold text-emerald-900 mb-1 text-lg">🎉 CASE 01 — THE VANISHING ICE: SOLVED!</h3>
                <p class="font-mono text-xs text-emerald-950 font-bold mb-1">🏅 INVESTIGATOR: ${detectiveName}</p>
                <p class="font-serif text-emerald-800 leading-relaxed">You investigated WHAT, WHEN, HOW MUCH, and WHERE the ice is lost, confirming the Ice–Albedo Feedback Loop.</p>
            </div>
            <div class="space-y-1 font-mono bg-stone-100 p-3 rounded border ">
                <p>✓ Evidence collected: 6/6</p>
                <p>✓ Spatial patterns identified: Where & How much</p>
                <p>✓ Feedback mechanism: Ice-Albedo Confirmed</p>
            </div>
            <div class="mt-4 text-center">
                <button onclick="closeDocumentModal()" class="bg-stone-900 hover:bg-stone-800 text-white font-bold px-6 py-2.5 rounded cursor-pointer shadow">
                    Archive Case & Return to Desk ➔
                </button>
            </div>
        `;
        loadExhibit('🏆 ARCHIVE VERIFIED — CASE 01 SOLVED', 'assets/P2.png', `<div class="mt-2 bg-stone-950 p-2 rounded text-amber-200 font-mono text-center text-xs">Case 01 Successfully Closed & Verified via NASA Metrics</div>`);
    }
}

// ==========================================
function loadCase2Phases(phase, body) {
    let c1Count = getCase1EvidenceText();
    let c2Count = getCase2EvidenceText();
    let c3Count = getCase3EvidenceText();

    if (phase === 1) {
        updateHeader('CASE 02 — PHASE 01', "India's Wheat Outlook (Jan 2022)", 'Phase 1 of 6', c1Count, c2Count, c3Count, 'Status: Export Restriction', 'Investigating South Asia food supply vulnerability.');
        body.innerHTML = `
            <p><strong>Location:</strong> South Asia | <strong>Timeframe:</strong> January–May 2022.</p>
            <p>India expected a strong harvest and large reserves. Instead, in May 2022, India unexpectedly restricted wheat exports. What caused this sudden shift?</p>
            <div class="bg-amber-100 border border-amber-300 p-3 rounded-lg mt-3">
                <p class="font-bold text-stone-900 mb-2">🔍 HYPOTHESIS FORMULATION:</p>
                <div class="flex flex-col gap-2" id="c2-p1-options"></div>
            </div>
        `;
        loadExhibit('📊 EXHIBIT #01 — INITIAL WHEAT OUTLOOK', 'assets/2P0.png', `<div class="mt-2 bg-stone-950 p-2 rounded text-cyan-300 font-mono text-xs">Source: NASA POWER Meteorological Data </div>`);
        renderOptions('c2-p1-options', [
            { text: 'A harvest failure or crop stress occurred prior to export restrictions.', correct: true },
            { text: 'A sudden deliberate shift in long-term trade policy without climate trigger.', correct: false },
            { text: 'International trade disruption unrelated to domestic production.', correct: false }
        ], 'answerCase2P1');
    } 
    else if (phase === 2) {
        updateHeader('CASE 02 — PHASE 02', 'Evidence #01 — South Asia Heatwave', 'Phase 2 of 6', c1Count, c2Count, c3Count, 'Status: Active Investigation', 'Analyzing thermal anomalies.');
        body.innerHTML = `
            <p>Examine NASA GEOS modelled air temperatures across India and Pakistan in April 2022. The wheat supply didn't drop for no reason; something affected the crop prior to the export ban.</p>
            <div class="bg-amber-100 border border-amber-300 p-3 rounded-lg mt-3">
                <p class="font-bold text-stone-900 mb-2">🌡️ EXAMINE THE HEATWAVE MAP:</p>
                <div class="flex flex-col gap-2" id="c2-p2-options"></div>
            </div>
        `;
        loadExhibit('🛰️ EXHIBIT #02 — 2022 HEATWAVE (NASA GEOS)', 'assets/2P1.png', `<div class="mt-2 bg-stone-950 p-2 rounded text-red-400 font-mono text-xs">Maximum Air Temperature >44°C across cities </div>`);
        renderOptions('c2-p2-options', [
            { text: 'Extreme heat stresses wheat crops and severely reduces grain development.', correct: true },
            { text: 'Heat improves grain quality and increases total crop yield.', correct: false }
        ], 'answerCase2P2');
    }
    else if (phase === 3) {
        updateHeader('CASE 02 — PHASE 03', 'Evidence #02 — MODIS Vegetation Index', 'Phase 3 of 6', c1Count, c2Count, c3Count, 'Status: Active Investigation', 'Verifying crop health anomalies.');
        body.innerHTML = `
            <div class="space-y-3">
                <div class="flex items-center gap-2 border-b border-amber-800/30 pb-2">
                    <span class="text-amber-900 font-mono text-xs font-bold tracking-wider">PHASE 03 — SATELLITE EVIDENCE</span>
                    <span class="text-xs bg-amber-800/10 text-amber-900 px-2 py-0.5 rounded border border-amber-800/20">MOD13Q1 NDVI Data</span>
                </div>
                
                <p class="text-stone-800 leading-relaxed font-sans">
                    We examine 16-day composite vegetation index data (MODIS NDVI) across South Asia's wheat belts. A noticeable drop in greenness appears during the critical spring growing season.
                </p>

                <div class="bg-amber-100 border border-amber-300 p-3 rounded-lg space-y-2">
                    <p class="font-bold text-stone-900 text-xs">⚠️ Detective Warning / Scientific Caveat:</p>
                    <p class="text-xs text-stone-700 leading-relaxed">
                        A drop in NDVI alone is not definitive proof of crop failure. To confirm the anomaly, we must cross-reference it with another critical dataset.
                    </p>
                </div>

                <div class="bg-amber-100 border border-amber-300 p-3 rounded-lg">
                    <p class="font-bold text-stone-900 mb-2 text-xs">🎯 What dataset must be paired with NDVI to confirm the wheat stress?</p>
                    <div class="flex flex-col gap-2" id="p3-options-container"></div>
                </div>

                <div id="p3-feedback" class="hidden text-xs p-2.5 rounded-lg border"></div>
            </div>
        `;
        
        loadExhibit('🛰️ EXHIBIT — MODIS VEGETATION ANOMALY', 'assets/2P2.png', `<div class="mt-2 bg-stone-950 p-2 rounded text-amber-200 font-mono text-xs">MODIS 250m Resolution Vegetation Index Verified</div>`);
        
        renderOptions('p3-options-container', [
            { text: 'Daily maximum temperature and crop-calendar data to verify heat stress during the critical growth phase.', correct: true },
            { text: 'Social media posts and local news headlines from agricultural regions.', correct: false },
            { text: 'Global stock market prices for unrelated commodities.', correct: false }
        ], 'answerPhase2P3');
    }
    else if (phase === 4) {
        updateHeader('CASE 02 — PHASE 04 — TEMPERATURE ANOMALY TEST', 'NASA POWER Meteorological Data', 'Phase 4 of 6', c1Count, c2Count, c3Count, 'Status: Active Investigation', 'Analyzing daily maximum temperatures...');
        body.innerHTML = `
            <div class="space-y-3">
                <div class="flex items-center gap-2 border-b border-amber-800/30 pb-2">
                    <span class="text-amber-900 font-mono text-xs font-bold tracking-wider">PHASE 04 — TEMPERATURE ANOMALY TEST</span>
                    <span class="text-xs bg-amber-800/10 text-amber-900 px-2 py-0.5 rounded border border-amber-800/20">NASA POWER Data</span>
                </div>
                
                <p class="text-stone-800 leading-relaxed font-sans">
                    Analyzing extracted daily maximum temperatures from NASA POWER for the Punjab agricultural belt (31.147°N, 75.341°E). Data captures the brutal late-season heatwave peak spanning <strong>late April into early May 2022</strong>, coinciding directly with the critical wheat ripening and grain-filling phase.
                </p>

                <div class="bg-amber-100 border border-amber-300 p-3 rounded-lg space-y-2">
                    <p class="font-bold text-stone-900 text-xs">📊 NASA POWER Extracted Metrics:</p>
                    <div class="grid grid-cols-2 gap-2 text-xs font-mono bg-white p-2.5 rounded border border-amber-200">
                        <div>Historical Avg: <span class="font-bold text-stone-700">~32.0°C</span></div>
                        <div>2022-04-30 Peak: <span class="font-bold text-red-700">45.12°C</span></div>
                        <div>2022-05-01 Peak: <span class="font-bold text-red-700">43.53°C</span></div>
                        <div>Source: <span class="font-bold text-stone-700">MERRA-2 / POWER</span></div>
                    </div>
                </div>

                <div class="bg-amber-100 border border-amber-300 p-3 rounded-lg">
                    <p class="font-bold text-stone-900 mb-2 text-xs">🎯 Scientific Question: Do these extracted NASA POWER metrics confirm an extreme, atypical heatwave during the crop ripening phase?</p>
                    <div class="flex flex-col gap-2" id="p4-options-container"></div>
                </div>

                <div id="feedback-container"></div>
            </div>
        `;
        
        renderOptions('p4-options-container', [
            { text: 'Yes, temperatures exceeding 45°C confirm an extreme and damaging thermal anomaly that severely impacted wheat grain-filling.', correct: true },
            { text: 'No, these temperatures are normal seasonal values for early spring.', correct: false },
            { text: 'Temperatures dropped unexpectedly, causing frost rather than heat stress.', correct: false }
        ], 'answerPhase2P4');
    }
    else if (phase === 5) {
        updateHeader('CASE 02 — PHASE 05', 'Evidence #04 — Causal Chain Assembly', 'Phase 5 of 6', c1Count, c2Count, c3Count, 'Status: Active Investigation', 'Arranging evidence chain.');
        body.innerHTML = `
            <div class="space-y-3">
                <p class="text-stone-800 text-xs font-sans">Arrange the collected evidence into the most logical chain of events from climate trigger to export policy using the <strong>(↑ ↓)</strong> arrows:</p>
                
                <div class="bg-amber-100 border border-amber-300 p-3 rounded-lg space-y-2 text-xs font-mono" id="causal-list">
                    <div data-id="3" class="bg-white p-2.5 rounded border border-stone-300 flex items-center justify-between shadow-sm">
                        <span> Harvest falls below domestic expectations</span>
                        <div class="flex gap-1">
                            <button onclick="moveItem(this, -1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold">↑</button>
                            <button onclick="moveItem(this, 1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold">↓</button>
                        </div>
                    </div>
                    <div data-id="1" class="bg-white p-2.5 rounded border border-stone-300 flex items-center justify-between shadow-sm">
                        <span> Extreme heat event in South Asia</span>
                        <div class="flex gap-1">
                            <button onclick="moveItem(this, -1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold">↑</button>
                            <button onclick="moveItem(this, 1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold">↓</button>
                        </div>
                    </div>
                    <div data-id="4" class="bg-white p-2.5 rounded border border-stone-300 flex items-center justify-between shadow-sm">
                        <span> India restricts wheat exports to secure domestic supply</span>
                        <div class="flex gap-1">
                            <button onclick="moveItem(this, -1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold">↑</button>
                            <button onclick="moveItem(this, 1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold">↓</button>
                        </div>
                    </div>
                    <div data-id="2" class="bg-white p-2.5 rounded border border-stone-300 flex items-center justify-between shadow-sm">
                        <span> Wheat crop under severe physiological stress</span>
                        <div class="flex gap-1">
                            <button onclick="moveItem(this, -1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold">↑</button>
                            <button onclick="moveItem(this, 1)" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-stone-800 rounded font-bold">↓</button>
                        </div>
                    </div>
                </div>

                <div class="mt-3">
                    <button onclick="verifyCausalChain()" class="bg-amber-800 hover:bg-amber-900 text-white font-bold px-4 py-2.5 rounded cursor-pointer w-full text-center text-xs shadow-sm transition-colors">Confirm Chain & View Verdict ➔</button>
                </div>

                <div id="feedback-container"></div>
            </div>
        `;
        loadExhibit('🔗 EXHIBIT #05 — SYNTHESIS MAPPING', 'assets/2P4.png', `<div class="mt-2 bg-stone-950 p-2 rounded text-amber-200 font-mono text-xs">Integrated Environmental Dataset </div>`);
    }
    else if (phase === 6) {
        updateHeader('CASE 02 — VERDICT // CLOSED', 'Detective Report: Case 02 Solved', 'Completed (6/6)', c1Count, c2Count, c3Count, 'CASE SOLVED / CLOSED', 'Climate event linked to food security.');
        document.getElementById('metrics-status').innerText = 'Completed';
        document.getElementById('metrics-status').className = 'text-emerald-400 font-bold';
        document.getElementById('back-btn').classList.add('hidden');

        body.innerHTML = `
            <div class="bg-emerald-100 border border-emerald-400 p-4 rounded-lg mb-3 shadow-inner">
                <h3 class="font-bold text-emerald-900 mb-1 text-lg">🎉 CASE 02 — THE MISSING WHEAT: SOLVED!</h3>
                <p class="font-mono text-xs text-emerald-950 font-bold mb-1">🏅 INVESTIGATOR: ${detectiveName}</p>
                <p class="font-serif">Your evidence supports the conclusion that an extreme heat event across South Asia affected wheat during a critical stage of the growing season.</p>
            </div>
            <div class="space-y-1 font-mono bg-stone-100 p-3 rounded border text-sm">
                <p>✓ EVIDENCE COLLECTED: 5/5</p>
                <p>✓ CASE STATUS: SOLVED</p>
            </div>
            <div class="mt-4 text-center">
                <button onclick="closeDocumentModal()" class="bg-stone-900 hover:bg-stone-800 text-white font-bold px-6 py-2.5 rounded cursor-pointer shadow">
                    Archive Case & Return to Desk ➔
                </button>
            </div>
        `;
        loadExhibit('🏆 ARCHIVE VERIFIED — CASE 02 SOLVED', 'assets/2P2.png', `<div class="mt-2 bg-stone-950 p-2 rounded text-amber-200 font-mono text-center text-xs">Case 02 Successfully Closed & Verified via NASA Data</div>`);
    }
}

function loadCase3Phases(phase, body) {
    let c1Count = getCase1EvidenceText();
    let c2Count = getCase2EvidenceText();
    let c3Count = getCase3EvidenceText();

    if (phase === 1) {
        updateHeader('PHASE 01 — CASE FILE', 'The Warming World: Temperature Anomalies', 'Phase 1 of 6', c1Count, c2Count, c3Count, 'Status: Active Investigation', 'Investigating global climate anomaly baseline...');
        body.innerHTML = `
            <p>Earth's climate fluctuates naturally, but scientists observe a significant global temperature change since 1880. Some regions warm much faster than others.</p>
            <p>Your mission: Investigate historical temperature records, compare global anomaly maps, and discover why warming varies across regions.</p>
            <div class="bg-amber-100 border border-amber-300 p-3 rounded-lg mt-3">
                <p class="font-bold text-stone-900 mb-2">🔍 PHASE 1 OBJECTIVE:</p>
                <button onclick="goToPhase(2)" class="bg-stone-900 hover:bg-stone-800 text-white font-bold px-4 py-2.5 rounded cursor-pointer w-full text-center">Begin Investigation ➔</button>
            </div>
        `;
        loadExhibit('🛰️ EXHIBIT #01 — GLOBAL TEMPERATURE ANOMALY (NASA SVS)', 'assets/2024.png', `<div class="mt-2 bg-stone-950 p-2 rounded text-cyan-300 font-mono text-xs">Source: NASA Goddard Institute for Space Studies (GISS)</div>`);
    }
   else if (phase === 2) {
        updateHeader('PHASE 02 — THE FIRST CLUE', 'Evidence #01 — Early vs Recent Maps', 'Phase 2 of 6', c1Count, c2Count, c3Count, 'Status: Active Investigation', 'Comparing historical and recent temperature anomaly maps.');
        body.innerHTML = `
            <p>A temperature anomaly measures how much warmer or colder a place was compared with its historical reference average (Positive = warmer, Negative = colder).</p>
            
            <div class="my-3 flex items-center justify-center gap-3 bg-stone-900 p-2.5 rounded-lg border border-cyan-500/30">
                <span class="text-cyan-300 font-mono text-xs font-bold">🔍 Select Map View:</span>
                <button onclick="switchCase3Map('1880-1884')" id="btn-map-1" class="bg-cyan-900 text-cyan-200 border border-cyan-400 px-3 py-1 rounded text-xs font-mono font-bold cursor-pointer transition">1880-1884 (Early)</button>
                <button onclick="switchCase3Map('2024')" id="btn-map-2" class="bg-stone-800 text-stone-300 border border-stone-700 px-3 py-1 rounded text-xs font-mono font-bold cursor-pointer transition">Recent (2024)</button>
            </div>

            <div class="bg-amber-100 border border-amber-300 p-3 rounded-lg mt-3"><div class="flex flex-col gap-2" id="c3-p2-options"></div></div>
        `;
        
        loadExhibit('📊 EXHIBIT #02 — EARLY VS RECENT MAPS', 'assets/1880-1884.png', `<div class="mt-2 bg-stone-950 p-2 rounded text-cyan-300 font-mono text-xs flex justify-between items-center"><span>Active Map: <span id="current-map-label" class="font-bold text-amber-300">1880-1884</span></span><span>NASA World of Change Historical Maps</span></div>`);
        
        renderOptions('c3-p2-options', [
            { text: 'The region has the highest absolute temperature on Earth.', correct: false },
            { text: 'The region is warmer than its reference-period average.', correct: true },
            { text: 'The region has no seasonal changes.', correct: false },
            { text: 'The region receives more sunlight than every other region.', correct: false }
        ], 'answerCase3P2');
    }
    else if (phase === 3) {
        updateHeader('PHASE 03 — HISTORICAL RECORD', 'Evidence #02 — More Than a Century of Temperatures', 'Phase 3 of 6', c1Count, c2Count, c3Count, 'Status: Active Investigation', 'Examining GISTEMP line graph.');
        body.innerHTML = `
            <p>Examine the global annual temperature anomaly line graph from 1880 to the present (NASA GISTEMP record, reference period 1951-1980).</p>
            <div class="bg-amber-100 border border-amber-300 p-3 rounded-lg mt-3"><div class="flex flex-col gap-2" id="c3-p3-options"></div></div>
        `;
        loadExhibit('📈 EXHIBIT #03 — GISTEMP GLOBAL MEAN ESTIMATES', 'assets/3P1.png', `<div class="mt-2 bg-stone-950 p-2 rounded text-cyan-300 font-mono text-xs">NASA GISS Land and Ocean Annual Anomalies & Lowess Smoothing</div>`);
        renderOptions('c3-p3-options', [
            { text: 'Global temperatures have remained approximately constant.', correct: false },
            { text: 'Global temperatures have generally declined since 1880.', correct: false },
            { text: 'Global temperatures have risen over the long term, despite short-term fluctuations.', correct: true },
            { text: 'Every year has been warmer than the previous year.', correct: false }
        ], 'answerCase3P3');
    }
    else if (phase === 4) {
        updateHeader('PHASE 04 — REGIONAL DIFFERENCES', 'Evidence #03 & #04 — The Geographic Puzzle', 'Phase 4 of 6', c1Count, c2Count, c3Count, 'Status: Active Investigation', 'Comparing regional warming rates.');
        body.innerHTML = `
            <p>Not all regions warm alike. Land and ocean areas respond differently based on their heat storage capacity.</p>
            <div class="bg-amber-100 border border-amber-300 p-3 rounded-lg mt-3"><div class="flex flex-col gap-2" id="c3-p4-options"></div></div>
        `;
        loadExhibit('🛰️ EXHIBIT #04 — REGIONAL ANOMALY COMPARISON', 'assets/1951-1980.png', `<div class="mt-2 bg-stone-950 p-2 rounded text-stone-300 font-mono text-xs">NASA GISTEMP Regional Maps</div>`);
        renderOptions('c3-p4-options', [
            { text: 'Every region warms at exactly the same rate.', correct: false },
            { text: 'The global average can rise even when some regions warm more slowly than others.', correct: true },
            { text: 'If one region cools temporarily, global warming must have stopped.', correct: false },
            { text: 'Ocean temperatures always rise faster than land temperatures.', correct: false }
        ], 'answerCase3P4');
    }
    else if (phase === 5) {
        updateHeader('PHASE 05 — TEST THE HYPOTHESIS', 'Evidence #05 — Is the Pattern Consistent?', 'Phase 5 of 6', c1Count, c2Count, c3Count, 'Status: Active Investigation', 'Validating multi-decadal trends.');
        body.innerHTML = `
            <p>If Earth is experiencing a genuine long-term warming trend, what should we expect when we examine many decades of observations?</p>
            <div class="bg-amber-100 border border-amber-300 p-3 rounded-lg mt-3"><div class="flex flex-col gap-2" id="c3-p5-options"></div></div>
        `;
        loadExhibit('🌡️ EXHIBIT #05 — MULTI-DECADE TREND ANALYSIS', 'assets/3P2.png', `<div class="mt-2 bg-stone-950 p-2 rounded text-red-400 font-mono text-xs">NASA GISTEMP Interactive Maps</div>`);
        renderOptions('c3-p5-options', [
            { text: 'A long-term upward trend, even if individual years fluctuate.', correct: true },
            { text: 'Identical temperatures in every region.', correct: false },
            { text: 'A steady increase in every location every year.', correct: false },
            { text: 'No relationship between long-term records and the global average.', correct: false }
        ], 'answerCase3P5');
    }
    else if (phase === 6) {
        updateHeader('CASE 03 — VERDICT // CLOSED', 'Detective Report: Case 03 Solved', 'Completed (6/6)', c1Count, c2Count, c3Count, 'CASE SOLVED / CLOSED', 'Global climate anomaly pattern verified.');
        document.getElementById('metrics-status').innerText = 'Completed';
        document.getElementById('metrics-status').className = 'text-emerald-400 font-bold';
        document.getElementById('back-btn').classList.add('hidden');

        body.innerHTML = `
            <div class="bg-emerald-100 border border-emerald-400 p-4 rounded-lg mb-3 shadow-inner">
                <h3 class="font-bold text-emerald-900 mb-1 text-lg">🎉 CASE 03 — THE WARMING WORLD: SOLVED!</h3>
                <p class="font-mono text-xs text-emerald-950 font-bold mb-1">🏅 INVESTIGATOR: ${detectiveName}</p>
                <p class="font-serif text-emerald-800 leading-relaxed">Historical temperature records reveal a long-term rise in global surface temperature driven by anthropogenic greenhouse gases, with regionally varying rates of change.</p>
            </div>
            <div class="space-y-1 font-mono bg-stone-100 p-3 rounded border text-xs">
                <p>✓ Evidence examined: 6/6</p>
                <p>✓ Temperature trends identified: Verified</p>
                <p>✓ Regional differences recognized: Validated</p>
            </div>
            <div class="mt-4 text-center">
                <button onclick="closeDocumentModal()" class="bg-stone-900 hover:bg-stone-800 text-white font-bold px-6 py-2.5 rounded cursor-pointer shadow">
                    Archive Case & Return to Desk ➔
                </button>
            </div>
        `;
        loadExhibit('🏆 ARCHIVE VERIFIED — CASE 03 SOLVED', 'assets/2024.png', `<div class="mt-2 bg-stone-950 p-2 rounded text-amber-200 font-mono text-center text-xs">Case 03 Successfully Closed & Verified via NASA GISTEMP</div>`);
    }
}

function updateTimeSlider(val) {
    let year = parseInt(val);
    const yearLabel = document.getElementById('slider-year-label');
    if (yearLabel) {
        yearLabel.innerText = year;
    }
    
    const activeImg = document.getElementById('active-exhibit-img');
    if (activeImg) {
        activeImg.src = `assets/${year}.png`;
    }
}

function answerPhase2(isCorrect, btn) {
    if (isCorrect) {
        btn.className = "bg-emerald-100 border-2 border-emerald-500 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm font-bold text-emerald-900";
        showFeedbackWithNext("Comparing the same season across many years successfully isolates long-term climate changes.", true, 3);
    } else {
        btn.className = "bg-red-100 border-2 border-red-400 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm text-red-900 opacity-60";
        showFeedbackWithNext("Incorrect pattern isolation. Try comparing the same season across years.", false, 2);
    }
}

function answerPhase3(isCorrect, btn) {
    if (isCorrect) {
        btn.className = "bg-emerald-100 border-2 border-emerald-500 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm font-bold text-emerald-900";
        showFeedbackWithNext("Arctic sea ice has generally decreased significantly despite annual fluctuations.", true, 4);
    } else {
        btn.className = "bg-red-100 border-2 border-red-400 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm text-red-900 opacity-60";
        showFeedbackWithNext("Incorrect trend analysis. Re-examine the multi-year satellite record.", false, 3);
    }
}

function answerPhase4(isCorrect, btn) {
    if (isCorrect) {
        btn.className = "bg-emerald-100 border-2 border-emerald-500 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm font-bold text-emerald-900";
        showFeedbackWithNext("Ice retreat is concentrated at boundaries, exposing open ocean during summer.", true, 5);
    } else {
        btn.className = "bg-red-100 border-2 border-red-400 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm text-red-900 opacity-60";
        showFeedbackWithNext("Incorrect spatial mapping. Check the regional boundary reductions.", false, 4);
    }
}

function answerPhase6(isCorrect, btn) {
    if (isCorrect) {
        btn.className = "bg-emerald-100 border-2 border-emerald-500 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm font-bold text-emerald-900";
        showFeedbackWithNext("Arctic Amplification confirmed via NASA Earth Observatory metrics!", true, 7);
    } else {
        btn.className = "bg-red-100 border-2 border-red-400 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm text-red-900 opacity-60";
        showFeedbackWithNext("Incorrect analysis. Re-examine Earth Observatory data.", false, 6);
    }
}

function answerPhase5Pred(isCorrect, btn) {
    if (isCorrect) {
        btn.className = "bg-emerald-100 border-2 border-emerald-500 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm font-bold text-emerald-900";
        showFeedbackWithNext("Arctic temperature records confirm a long-term warming trend.", true, 6);
    } else {
        btn.className = "bg-red-100 border-2 border-red-400 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm text-red-900 opacity-60";
        showFeedbackWithNext("Incorrect trend prediction. Keep Arctic amplification in mind.", false, 5);
    }
}

function answerCase2P1(isCorrect, btn) {
    if (isCorrect) {
        btn.className = "bg-emerald-100 border-2 border-emerald-500 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm font-bold text-emerald-900";
        showFeedbackWithNext("Correct hypothesis. Crop stress occurred prior to export restrictions.", true, 2);
    } else {
        btn.className = "bg-red-100 border-2 border-red-400 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm text-red-900 opacity-60";
        showFeedbackWithNext("Incorrect hypothesis. Re-evaluate domestic production factors.", false, 1);
    }
}

function answerCase2P2(isCorrect, btn) {
    if (isCorrect) {
        btn.className = "bg-emerald-100 border-2 border-emerald-500 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm font-bold text-emerald-900";
        showFeedbackWithNext("Correct analysis. Extreme heat severely reduces wheat grain development.", true, 3);
    } else {
        btn.className = "bg-red-100 border-2 border-red-400 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm text-red-900 opacity-60";
        showFeedbackWithNext("Incorrect analysis. Heatwaves stress crops rather than increasing yield.", false, 2);
    }
}

function answerPhase2P3(isCorrect, btnElement) {
    if (isCorrect) {
        btnElement.className = "bg-emerald-100 border-2 border-emerald-500 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm font-bold text-emerald-900";
        showFeedbackWithNext('<strong>✅ Correct!</strong> Scientific rigor maintained. NDVI data must be paired with meteorological temperature data to confirm agricultural stress.', true, 4);
    } else {
        btnElement.disabled = true;
        btnElement.className = "bg-red-100 border-2 border-red-400 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm text-red-900 opacity-60 cursor-not-allowed";
        showFeedbackWithNext('<strong>❌ Incorrect.</strong> Think like a NASA scientist: standalone vegetation drops can have multiple causes. What data verifies weather conditions? Try another answer!', false, 3);
    }
}

function answerPhase2P4(isCorrect, btnElement) {
    if (isCorrect) {
        document.querySelectorAll('#p4-options-container button').forEach(b => b.disabled = true);
        btnElement.className = "bg-emerald-100 border-2 border-emerald-500 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm font-bold text-emerald-900";
        showFeedbackWithNext("<strong>✅ Correct!</strong> NASA POWER data confirms extreme temperature anomalies exceeding 45.12°C, severely impacting wheat grain-filling.", true, 5);
    } else {
        btnElement.disabled = true;
        btnElement.className = "bg-red-100 border-2 border-red-400 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm text-red-900 opacity-60 cursor-not-allowed";
        showFeedbackWithNext("<strong>❌ Incorrect.</strong> Check the extracted NASA POWER metrics; temperatures reached record-breaking highs of over 45°C. Try another answer!", false, 4);
    }
}

function answerCase3P2(isCorrect, btn) {
    if (isCorrect) {
        btn.className = "bg-emerald-100 border-2 border-emerald-500 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm font-bold text-emerald-900";
        showFeedbackWithNext("Correct! A red region indicates temperatures warmer than its reference-period average.", true, 3);
    } else {
        btn.className = "bg-red-100 border-2 border-red-400 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm text-red-900 opacity-60";
        showFeedbackWithNext("Incorrect. Review the definition of temperature anomaly.", false, 2);
    }
}

function answerCase3P3(isCorrect, btn) {
    if (isCorrect) {
        btn.className = "bg-emerald-100 border-2 border-emerald-500 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm font-bold text-emerald-900";
        showFeedbackWithNext("Correct! Global temperatures have risen over the long term despite short-term fluctuations.", true, 4);
    } else {
        btn.className = "bg-red-100 border-2 border-red-400 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm text-red-900 opacity-60";
        showFeedbackWithNext("Incorrect trend analysis. Examine the NASA GISTEMP curve.", false, 3);
    }
}

function answerCase3P4(isCorrect, btn) {
    if (isCorrect) {
        btn.className = "bg-emerald-100 border-2 border-emerald-500 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm font-bold text-emerald-900";
        showFeedbackWithNext("Correct! The global average can rise even when regional warming rates vary.", true, 5);
    } else {
        btn.className = "bg-red-100 border-2 border-red-400 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm text-red-900 opacity-60";
        showFeedbackWithNext("Incorrect interpretation of regional map variations.", false, 4);
    }
}

function answerCase3P5(isCorrect, btn) {
    if (isCorrect) {
        btn.className = "bg-emerald-100 border-2 border-emerald-500 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm font-bold text-emerald-900";
        showFeedbackWithNext("Correct! Long-term upward trend confirmed across decades.", true, 6);
    } else {
        btn.className = "bg-red-100 border-2 border-red-400 p-2.5 rounded text-left flex gap-2 items-center w-full shadow-sm text-red-900 opacity-60";
        showFeedbackWithNext("Incorrect hypothesis prediction.", false, 5);
    }
}

function moveItemC1(btn, direction) {
    const item = btn.closest('[data-id]');
    const container = document.getElementById('causal-list-c1');
    if (!container) return;
    
    if (direction === -1 && item.previousElementSibling) {
        container.insertBefore(item, item.previousElementSibling);
    } else if (direction === 1 && item.nextElementSibling) {
        container.insertBefore(item.nextElementSibling, item);
    }
}

function verifyCausalChainC1() {
    const container = document.getElementById('causal-list-c1');
    if (!container) return;
    const items = container.querySelectorAll('[data-id]');
    
    let currentOrder = Array.from(items).map(i => i.getAttribute('data-id'));
    let targetOrder = ['1', '2', '3', '4', '5', '6', '7'];
    
    let isCorrect = currentOrder.every((val, index) => val === targetOrder[index]);

    if (isCorrect) {
        items.forEach(i => {
            i.className = "bg-emerald-50 border-2 border-emerald-500 p-2.5 rounded-lg flex items-center justify-between shadow-sm text-xs font-sans font-bold text-emerald-900";
        });
        showFeedbackWithNext("<strong>✅ Correct!</strong> Ice-Albedo feedback loop successfully reconstructed.", true, 8);
    } else {
        showFeedbackWithNext("<strong>❌ Incorrect Order.</strong> Review the feedback chain sequence and try rearranging!", false, 7);
    }
}

function moveItem(btn, direction) {
    const item = btn.closest('[data-id]');
    const container = document.getElementById('causal-list');
    
    if (direction === -1 && item.previousElementSibling) {
        container.insertBefore(item, item.previousElementSibling);
    } else if (direction === 1 && item.nextElementSibling) {
        container.insertBefore(item.nextElementSibling, item);
    }
}

function verifyCausalChain() {
    const container = document.getElementById('causal-list');
    const items = container.querySelectorAll('[data-id]');
    
    let currentOrder = Array.from(items).map(i => i.getAttribute('data-id'));
    let targetOrder = ['1', '2', '3', '4'];
    
    let isCorrect = currentOrder.every((val, index) => val === targetOrder[index]);

    if (isCorrect) {
        items.forEach(i => {
            i.className = "bg-emerald-50 border-2 border-emerald-500 p-2.5 rounded-lg flex items-center justify-between shadow-sm text-xs font-sans font-bold text-emerald-900";
        });
        showFeedbackWithNext("<strong>✅ Correct!</strong> Perfect reconstruction of the agricultural failure causal chain.", true, 6);
    } else {
        showFeedbackWithNext("<strong>❌ Incorrect Order.</strong> Review the scientific sequence: Normal conditions ➔ Heatwave peak ➔ Crop stress ➔ Yield drop. Try rearranging!", false, 5);
    }
}

const deskDrawer = document.getElementById('desk-drawer');
const drawerHandle = document.getElementById('drawer-handle');

if (deskDrawer && drawerHandle) {
    let isDraggingDrawer = false;
    let startY = 0;
    let startHeight = 0;

    const startDrag = (clientY) => {
        isDraggingDrawer = true;
        startY = clientY;
        startHeight = deskDrawer.offsetHeight;
        deskDrawer.style.transition = 'none';
    };

    const onDrag = (clientY) => {
        if (!isDraggingDrawer) return;
        const deltaY = startY - clientY;
        const newHeight = startHeight + deltaY;
        deskDrawer.style.height = `${newHeight}px`;
    };

    const stopDrag = () => {
        if (!isDraggingDrawer) return;
        isDraggingDrawer = false;
        deskDrawer.style.transition = 'all 0.15s ease-out';
    };

    drawerHandle.addEventListener('mousedown', (e) => startDrag(e.clientY));
    window.addEventListener('mousemove', (e) => onDrag(e.clientY));
    window.addEventListener('mouseup', stopDrag);

    drawerHandle.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientY), { passive: true });
    window.addEventListener('touchmove', (e) => {
        if (isDraggingDrawer) onDrag(e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchend', stopDrag);
}

function startInvestigation() {
    const nameInput = document.getElementById('detective-name-input');
    const landingScreen = document.getElementById('landing-screen');
    const badge = document.getElementById('active-detective-badge');
    
    if (nameInput && nameInput.value.trim() !== "") {
        detectiveName = nameInput.value.trim();
    }

    if (badge) {
        badge.innerText = detectiveName;
    }

    const boardText = document.getElementById('board-status-text');
    if (boardText) {
        boardText.innerText = `Case files ready for analysis. Select an archive below.`;
    }

    if (landingScreen) {
        landingScreen.style.opacity = '0';
        landingScreen.style.transform = 'scale(1.03)';
        setTimeout(() => {
            landingScreen.style.display = 'none';
        }, 700);
    }
}

document.getElementById('detective-name-input')?.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        startInvestigation();
    }
});

function openCreditsModal() {
    const modal = document.getElementById('creditsModal');
    if (modal) {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        modal.classList.add('opacity-100', 'pointer-events-auto');
    }
}

function closeCreditsModal() {
    const modal = document.getElementById('creditsModal');
    if (modal) {
        modal.classList.remove('opacity-100', 'pointer-events-auto');
        modal.classList.add('opacity-0', 'pointer-events-none');
    }
}

function switchBoardCase(caseNum) {
    const grid1 = document.getElementById('board-grid-case-1');
    const grid2 = document.getElementById('board-grid-case-2');
    const grid3 = document.getElementById('board-grid-case-3');
    const tab1 = document.getElementById('tab-case-1');
    const tab2 = document.getElementById('tab-case-2');
    const tab3 = document.getElementById('tab-case-3');

    if (!grid1 || !grid2 || !grid3 || !tab1 || !tab2 || !tab3) return;

    grid1.classList.add('hidden');
    grid2.classList.add('hidden');
    grid3.classList.add('hidden');

    tab1.className = "flex-1 py-1.5 px-3 rounded-lg font-bold bg-slate-950/80 border border-slate-700 text-slate-400 hover:text-cyan-300 cursor-pointer transition text-center whitespace-nowrap";
    tab2.className = "flex-1 py-1.5 px-3 rounded-lg font-bold bg-slate-950/80 border border-slate-700 text-slate-400 hover:text-cyan-300 cursor-pointer transition text-center whitespace-nowrap";
    tab3.className = "flex-1 py-1.5 px-3 rounded-lg font-bold bg-slate-950/80 border border-slate-700 text-slate-400 hover:text-cyan-300 cursor-pointer transition text-center whitespace-nowrap";

    if (caseNum === 1) {
        grid1.classList.remove('hidden');
        tab1.className = "flex-1 py-1.5 px-3 rounded-lg font-bold bg-cyan-900/80 border border-cyan-400 text-cyan-200 cursor-pointer transition shadow text-center whitespace-nowrap";
    } else if (caseNum === 2) {
        grid2.classList.remove('hidden');
        tab2.className = "flex-1 py-1.5 px-3 rounded-lg font-bold bg-amber-900/80 border border-amber-400 text-amber-200 cursor-pointer transition shadow text-center whitespace-nowrap";
    } else if (caseNum === 3) {
        grid3.classList.remove('hidden');
        tab3.className = "flex-1 py-1.5 px-3 rounded-lg font-bold bg-emerald-900/80 border border-emerald-400 text-emerald-200 cursor-pointer transition shadow text-center whitespace-nowrap";
    }
}

function unlockEvidenceCard(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerText = "UNLOCKED";
        el.className = "text-emerald-400 font-bold text-[9px]";
    }
}

function updateDetectiveBoard(phase, caseNum) {
    switchBoardCase(caseNum);

    if (caseNum === 1) {
        for (let i = 2; i <= 7; i++) {
            const el = document.getElementById(`c1-ev-${i}`);
            if (el) {
                if (phase >= i) {
                    el.innerText = "UNLOCKED";
                    el.className = "text-emerald-400 font-bold text-[9px]";
                } else {
                    el.innerText = "LOCKED";
                    el.className = "text-slate-400 font-bold text-[9px]";
                }
            }
        }
    } else if (caseNum === 2) {
        for (let i = 2; i <= 5; i++) {
            const el = document.getElementById(`c2-ev-${i}`);
            if (el) {
                if (phase >= i) {
                    el.innerText = "UNLOCKED";
                    el.className = "text-emerald-400 font-bold text-[9px]";
                } else {
                    el.innerText = "LOCKED";
                    el.className = "text-slate-400 font-bold text-[9px]";
                }
            }
        }
    } else if (caseNum === 3) {
        for (let i = 2; i <= 5; i++) {
            const el = document.getElementById(`c3-ev-${i}`);
            if (el) {
                if (phase >= i) {
                    el.innerText = "UNLOCKED";
                    el.className = "text-emerald-400 font-bold text-[9px]";
                } else {
                    el.innerText = "LOCKED";
                    el.className = "text-slate-400 font-bold text-[9px]";
                }
            }
        }
    }
}

function initBoardDragging() {
    const boardContainer = document.getElementById('detective-board-wrapper');
    if (!boardContainer) return;

    let isDraggingBoard = false;
    let startX, startY, scrollLeft, scrollTop;

    boardContainer.addEventListener('mousedown', (e) => {
        isDraggingBoard = true;
        boardContainer.classList.add('cursor-grabbing');
        startX = e.pageX - boardContainer.offsetLeft;
        startY = e.pageY - boardContainer.offsetTop;
        scrollLeft = boardContainer.scrollLeft;
        scrollTop = boardContainer.scrollTop;
    });

    boardContainer.addEventListener('mouseleave', () => {
        isDraggingBoard = false;
        boardContainer.classList.remove('cursor-grabbing');
    });

    boardContainer.addEventListener('mouseup', () => {
        isDraggingBoard = false;
        boardContainer.classList.remove('cursor-grabbing');
    });

    boardContainer.addEventListener('mousemove', (e) => {
        if (!isDraggingBoard) return;
        e.preventDefault();
        const x = e.pageX - boardContainer.offsetLeft;
        const y = e.pageY - boardContainer.offsetTop;
        const walkX = (x - startX) * 1.5;
        const walkY = (y - startY) * 1.5;
        boardContainer.scrollLeft = scrollLeft - walkX;
        boardContainer.scrollTop = scrollTop - walkY;
    });
}

document.addEventListener("DOMContentLoaded", function() {
    initBoardDragging();
});
function closeIntroModal() {
    const introModal = document.getElementById('introModal');
    if (introModal) {
        introModal.classList.remove('opacity-100', 'pointer-events-auto');
        introModal.classList.add('opacity-0', 'pointer-events-none');
    }
}
function switchCase3Map(mapYear) {
    const activeImg = document.getElementById('active-exhibit-img');
    const mapLabel = document.getElementById('current-map-label');
    const btn1 = document.getElementById('btn-map-1');
    const btn2 = document.getElementById('btn-map-2');
    
    if (activeImg) {
        activeImg.src = `assets/${mapYear}.png`;
    }
    if (mapLabel) {
        mapLabel.innerText = mapYear;
    }
    
    if (btn1 && btn2) {
        if (mapYear === '1880-1884') {
            btn1.className = "bg-cyan-900 text-cyan-200 border border-cyan-400 px-3 py-1 rounded text-xs font-mono font-bold cursor-pointer transition";
            btn2.className = "bg-stone-800 text-stone-300 border border-stone-700 px-3 py-1 rounded text-xs font-mono font-bold cursor-pointer transition";
        } else {
            btn2.className = "bg-cyan-900 text-cyan-200 border border-cyan-400 px-3 py-1 rounded text-xs font-mono font-bold cursor-pointer transition";
            btn1.className = "bg-stone-800 text-stone-300 border border-stone-700 px-3 py-1 rounded text-xs font-mono font-bold cursor-pointer transition";
        }
    }
    resetZoom();
}