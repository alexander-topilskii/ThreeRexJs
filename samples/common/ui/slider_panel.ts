// --- types ---
type Slider = HTMLInputElement;

export type Vec3Num = { x: number; y: number; z: number };

export interface TransformPanelOptions {
    container?: HTMLElement | null; // куда монтировать (по умолчанию body)
    id?: string;                    // id корневого div
    floating?: boolean;             // сделать панель "плавающей" поверх canvas
    anchor?: Partial<{ top: string; right: string; bottom: string; left: string }>; // позиционирование
    zIndex?: number | string;

    // Диапазоны и шаги для слайдеров
    positionRange?: { min: number; max: number; step: number };
    rotationRangeDeg?: { min: number; max: number; step: number };

    // Начальные значения
    initialPosition?: Vec3Num;
    initialRotationDeg?: Vec3Num;
}

type ChangePayload = {
    type: "position" | "rotation";
    value: Vec3Num;                 // численные значения (deg для rotation)
};

export class TransformPanel {
    readonly el: HTMLDivElement;
    readonly pos: { x: Slider; y: Slider; z: Slider };
    readonly rot: { x: Slider; y: Slider; z: Slider };

    private outputs = {
        pos: {x: null as HTMLSpanElement | null, y: null as HTMLSpanElement | null, z: null as HTMLSpanElement | null},
        rot: {x: null as HTMLSpanElement | null, y: null as HTMLSpanElement | null, z: null as HTMLSpanElement | null},
    };

    private onChangeSubscribers: Array<(p: ChangePayload) => void> = [];

    constructor(opts: TransformPanelOptions = {}) {
        const {
            container = document.body,
            id = "transformPanel",
            floating = true,
            anchor = {top: "10px", right: "10px"},
            zIndex = 2147483647,
            positionRange = {min: -30, max: 30, step: 0.01},
            rotationRangeDeg = {min: -180, max: 180, step: 0.1},
            initialPosition = {x: 0, y: 0, z: 0},
            initialRotationDeg = {x: 0, y: 0, z: 0},
        } = opts;

        // root
        const panel = document.createElement("div");
        panel.id = id;

        // layout / style
        panel.style.minWidth = "260px";
        panel.style.minHeight = "260px";
        panel.style.padding = "10px";
        panel.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, monospace";
        panel.style.fontSize = "12px";
        panel.style.color = "#fff";
        panel.style.background = "rgba(0,0,0,0.6)";
        panel.style.border = "1px solid rgba(255,255,255,0.15)";
        panel.style.borderRadius = "8px";
        panel.style.backdropFilter = "blur(6px)";
        panel.style.userSelect = "none";
        panel.style.boxSizing = "border-box";

        if (floating) {
            panel.style.position = "fixed";
            if (anchor.top) panel.style.top = anchor.top;
            if (anchor.right) panel.style.right = anchor.right;
            if (anchor.bottom) panel.style.bottom = anchor.bottom;
            if (anchor.left) panel.style.left = anchor.left;
            panel.style.zIndex = String(zIndex);
            panel.style.pointerEvents = "auto";
        } else {
            panel.style.position = "relative";
        }

        panel.innerHTML = `
      <div style="font-weight:600; margin-bottom:6px;">Controls</div>
      <label style="display:flex;align-items:center;gap:8px;margin:6px 0;">
        <input id="auto" type="checkbox" checked />
        <span>Auto-rotate</span>
      </label>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1); margin:8px 0;">
      <div style="font-weight:600; margin:6px 0 2px;">Position</div>
      <div id="posRows"></div>
      <div style="font-weight:600; margin:10px 0 2px;">Rotation (deg)</div>
      <div id="rotRows"></div>
    `;

        const posRows = panel.querySelector("#posRows") as HTMLElement;
        const rotRows = panel.querySelector("#rotRows") as HTMLElement;

        const row = (label: string, id: string, min: number, max: number, step: number): HTMLDivElement => {
            const wrap = document.createElement("div");
            wrap.style.display = "grid";
            wrap.style.gridTemplateColumns = "28px 1fr 48px";
            wrap.style.alignItems = "center";
            wrap.style.gap = "8px";
            wrap.style.margin = "4px 0";

            const l = document.createElement("span");
            l.textContent = label;

            const s = document.createElement("input");
            s.type = "range";
            s.id = id;
            s.min = String(min);
            s.max = String(max);
            s.step = String(step);

            const out = document.createElement("span");
            out.id = id + "Out";
            out.style.textAlign = "right";

            wrap.append(l, s, out);
            return wrap;
        };

        // build rows
        posRows.append(
            row("x", "posX", positionRange.min, positionRange.max, positionRange.step),
            row("y", "posY", positionRange.min, positionRange.max, positionRange.step),
            row("z", "posZ", positionRange.min, positionRange.max, positionRange.step),
        );
        rotRows.append(
            row("x", "rotX", rotationRangeDeg.min, rotationRangeDeg.max, rotationRangeDeg.step),
            row("y", "rotY", rotationRangeDeg.min, rotationRangeDeg.max, rotationRangeDeg.step),
            row("z", "rotZ", rotationRangeDeg.min, rotationRangeDeg.max, rotationRangeDeg.step),
        );

        // query sliders
        const posX = panel.querySelector("#posX") as Slider;
        const posY = panel.querySelector("#posY") as Slider;
        const posZ = panel.querySelector("#posZ") as Slider;
        const rotX = panel.querySelector("#rotX") as Slider;
        const rotY = panel.querySelector("#rotY") as Slider;
        const rotZ = panel.querySelector("#rotZ") as Slider;

        this.outputs.pos.x = panel.querySelector("#posXOut");
        this.outputs.pos.y = panel.querySelector("#posYOut");
        this.outputs.pos.z = panel.querySelector("#posZOut");
        this.outputs.rot.x = panel.querySelector("#rotXOut");
        this.outputs.rot.y = panel.querySelector("#rotYOut");
        this.outputs.rot.z = panel.querySelector("#rotZOut");

        // set initial values
        posX.value = String(initialPosition.x);
        posY.value = String(initialPosition.y);
        posZ.value = String(initialPosition.z);
        rotX.value = String(initialRotationDeg.x);
        rotY.value = String(initialRotationDeg.y);
        rotZ.value = String(initialRotationDeg.z);

        // reflect to outputs
        const syncOutputs = () => {
            if (this.outputs.pos.x) this.outputs.pos.x.textContent = posX.value;
            if (this.outputs.pos.y) this.outputs.pos.y.textContent = posY.value;
            if (this.outputs.pos.z) this.outputs.pos.z.textContent = posZ.value;
            if (this.outputs.rot.x) this.outputs.rot.x.textContent = rotX.value;
            if (this.outputs.rot.y) this.outputs.rot.y.textContent = rotY.value;
            if (this.outputs.rot.z) this.outputs.rot.z.textContent = rotZ.value;
        };
        syncOutputs();

        // listeners
        const emit = (type: ChangePayload["type"]) => {
            const payload: ChangePayload =
                type === "position"
                    ? {type, value: {x: +posX.value, y: +posY.value, z: +posZ.value}}
                    : {type, value: {x: +rotX.value, y: +rotY.value, z: +rotZ.value}};
            this.onChangeSubscribers.forEach(fn => fn(payload));
        };

        [posX, posY, posZ].forEach(s =>
            s.addEventListener("input", () => {
                syncOutputs();
                emit("position");
            }),
        );
        [rotX, rotY, rotZ].forEach(s =>
            s.addEventListener("input", () => {
                syncOutputs();
                emit("rotation");
            }),
        );

        // finalize
        (container ?? document.body).appendChild(panel);

        this.el = panel;
        this.pos = {x: posX, y: posY, z: posZ};
        this.rot = {x: rotX, y: rotY, z: rotZ};
    }

