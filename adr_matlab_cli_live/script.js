const w = Math.PI / 8;
const fileOrder = ['calculations.m','cli.m','plot_environment.m','plot_object.m','plot_object_t.m','pow10str.m'];
const originalFiles = {};
const editedFiles = {};
let solved;

function equationResidual(C, k) {
  const f1 = C - 5 - w / (k * k + w * w);
  const f2 = C * Math.exp(-4 * k) + (k * k) / (k * k + w * w) - 3;
  return { f1, f2, norm: Math.sqrt(f1 * f1 + f2 * f2) };
}

function pow10str(x) {
  if (x === 0) return '0 × 10^0';
  const e = Math.floor(Math.log10(Math.abs(x)));
  const m = x / Math.pow(10, e);
  return `${m.toFixed(6)} × 10^${e}`;
}

function solveValues() {
  let best = { C: 0, k: 0, residual: Infinity };
  for (let Ci = 0; Ci <= 1000; Ci++) {
    const C = Ci / 10;
    for (let ki = 0; ki <= 1000; ki++) {
      const k = ki / 10;
      const { f1, f2 } = equationResidual(C, k);
      const sum = f1 * f1 + f2 * f2;
      if (sum < best.residual) best = { C, k, residual: Math.sqrt(sum) };
    }
  }

  let C = best.C;
  let k = best.k;
  for (let i = 0; i < 30; i++) {
    const { f1, f2 } = equationResidual(C, k);
    const j11 = 1;
    const j12 = (2 * w * k) / Math.pow(k * k + w * w, 2);
    const j21 = Math.exp(-4 * k);
    const j22 = -4 * C * Math.exp(-4 * k) + (2 * k * w * w) / Math.pow(k * k + w * w, 2);
    const det = j11 * j22 - j12 * j21;
    if (Math.abs(det) < 1e-14) break;
    const deltaC = (-f1 * j22 + j12 * f2) / det;
    const deltaK = (j21 * f1 - j11 * f2) / det;
    C += deltaC;
    k += deltaK;
    if (Math.abs(deltaC) + Math.abs(deltaK) < 1e-12) break;
  }
  const final = equationResidual(C, k);
  return {
    C_grid: best.C,
    k_grid: best.k,
    residual_grid: best.residual,
    C_result: C,
    k_result: k,
    residual_fsolve: final.norm,
    f1: final.f1,
    f2: final.f2
  };
}

function yEnvironment(t) { return 20 + Math.sin(w * t); }
function xObject(t) {
  const C = solved.C_result;
  const k = solved.k_result;
  return 20 + C * Math.exp(-k * t) + (k / (k * k + w * w)) * (k * Math.sin(w * t) - w * Math.cos(w * t));
}
function range(start, end, count = 1000) {
  const arr = [];
  const step = (end - start) / (count - 1);
  for (let i = 0; i < count; i++) arr.push(start + step * i);
  return arr;
}
function baseLayout(title, xRange = null) {
  return {
    title: { text: title, font: { size: 24, color: '#f5f7fb' } },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Inter, sans-serif', color: '#dbe7ff' },
    margin: { l: 60, r: 24, t: 68, b: 60 },
    xaxis: { title: 'Čas t [hod]', gridcolor: 'rgba(255,255,255,0.08)', ...(xRange ? { range: xRange } : {}) },
    yaxis: { title: 'Teplota [°C]', gridcolor: 'rgba(255,255,255,0.08)' },
    legend: { orientation: 'h', y: -0.2 }, dragmode: 'pan'
  };
}
function plotConfig() { return { responsive: true, displaylogo: false, scrollZoom: true }; }

