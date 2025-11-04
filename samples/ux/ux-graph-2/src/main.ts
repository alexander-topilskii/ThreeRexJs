// Plain Canvas 2D plot: k^N, N!, 2^{N^2}
// X = N. Y = transform(f(N)) where transform in {log10, ln, linear(normalized)}.
// No libraries.

const plot = document.getElementById('plot') as HTMLCanvasElement;
const ctx = plot.getContext('2d')!;
const legend = document.getElementById('legend') as HTMLDivElement;

const kInput = document.getElementById('kInput') as HTMLInputElement;
const nMaxInput = document.getElementById('nMaxInput') as HTMLInputElement;
const yScaleSelect = document.getElementById('yScaleSelect') as HTMLSelectElement;
const regenBtn = document.getElementById('regen') as HTMLButtonElement;

type Series = 'kPowN' | 'factorial' | 'twoPowN2';

type Settings = {
    k: number;
    nMax: number;
    yScale: 'log10' | 'ln' | 'linear';
};

const colors: Record<Series, string> = {
    kPowN: '#7aa2f7',
    factorial: '#9ece6a',
    twoPowN2: '#f7768e'
};

function log10Factorial(n: number): number {
    let s = 0;
    for (let i = 2; i <= n; i++) s += Math.log10(i);
    return s;
}

function computeRaw(k: number, nMax: number) {
    const out = {
        kPowN: [] as number[],
        factorial: [] as number[],
        twoPowN2: [] as number[]
    };
    for (let n = 1; n <= nMax; n++) {
        out.kPowN.push(n * Math.log10(k));       // we store log10 directly to avoid overflow
        out.factorial.push(log10Factorial(n));   // log10(N!)
        out.twoPowN2.push(n * n * Math.log10(2));// log10(2^{N^2})
    }
    return out;
}

function transformY(vals: number[], yScale: Settings['yScale'], k: number): number[] {
    // We have log10 values for stability. Convert depending on requested scale.
    if (yScale === 'log10') return vals.slice();
    if (yScale === 'ln') return vals.map(v => v * Math.log(10));
    // linear normalized: scale by 10^v, but normalize to [0,1] by max
    const lin = vals.map(v => Math.pow(10, v));
    const max = Math.max(...lin);
    return lin.map(v => v / max);
}

function drawAxes(x0: number, y0: number, x1: number, y1: number, nMax: number, yTicks: number[], yTickFmt: (v:number)=>string) {
    ctx.strokeStyle = '#2a313b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // X axis
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y0);
    // Y axis
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0, y1);
    ctx.stroke();

    // X ticks
    ctx.fillStyle = '#9aa7b1';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let n = 0; n <= nMax; n += Math.max(1, Math.floor(nMax/10))) {
        const x = x0 + (x1 - x0) * (n / nMax);
        ctx.beginPath();
        ctx.moveTo(x, y0);
        ctx.lineTo(x, y0 + 4);
        ctx.stroke();
        ctx.fillText(String(n), x, y0 + 6);
    }

    // Y ticks
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    yTicks.forEach(v => {
        const y = yScaleMap(v);
        ctx.beginPath();
        ctx.moveTo(x0 - 4, y);
        ctx.lineTo(x0, y);
        ctx.stroke();
        ctx.fillText(yTickFmt(v), x0 - 6, y);
    });
}

// Globals for mapping
let yMin = 0, yMax = 1, xLeft = 60, xRight = plot.width - 20, yBottom = plot.height - 40, yTop = 20;
function yScaleMap(v: number) {
    // map [yMin, yMax] to [yBottom, yTop] inverted
    if (yMax === yMin) return yBottom;
    const t = (v - yMin) / (yMax - yMin);
    return yBottom - t * (yBottom - yTop);
}

function niceTicks(min: number, max: number, steps = 6): number[] {
    if (min === max) return [min];
    const span = max - min;
    const step = Math.pow(10, Math.floor(Math.log10(span/steps)));
    const err = (span/steps)/step;
    const mult = err >= 7.5 ? 10 : err >= 3 ? 5 : err >= 1.5 ? 2 : 1;
    const tick = mult * step;
    const t0 = Math.ceil(min / tick) * tick;
    const ticks: number[] = [];
    for (let v = t0; v <= max + 1e-12; v += tick) ticks.push(+v.toFixed(12));
    return ticks;
}