    // --- публичный API ---

    /** Программно установить позицию (обновит слайдеры и output’ы, вызовет onChange) */
    setPosition(v: Partial<Vec3Num>) {
        if (v.x !== undefined) this.pos.x.value = String(v.x);
        if (v.y !== undefined) this.pos.y.value = String(v.y);
        if (v.z !== undefined) this.pos.z.value = String(v.z);
        this.syncPosOutputs();
        this.emit("position");
    }

    /** Программно установить повороты в градусах (обновит слайдеры и output’ы, вызовет onChange) */
    setRotationDeg(v: Partial<Vec3Num>) {
        if (v.x !== undefined) this.rot.x.value = String(v.x);
        if (v.y !== undefined) this.rot.y.value = String(v.y);
        if (v.z !== undefined) this.rot.z.value = String(v.z);
        this.syncRotOutputs();
        this.emit("rotation");
    }

    /** Подписка на изменения (position/rotation). Возвращает функцию отписки. */
    onChange(cb: (p: ChangePayload) => void): () => void {
        this.onChangeSubscribers.push(cb);
        return () => {
            const i = this.onChangeSubscribers.indexOf(cb);
            if (i >= 0) this.onChangeSubscribers.splice(i, 1);
        };
    }

    /** Удалить панель из DOM */
    destroy() {
        this.el.remove();
        this.onChangeSubscribers = [];
    }

    // --- helpers ---
    private syncPosOutputs() {
        if (this.outputs.pos.x) this.outputs.pos.x.textContent = this.pos.x.value;
        if (this.outputs.pos.y) this.outputs.pos.y.textContent = this.pos.y.value;
        if (this.outputs.pos.z) this.outputs.pos.z.textContent = this.pos.z.value;
    }

    private syncRotOutputs() {
        if (this.outputs.rot.x) this.outputs.rot.x.textContent = this.rot.x.value;
        if (this.outputs.rot.y) this.outputs.rot.y.textContent = this.rot.y.value;
        if (this.outputs.rot.z) this.outputs.rot.z.textContent = this.rot.z.value;
    }

    private emit(type: ChangePayload["type"]) {
        const payload: ChangePayload =
            type === "position"
                ? {type, value: {x: +this.pos.x.value, y: +this.pos.y.value, z: +this.pos.z.value}}
                : {type, value: {x: +this.rot.x.value, y: +this.rot.y.value, z: +this.rot.z.value}};
        this.onChangeSubscribers.forEach(fn => fn(payload));
    }
}