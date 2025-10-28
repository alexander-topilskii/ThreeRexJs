export type Slider = HTMLInputElement;

// Add methods to HTMLDivElement via declaration merging so panel can expose helpers
declare global {
    interface HTMLDivElement {
        updatePositions: ( targets: { x: { value: string | number }; y: { value: string | number }; z: { value: string | number } }) => void;
        updateRotation: (targets: { x: { value: string | number }; y: { value: string | number }; z: { value: string | number } }) => void;
        positions: { x: Slider; y: Slider; z: Slider };
        rotations: { x: Slider; y: Slider; z: Slider };
    }
}

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


    // Expose grouped slider references for convenient API
    // Note: query inputs only AFTER rows are appended to the panel
    let posX!: Slider;
    let posY!: Slider;
    let posZ!: Slider;
    let rotX!: Slider;
    let rotY!: Slider;
    let rotZ!: Slider;


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

    // Now that the rows are appended, query the inputs
    posX = panel.querySelector('#posX') as Slider;
    posY = panel.querySelector('#posY') as Slider;
    posZ = panel.querySelector('#posZ') as Slider;
    rotX = panel.querySelector('#rotX') as Slider;
    rotY = panel.querySelector('#rotY') as Slider;
    rotZ = panel.querySelector('#rotZ') as Slider;

    panel.positions = { x: posX, y: posY, z: posZ };
    panel.rotations = { x: rotX, y: rotY, z: rotZ };

    // Attach update helpers to panel instance
    panel.updatePositions = ( targets: { x: { value: string | number }; y: { value: string | number }; z: { value: string | number } }) => {
        const ox = panel.querySelector('#posXOut') as HTMLElement | null;
        const oy = panel.querySelector('#posYOut') as HTMLElement | null;
        const oz = panel.querySelector('#posZOut') as HTMLElement | null;
        if (ox) ox.textContent = targets.x.value as string;
        if (oy) oy.textContent = targets.y.value as string;
        if (oz) oz.textContent = targets.z.value as string;
    };

    panel.updateRotation = (targets: { x: { value: string | number }; y: { value: string | number }; z: { value: string | number } }) => {
        const ox = panel.querySelector('#rotXOut') as HTMLElement | null;
        const oy = panel.querySelector('#rotYOut') as HTMLElement | null;
        const oz = panel.querySelector('#rotZOut') as HTMLElement | null;
        if (ox) ox.textContent = targets.x.value as string;
        if (oy) oy.textContent = targets.y.value as string;
        if (oz) oz.textContent = targets.z.value as string;
    };

    document.body.appendChild(panel);
    return panel;
}