function buildLegend() {
    legend.innerHTML = '';
    const items: {color:string,label:string}[] = [
        {color: colors.kPowN, label: 'k^N'},
        {color: colors.factorial, label: 'N!'},
        {color: colors.twoPowN2, label: '2^{N^2}'}
    ];
    for (const it of items) {
        const div = document.createElement('div');
        div.className = 'badge';
        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.style.background = it.color;
        const span = document.createElement('span');
        span.textContent = it.label;
        div.appendChild(dot); div.appendChild(span);
        legend.appendChild(div);
    }
}

function draw(settings: Settings) {
    const k = settings.k, nMax = settings.nMax, yScale = settings.yScale;
    // Background
    ctx.fillStyle = '#0b0d10'; ctx.fillRect(0,0,plot.width, plot.height);

    // Compute series (already in log10)
    const raw = computeRaw(k, nMax);
    // Transform chosen Y
    const yK = transformY(raw.kPowN, yScale, k);
    const yF = transformY(raw.factorial, yScale, k);
    const yT = transformY(raw.twoPowN2, yScale, k);

    // Set mapping range
    if (yScale === 'linear') {
        yMin = 0; yMax = 1;
    } else {
        const all = [...yK, ...yF, ...yT];
        yMin = Math.min(...all);
        yMax = Math.max(...all);
    }

    // Grid
    ctx.strokeStyle = '#1f2835'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) {
        const y = yTop + i*(yBottom - yTop)/10;
        ctx.moveTo(xLeft, y); ctx.lineTo(xRight, y);
    }
    for (let i = 0; i <= 10; i++) {
        const x = xLeft + i*(xRight - xLeft)/10;
        ctx.moveTo(x, yTop); ctx.lineTo(x, yBottom);
    }
    ctx.stroke();

    // Axes and ticks
    const yTicks = yScale === 'linear' ? [0,0.25,0.5,0.75,1] : niceTicks(yMin, yMax, 6);
    const yFmt = (v:number)=> yScale==='linear' ? v.toFixed(2) : (Math.abs(v)>3? v.toFixed(1): v.toFixed(2));
    drawAxes(xLeft, yBottom, xRight, yTop, nMax, yTicks, yFmt);

    // Labels
    ctx.fillStyle = '#cfe1ff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('N', (xLeft+xRight)/2, yBottom+16);
    ctx.save();
    ctx.translate(16, (yTop+yBottom)/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText(yScale==='log10'?'log10(f(N))':yScale==='ln'?'ln(f(N))':'нормированное f(N)', 0, 0);
    ctx.restore();

    function drawLine(vals: number[], color: string) {
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i=0;i<vals.length;i++) {
            const n = i+1;
            const x = xLeft + (xRight - xLeft) * (n / nMax);
            const y = yScaleMap(vals[i]);
            if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
        // points
        ctx.fillStyle = color;
        for (let i=0;i<vals.length;i+=Math.max(1, Math.floor(vals.length/50))) {
            const n = i+1;
            const x = xLeft + (xRight - xLeft) * (n / nMax);
            const y = yScaleMap(vals[i]);
            ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
        }
    }

    drawLine(yK, colors.kPowN);
    drawLine(yF, colors.factorial);
    drawLine(yT, colors.twoPowN2);

    buildLegend();
}

function readSettings(): Settings {
    const k = Math.max(2, Math.min(16, parseInt(kInput.value) || 2));
    const nMax = Math.max(5, Math.min(500, parseInt(nMaxInput.value) || 50));
    const yScale = (yScaleSelect.value as Settings['yScale']);
    return { k, nMax, yScale };
}

function init() {
    const s = readSettings();
    draw(s);
}

regenBtn.addEventListener('click', () => draw(readSettings()));
window.addEventListener('resize', () => draw(readSettings()));

init();
