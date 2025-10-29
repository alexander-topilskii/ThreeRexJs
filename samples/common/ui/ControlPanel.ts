import type { Player } from '../Player';
import type { ChatGPTCommandService } from '../services/ChatGPTCommandService';
import { AI_MODELS } from '../services/ChatGPTCommandService';

export interface ControlPanelOptions {
    onCommand?: (command: string) => void;
    chatService?: ChatGPTCommandService;
    onRequestCommands?: () => Promise<void>;
}

export type Command =
    | { type: 'move_left' }
    | { type: 'move_right' }
    | { type: 'move_forward' }
    | { type: 'move_backward' }
    | { type: 'jump' }
    | { type: 'pickup' };

export class ControlPanel {
    element: HTMLDivElement;
    private inputField: HTMLInputElement;
    private apiKeyInput: HTMLInputElement;
    private modelSelect: HTMLSelectElement;
    private outputText: HTMLDivElement;
    private commandStackText: HTMLDivElement;
    private player: Player;
    private onCommand?: (command: string) => void;
    private onRequestCommands?: () => Promise<void>;
    private pickupButton: HTMLButtonElement | null = null;
    private commandStack: Command[] = [];
    private isExecuting: boolean = false;
    private chatService?: ChatGPTCommandService;

    constructor(player: Player, options: ControlPanelOptions = {}) {
        this.player = player;
        this.onCommand = options.onCommand;
        this.chatService = options.chatService;
        this.onRequestCommands = options.onRequestCommands;

        // Создаем панель
        this.element = this.createPanel();
        this.inputField = this.createInputField();
        this.apiKeyInput = this.createApiKeyInput();
        this.modelSelect = this.createModelSelect();
        this.outputText = this.createOutputText();
        this.commandStackText = this.createCommandStackText();

        const apiKeyContainer = this.createApiKeyContainer();
        const inputContainer = this.createInputContainer();
        const buttonsContainer = this.createButtonsContainer();

        this.element.appendChild(apiKeyContainer);
        this.element.appendChild(inputContainer);
        this.element.appendChild(buttonsContainer);
        this.element.appendChild(this.commandStackText);
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

        // Предотвращаем перехват управления игроком при вводе
        input.addEventListener('keydown', (e) => {
            e.stopPropagation();
        });
        input.addEventListener('keyup', (e) => {
            e.stopPropagation();
        });

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

    private async handleCommand(): Promise<void> {
        const command = this.inputField.value.trim();

        // Разрешаем отправку даже с пустым сообщением
        this.setOutput(`Запрос к ChatGPT${command ? `: "${command}"` : ''}...`);
        this.inputField.value = '';

        try {
            await this.onRequestCommands?.();
        } catch (error) {
            this.setOutput(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        }
    }

    private createApiKeyInput(): HTMLInputElement {
        const input = document.createElement('input');
        input.type = 'password';
        input.placeholder = 'OpenAI API Key';
        input.style.cssText = `
            padding: 8px;
            font-size: 12px;
            font-family: monospace;
            flex: 1;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 4px;
            background: rgba(0, 0, 0, 0.5);
            color: white;
        `;

        input.addEventListener('change', () => {
            this.chatService?.setApiKey(input.value);
        });

        // Предотвращаем перехват управления игроком при вводе
        input.addEventListener('keydown', (e) => {
            e.stopPropagation();
        });
        input.addEventListener('keyup', (e) => {
            e.stopPropagation();
        });

        return input;
    }

    private createModelSelect(): HTMLSelectElement {
        const select = document.createElement('select');
        select.style.cssText = `
            padding: 8px;
            font-size: 12px;
            font-family: monospace;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 4px;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            cursor: pointer;
        `;

        AI_MODELS.forEach(model => {
            const option = document.createElement('option');
            option.value = model.value;
            option.textContent = model.label;
            if (model.value === 'gpt-4o-mini') {
                option.selected = true;
            }
            select.appendChild(option);
        });

        select.addEventListener('change', () => {
            this.chatService?.setModel(select.value);
        });

        return select;
    }

    private createApiKeyContainer(): HTMLDivElement {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            gap: 5px;
            flex: 1;
            align-items: center;
        `;

        const label = document.createElement('span');
        label.textContent = '🔑 API:';
        label.style.cssText = `
            font-size: 14px;
            white-space: nowrap;
        `;

        const modelLabel = document.createElement('span');
        modelLabel.textContent = '🤖 Модель:';
        modelLabel.style.cssText = `
            font-size: 14px;
            white-space: nowrap;
            margin-left: 10px;
        `;

        container.appendChild(label);
        container.appendChild(this.apiKeyInput);
        container.appendChild(modelLabel);
        container.appendChild(this.modelSelect);

        return container;
    }

    private createButtonsContainer(): HTMLDivElement {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        `;

        const buttons = [
            { text: '← Влево', action: () => this.addCommand({ type: 'move_left' }) },
            { text: 'Вправо →', action: () => this.addCommand({ type: 'move_right' }) },
            { text: '↑ Вперед', action: () => this.addCommand({ type: 'move_forward' }) },
            { text: '↓ Назад', action: () => this.addCommand({ type: 'move_backward' }) },
            { text: 'Прыгнуть', action: () => this.addCommand({ type: 'jump' }) }
        ];

        buttons.forEach(({ text, action }) => {
            const btn = this.createButton(text, action);
            container.appendChild(btn);
        });

        // Кнопка взять/отпустить с динамическим текстом
        this.pickupButton = this.createButton('Взять', () => this.addCommand({ type: 'pickup' }));
        container.appendChild(this.pickupButton);

        // Кнопка Run
        const btnRun = this.createButton('▶ Run', () => this.executeCommands());
        btnRun.style.background = '#22cc22';
        btnRun.style.fontWeight = 'bold';
        container.appendChild(btnRun);

        // Кнопка Clear
        const btnClear = this.createButton('🗑 Clear', () => this.clearCommands());
        btnClear.style.background = '#cc2222';
        container.appendChild(btnClear);

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

    private createCommandStackText(): HTMLDivElement {
        const stackText = document.createElement('div');
        stackText.style.cssText = `
            flex: 1;
            padding: 10px;
            background: rgba(100, 100, 255, 0.2);
            border-radius: 4px;
            font-size: 14px;
            min-height: 40px;
            max-height: 120px;
            overflow-y: auto;
            white-space: pre-line;
            border: 2px solid rgba(100, 100, 255, 0.4);
        `;
        stackText.textContent = 'Стек команд: пусто';
        return stackText;
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
            white-space: pre-line;
        `;
        output.textContent = 'Готов к командам...';
        return output;
    }

    private commandToString(cmd: Command): string {
        const map: Record<Command['type'], string> = {
            'move_left': '← Влево',
            'move_right': 'Вправо →',
            'move_forward': '↑ Вперед',
            'move_backward': '↓ Назад',
            'jump': 'Прыгнуть',
            'pickup': 'Взять/Отпустить'
        };
        return map[cmd.type];
    }

    private updateCommandStackDisplay(): void {
        if (this.commandStack.length === 0) {
            this.commandStackText.textContent = 'Стек команд: пусто';
        } else {
            const commandsList = this.commandStack.map((cmd, i) =>
                `${i + 1}. ${this.commandToString(cmd)}`
            ).join('\n');
            this.commandStackText.textContent = `Стек команд (${this.commandStack.length}):\n${commandsList}`;
        }
    }

    private addCommand(cmd: Command): void {
        this.commandStack.push(cmd);
        this.updateCommandStackDisplay();
    }

    private clearCommands(): void {
        this.commandStack = [];
        this.updateCommandStackDisplay();
    }

    addCommands(commands: Command[]): void {
        this.commandStack.push(...commands);
        this.updateCommandStackDisplay();
    }

    getUserMessage(): string {
        return this.inputField.value.trim();
    }

    private async executeCommands(): Promise<void> {
        if (this.isExecuting || this.commandStack.length === 0) return;

        this.isExecuting = true;
        const commands = [...this.commandStack];

        for (let i = 0; i < commands.length; i++) {
            const cmd = commands[i];

            // Выполняем команду
            switch (cmd.type) {
                case 'move_left':
                    this.player.moveLeft(0.1);
                    break;
                case 'move_right':
                    this.player.moveRight(0.1);
                    break;
                case 'move_forward':
                    this.player.moveForward(0.1);
                    break;
                case 'move_backward':
                    this.player.moveBackward(0.1);
                    break;
                case 'jump':
                    this.player.jump();
                    break;
                case 'pickup':
                    this.player.togglePickup();
                    break;
            }

            // Задержка между командами
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        this.isExecuting = false;
    }

    setOutput(text: string): void {
        this.outputText.textContent = text;
    }

    updatePickupButton(isCarrying: boolean): void {
        if (this.pickupButton) {
            this.pickupButton.textContent = isCarrying ? 'Отпустить' : 'Взять';
        }
    }

    mount(parent: HTMLElement = document.body): void {
        parent.appendChild(this.element);
    }

    dispose(): void {
        this.element.remove();
    }
}