function plotEnvironment() {
  const t = range(0, 24); const y = t.map(yEnvironment);
  Plotly.newPlot('envChart', [{ x: t, y, type: 'scatter', mode: 'lines', name: 'y(t)', line: { width: 3 } }], baseLayout('Teplota prostredia y(t)'), plotConfig());
}
function plotObject() {
  const t = range(0, 24); const x = t.map(xObject);
  Plotly.newPlot('objChart', [{ x: t, y: x, type: 'scatter', mode: 'lines', name: 'x(t)', line: { width: 3 } }], baseLayout('Teplota objektu x(t)'), plotConfig());
}
function buildIntervalTable(start, end) {
  const tbody = document.getElementById('intervalTable'); tbody.innerHTML = '';
  for (let t = start; t <= end; t++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${t}</td><td>${xObject(t).toFixed(6)}</td>`; tbody.appendChild(tr);
  }
}
function plotInterval() {
  const start = Number(document.getElementById('tStart').value);
  const end = Number(document.getElementById('tEnd').value);
  const notice = document.getElementById('intervalNotice');
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < 0 || start >= end) {
    notice.textContent = 'Hodnoty t_start a t_end musia byť celé nezáporné čísla a t_start musí byť menší ako t_end.';
    notice.classList.add('error');
    return false;
  }
  notice.textContent = `Interval: ${start} až ${end} hod.`; notice.classList.remove('error');
  const t = range(start, end); const x = t.map(xObject);
  Plotly.newPlot('intervalChart', [{ x: t, y: x, type: 'scatter', mode: 'lines', name: 'x(t)', line: { width: 3 } }], baseLayout(`Teplota objektu x(t), t ∈ [${start}, ${end}]`, [start, end]), plotConfig());
  buildIntervalTable(start, end);
  return true;
}

function fillResults() {
  document.getElementById('gridC').textContent = solved.C_grid.toFixed(1);
  document.getElementById('gridK').textContent = solved.k_grid.toFixed(1);
  document.getElementById('gridResidual').textContent = pow10str(solved.residual_grid);
  document.getElementById('finalC').textContent = solved.C_result.toFixed(6);
  document.getElementById('finalK').textContent = solved.k_result.toFixed(6);
  document.getElementById('finalResidual').textContent = pow10str(solved.residual_fsolve);
  document.getElementById('heroC').textContent = solved.C_result.toFixed(6);
  document.getElementById('heroK').textContent = solved.k_result.toFixed(6);
  document.getElementById('heroGrid').textContent = `${solved.C_grid.toFixed(1)} / ${solved.k_grid.toFixed(1)}`;
  document.getElementById('heroResidual').textContent = pow10str(solved.residual_fsolve);
  const pointsBody = document.getElementById('pointsTable'); pointsBody.innerHTML = '';
  [0, 4, 8, 16].forEach((t) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${t}</td><td>${yEnvironment(t).toFixed(6)}</td><td>${t <= 4 ? xObject(t).toFixed(6) : '—'}</td>`;
    pointsBody.appendChild(tr);
  });
  document.getElementById('equationsTable').innerHTML = `
    <tr><td>f₁(C,k)</td><td>${solved.f1.toExponential(6)}</td></tr>
    <tr><td>f₂(C,k)</td><td>${solved.f2.toExponential(6)}</td></tr>
    <tr><td>C - 5 - (π/8)/(k² + (π/8)²)</td><td>${solved.f1.toExponential(6)}</td></tr>
    <tr><td>C·e^(-4k) + k²/(k² + (π/8)²) - 3</td><td>${solved.f2.toExponential(6)}</td></tr>`;
}

function activatePanel(name) {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.panel === name));
  document.querySelectorAll('.panel').forEach(panel => panel.classList.toggle('active', panel.id === `panel-${name}`));
}

function consolePrint(text) { document.getElementById('consoleOutput').textContent = text; }
function currentFile() { return document.getElementById('editorFilePicker').value; }

function refreshEditorPicker() {
  const picker = document.getElementById('editorFilePicker');
  picker.innerHTML = fileOrder.map(name => `<option value="${name}">${name}</option>`).join('');
}
function updateCliControls() {
  const mode = document.getElementById('cliMode').value;
  const showInterval = mode === '4';
  document.getElementById('cliStartWrap').style.display = showInterval ? 'flex' : 'none';
  document.getElementById('cliEndWrap').style.display = showInterval ? 'flex' : 'none';
}

