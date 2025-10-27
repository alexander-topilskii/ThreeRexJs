// Common UI helpers reusable across samples

// Angle conversions
export function radToDeg(r: number): number { return r * 180 / Math.PI; }
export function degToRad(d: number): number { return d * Math.PI / 180; }

export type Slider = HTMLInputElement;

// Panel with sliders to control position and rotation
// Returns the created panel element. It appends itself to document.body like the in-sample version.
export function createTransformPanel(): HTMLDivElement {
    const panel = document.createElement('div');
    panel.style.position = 'absolute';
    panel.style.top = '10px';
    panel.style.right = '10px';
    panel.style.minWidth = '260px';
    panel.style.padding = '10px';
    panel.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, monospace';
    panel.style.fontSize = '12px';
    panel.style.color = '#fff';
    panel.style.background = 'rgba(0,0,0,0.6)';
    panel.style.border = '1px solid rgba(255,255,255,0.15)';
    panel.style.borderRadius = '8px';
    panel.style.backdropFilter = 'blur(6px)';
    panel.style.userSelect = 'none';

    panel.innerHTML = `
    <div style="font-weight:600; margin-bottom:6px;">Controls</div>
    <label style="display:flex;align-items:center;gap:8px;margin:6px 0;">
      <input id="autoRotate" type="checkbox" checked />
      <span>Auto-rotate</span>
    </label>
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1); margin:8px 0;">
    <div style="font-weight:600; margin:6px 0 2px;">Position</div>
    <div id="posRows"></div>
    <div style="font-weight:600; margin:10px 0 2px;">Rotation (deg)</div>
    <div id="rotRows"></div>
  `;

    function row(label: string, id: string, min: number, max: number, step: number): HTMLDivElement {
        const wrap = document.createElement('div');
        wrap.style.display = 'grid';
        wrap.style.gridTemplateColumns = '28px 1fr 48px';
        wrap.style.alignItems = 'center';
        wrap.style.gap = '8px';
        wrap.style.margin = '4px 0';

        const l = document.createElement('span');
        l.textContent = label;

        const s = document.createElement('input');
        s.type = 'range';
        s.id = id;
        s.min = String(min);
        s.max = String(max);
        s.step = String(step);

        const out = document.createElement('span');
        out.id = id + 'Out';
        out.style.textAlign = 'right';

        wrap.appendChild(l);
        wrap.appendChild(s);
        wrap.appendChild(out);
        return wrap;
    }

    (panel.querySelector('#posRows') as HTMLElement).append(
        row('x', 'posX', -5, 5, 0.01),
        row('y', 'posY', -5, 5, 0.01),
        row('z', 'posZ', -5, 5, 0.01),
    );

    (panel.querySelector('#rotRows') as HTMLElement).append(
        row('x', 'rotX', -180, 180, 0.1),
        row('y', 'rotY', -180, 180, 0.1),
        row('z', 'rotZ', -180, 180, 0.1),
    );

    document.body.appendChild(panel);
    return panel;
}
