import type { Player } from '../Player';

export interface ControlPanelOptions {
    onCommand?: (command: string) => void;
}

export class ControlPanel {
    element: HTMLDivElement;
    private inputField: HTMLInputElement;
    private outputText: HTMLDivElement;
    private player: Player;
    private onCommand?: (command: string) => void;

    constructor(player: Player, options: ControlPanelOptions = {}) {
        this.player = player;
        this.onCommand = options.onCommand;

        // Создаем панель
        this.element = this.createPanel();
        this.inputField = this.createInputField();
        this.outputText = this.createOutputText();

        const inputContainer = this.createInputContainer();
        const buttonsContainer = this.createButtonsContainer();

        this.element.appendChild(inputContainer);
        this.element.appendChild(buttonsContainer);
        this.element.appendChild(this.outputText);
    }

    private createPanel(): HTMLDivElement {
        const panel = document.createElement('div');
        panel.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.8);
            padding: 20px;
            display: flex;
            gap: 20px;
            align-items: center;
            color: white;
            font-family: monospace;
            z-index: 1000;
            resize: vertical;
            overflow: auto;
            min-height: 100px;
            max-height: 50vh;
        `;
        return panel;
    }

    private createInputField(): HTMLInputElement {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Введите команду...';
        input.style.cssText = `
            padding: 10px;
            font-size: 14px;
            font-family: monospace;
            flex: 1;
            border: none;
            border-radius: 4px;
        `;
        return input;
    }

    private createInputContainer(): HTMLDivElement {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            gap: 5px;
            flex: 1;
        `;

        const btnSend = document.createElement('button');
        btnSend.textContent = '📤';
        btnSend.style.cssText = `
            width: 40px;
            height: 40px;
            font-size: 18px;
            cursor: pointer;
            background: #4488ff;
            color: white;
            border: none;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        btnSend.addEventListener('click', () => this.handleCommand());
        this.inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleCommand();
            }
        });

        container.appendChild(this.inputField);
        container.appendChild(btnSend);

        return container;
    }

    private handleCommand(): void {
        const command = this.inputField.value.trim();
        if (command) {
            this.setOutput(`Команда: ${command}`);
            this.onCommand?.(command);
            this.inputField.value = '';
        }
    }

    private createButtonsContainer(): HTMLDivElement {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        `;

        const buttons = [
            { text: '← Влево', action: () => this.player.moveLeft(0.1) },
            { text: 'Вправо →', action: () => this.player.moveRight(0.1) },
            { text: '↑ Вперед', action: () => this.player.moveForward(0.1) },
            { text: '↓ Назад', action: () => this.player.moveBackward(0.1) },
            { text: 'Прыгнуть', action: () => this.player.jump() },
            { text: 'Взять', action: () => this.player.togglePickup() }
        ];

        buttons.forEach(({ text, action }) => {
            const btn = this.createButton(text, action);
            container.appendChild(btn);
        });

        return container;
    }

    private createButton(text: string, onClick: () => void): HTMLButtonElement {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.cssText = `
            padding: 10px 15px;
            font-size: 14px;
            font-family: monospace;
            cursor: pointer;
            background: #4488ff;
            color: white;
            border: none;
            border-radius: 4px;
        `;
        btn.addEventListener('mousedown', onClick);
        return btn;
    }

    private createOutputText(): HTMLDivElement {
        const output = document.createElement('div');
        output.style.cssText = `
            flex: 1;
            padding: 10px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            font-size: 14px;
            min-height: 40px;
            overflow-y: auto;
        `;
        output.textContent = 'Готов к командам...';
        return output;
    }

    setOutput(text: string): void {
        this.outputText.textContent = text;
    }

    mount(parent: HTMLElement = document.body): void {
        parent.appendChild(this.element);
    }

    dispose(): void {
        this.element.remove();
    }
}