function toggleEditorTools(name) {
  const showFileInterval = name === 'plot_object_t.m';
  const showCliRunner = name === 'cli.m';
  document.getElementById('editorIntervalControls').style.display = showFileInterval ? 'flex' : 'none';
  document.getElementById('cliRunner').classList.toggle('visible', showCliRunner);
  if (showCliRunner) updateCliControls();
}

function loadEditorFile(name) {
  document.getElementById('codeEditor').value = editedFiles[name] ?? '';
  toggleEditorTools(name);
}
function saveEditorBuffer() {
  const name = currentFile();
  editedFiles[name] = document.getElementById('codeEditor').value;
}
function runCliMode() {
  const mode = document.getElementById('cliMode').value;
  const notice = document.getElementById('editorNotice');
  notice.classList.remove('error');

  if (mode === '1') {
    solved = solveValues();
    fillResults();
    activatePanel('calc');
    consolePrint([
      '=== cli.m / voľba 1 ===',
      `C_grid = ${solved.C_grid.toFixed(1)}`,
      `k_grid = ${solved.k_grid.toFixed(1)}`,
      `residual_grid = ${pow10str(solved.residual_grid)}`,
      `C_result = ${solved.C_result.toFixed(6)}`,
      `k_result = ${solved.k_result.toFixed(6)}`,
      `residual_fsolve = ${pow10str(solved.residual_fsolve)}`
    ].join('
'));
    notice.textContent = 'cli.m vykonal voľbu 1 — výpočet konštánt.';
    return;
  }

  if (mode === '2') {
    plotEnvironment();
    activatePanel('env');
    consolePrint('=== cli.m / voľba 2 ===
Graf prostredia bol vykreslený.');
    notice.textContent = 'cli.m vykonal voľbu 2 — graf prostredia.';
    return;
  }

  if (mode === '3') {
    plotObject();
    activatePanel('obj');
    consolePrint('=== cli.m / voľba 3 ===
Graf objektu bol vykreslený.');
    notice.textContent = 'cli.m vykonal voľbu 3 — graf objektu.';
    return;
  }

  if (mode === '4') {
    const start = Number(document.getElementById('cliTStart').value);
    const end = Number(document.getElementById('cliTEnd').value);
    document.getElementById('tStart').value = start;
    document.getElementById('tEnd').value = end;
    document.getElementById('editorTStart').value = start;
    document.getElementById('editorTEnd').value = end;
    const ok = plotInterval();
    if (!ok) {
      notice.textContent = document.getElementById('intervalNotice').textContent;
      notice.classList.add('error');
      activatePanel('ide');
      return;
    }
    activatePanel('interval');
    consolePrint(`=== cli.m / voľba 4 ===
Graf objektu bol vykreslený pre interval ${start} až ${end}.`);
    notice.textContent = `cli.m vykonal voľbu 4 — interval ${start} až ${end}.`;
  }
}

function updateFilesGrid() {
  const grid = document.getElementById('filesGrid');
  grid.innerHTML = fileOrder.map(name => `<button class="file-item file-open-btn" data-open="${name}">${name}</button>`).join('');
  grid.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', () => {
    saveEditorBuffer();
    document.getElementById('editorFilePicker').value = btn.dataset.open;
    loadEditorFile(btn.dataset.open);
    activatePanel('ide');
  }));
}

function runSelectedFromEditor() {
  saveEditorBuffer();
  const name = currentFile();
  const notice = document.getElementById('editorNotice');
  notice.classList.remove('error');

  if (name === 'calculations.m') {
    solved = solveValues();
    fillResults();
    activatePanel('calc');
    consolePrint([
      '=== calculations.m ===',
      `C_grid = ${solved.C_grid.toFixed(1)}`,
      `k_grid = ${solved.k_grid.toFixed(1)}`,
      `residual_grid = ${pow10str(solved.residual_grid)}`,
      `C_result = ${solved.C_result.toFixed(6)}`,
      `k_result = ${solved.k_result.toFixed(6)}`,
      `residual_fsolve = ${pow10str(solved.residual_fsolve)}`
    ].join('\n'));
    notice.textContent = 'calculations.m spracovaný.';
    return;
  }

  if (name === 'plot_environment.m') {
    plotEnvironment();
    activatePanel('env');
    consolePrint('=== plot_environment.m ===\nGraf prostredia bol vykreslený.');
    notice.textContent = 'plot_environment.m vykreslený.';
    return;
  }

  if (name === 'plot_object.m') {
    plotObject();
    activatePanel('obj');
    consolePrint('=== plot_object.m ===\nGraf objektu bol vykreslený.');
    notice.textContent = 'plot_object.m vykreslený.';
    return;
  }

  if (name === 'plot_object_t.m') {
    const start = Number(document.getElementById('editorTStart').value);
    const end = Number(document.getElementById('editorTEnd').value);
    document.getElementById('tStart').value = start;
    document.getElementById('tEnd').value = end;
    const ok = plotInterval();
    if (!ok) {
      notice.textContent = document.getElementById('intervalNotice').textContent;
      notice.classList.add('error');
      activatePanel('ide');
      return;
    }
    activatePanel('interval');
    consolePrint(`=== plot_object_t.m ===\nInterval ${start} až ${end} bol vykreslený.`);
    notice.textContent = `plot_object_t.m vykreslený pre interval ${start} až ${end}.`;
    return;
  }

  if (name === 'pow10str.m') {
    const samples = [solved.residual_grid, solved.residual_fsolve, 123456, 0.000023];
    consolePrint(['=== pow10str.m ===', ...samples.map(v => `${v} -> ${pow10str(v)}`)].join('\n'));
    notice.textContent = 'pow10str.m ukázal formátovanie.';
    activatePanel('ide');
    return;
  }

  if (name === 'cli.m') {
    consolePrint([
      '=== cli.m ===',
      '1 - Vypocet konstant C a k',
      '2 - Graf teploty prostredia',
      '3 - Graf teploty objektu',
      '4 - Graf teploty objektu (vlastny interval)',
      '',
      'Spustenie v tejto verzii:',
      '- otvor Editor',
      '- vyber subor',
      '- klikni Spustit'
    ].join('\n'));
    notice.textContent = 'cli.m otvorený v konzole.';
    activatePanel('ide');
  }
}

function downloadCurrentFile() {
  saveEditorBuffer();
  const name = currentFile();
  const blob = new Blob([editedFiles[name]], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}

async function loadFiles() {
  for (const name of fileOrder) {
    const text = await fetch(`matlab/${name}`).then(r => r.text());
    originalFiles[name] = text;
    editedFiles[name] = text;
  }
  refreshEditorPicker();
  loadEditorFile(fileOrder[0]);
  updateFilesGrid();
}

function bindEvents() {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => activatePanel(btn.dataset.panel)));
  document.querySelectorAll('[data-jump]').forEach(btn => btn.addEventListener('click', () => activatePanel(btn.dataset.jump)));
  document.getElementById('editorFilePicker').addEventListener('change', (e) => { saveEditorBuffer(); loadEditorFile(e.target.value); });
  document.getElementById('cliMode').addEventListener('change', updateCliControls);
  document.getElementById('btnRunCli').addEventListener('click', runCliMode);
  document.getElementById('codeEditor').addEventListener('input', saveEditorBuffer);
  document.getElementById('btnRunEditor').addEventListener('click', runSelectedFromEditor);
  document.getElementById('btnResetCode').addEventListener('click', () => {
    const name = currentFile();
    editedFiles[name] = originalFiles[name];
    loadEditorFile(name);
    document.getElementById('editorNotice').textContent = `${name} obnovený.`;
  });
  document.getElementById('btnDownloadCode').addEventListener('click', downloadCurrentFile);
  document.getElementById('btnRefreshCalc').addEventListener('click', () => { solved = solveValues(); fillResults(); });
  document.getElementById('btnEnv').addEventListener('click', plotEnvironment);
  document.getElementById('btnObj').addEventListener('click', plotObject);
  document.getElementById('btnInterval').addEventListener('click', plotInterval);
}

async function init() {
  solved = solveValues();
  fillResults();
  bindEvents();
  await loadFiles();
  plotEnvironment();
  plotObject();
  plotInterval();
  consolePrint('Vyber MATLAB súbor, uprav kód a klikni Spustiť.');
}

init();
