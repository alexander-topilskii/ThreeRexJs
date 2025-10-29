import type { Command } from '../ui/ControlPanel';

export interface GameState {
    robotPosition: { x: number; y: number; z: number };
    cubePosition: { x: number; y: number; z: number };
    spherePosition: { x: number; y: number; z: number };
    isCarryingCube: boolean;
}

export interface ChatGPTCommandServiceOptions {
    apiKey?: string;
    model?: string;
}

export const AI_MODELS = [
    { value: 'gpt-4o', label: 'GPT-4o (рекомендуется)' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (быстрее)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (дешевле)' }
] as const;

export class ChatGPTCommandService {
    private apiKey: string = '';
    private model: string = 'gpt-4o-mini';

    constructor(options: ChatGPTCommandServiceOptions = {}) {
        this.apiKey = options.apiKey || '';
        this.model = options.model || 'gpt-4o-mini';
    }

    setApiKey(key: string): void {
        this.apiKey = key;
    }

    getApiKey(): string {
        return this.apiKey;
    }

    setModel(model: string): void {
        this.model = model;
    }

    getModel(): string {
        return this.model;
    }

    async generateCommands(gameState: GameState, userMessage: string): Promise<Command[]> {
        if (!this.apiKey) {
            throw new Error('API ключ не установлен. Пожалуйста, введите ключ OpenAI API.');
        }

        const prompt = this.buildPrompt(gameState, userMessage);

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'Ты - система управления роботом. Твоя задача составить список команд для перемещения робота и куба к целевой сфере. Отвечай ТОЛЬКО валидным JSON массивом команд, без дополнительного текста.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content || '[]';

            return this.parseCommands(content);
        } catch (error) {
            console.error('Ошибка при запросе к ChatGPT:', error);
            throw error;
        }
    }

    private buildPrompt(gameState: GameState, userMessage: string): string {
        return `Ты руководишь роботом. Твоя задача составить список команд на выполнение, команды должны привести робота с кубом к сфере.

Тебе доступны операции:
- "вперед" (движение по -Z 0.5)
- "назад" (движение по +Z 0.5)
- "влево" (движение по -X 0.5)
- "вправо" (движение по +X 0.5)
- "взять" (взять/отпустить куб)
- "прыгнуть" (прыжок)

Текущее положение:
- Робот: x=${gameState.robotPosition.x.toFixed(2)}, y=${gameState.robotPosition.y.toFixed(2)}, z=${gameState.robotPosition.z.toFixed(2)}
- Куб: x=${gameState.cubePosition.x.toFixed(2)}, y=${gameState.cubePosition.y.toFixed(2)}, z=${gameState.cubePosition.z.toFixed(2)}
- Сфера (цель): x=${gameState.spherePosition.x.toFixed(2)}, y=${gameState.spherePosition.y.toFixed(2)}, z=${gameState.spherePosition.z.toFixed(2)}
- Робот несет куб: ${gameState.isCarryingCube ? 'да' : 'нет'}

Дополнительно: ${userMessage}

Верни JSON массив команд в формате: ["вперед", "взять", "влево", "влево", "назад", "взять"]
ВАЖНО: Отвечай ТОЛЬКО JSON массивом, без markdown блоков и дополнительного текста.`;
    }

    private parseCommands(content: string): Command[] {
        try {
            // Убираем markdown блоки если есть
            let cleanContent = content.trim();
            if (cleanContent.startsWith('```json')) {
                cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
            } else if (cleanContent.startsWith('```')) {
                cleanContent = cleanContent.replace(/```\s*/, '').replace(/```\s*$/, '');
            }

            const commandStrings: string[] = JSON.parse(cleanContent);

            return commandStrings.map(cmd => this.stringToCommand(cmd.toLowerCase()));
        } catch (error) {
            console.error('Ошибка парсинга команд:', error, 'Content:', content);
            throw new Error('Не удалось распарсить команды из ответа ChatGPT');
        }
    }

    private stringToCommand(str: string): Command {
        const mapping: Record<string, Command['type']> = {
            'вперед': 'move_forward',
            'назад': 'move_backward',
            'влево': 'move_left',
            'вправо': 'move_right',
            'взять': 'pickup',
            'отпустить': 'pickup',
            'прыгнуть': 'jump',
            'прыжок': 'jump'
        };

        const type = mapping[str];
        if (!type) {
            console.warn(`Неизвестная команда: ${str}, использую move_forward`);
            return { type: 'move_forward' };
        }

        return { type };
    }
}
