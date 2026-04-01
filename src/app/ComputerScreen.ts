import * as PIXI from 'pixi.js';
import { createCrtFilterPipeline } from '@blockstacking/jims-shaders';
import type { Vec2 } from '../types/vec';
import type { Message } from '../types/shell';
import { parseCommand, parseMessages } from './shell/MessageParser';

export class ComputerScreen {
	textInput: HTMLInputElement = document.querySelector('#computer-screen-textinput') as HTMLInputElement;
	shellTextList: Message[] = parseCommand('greet');
	shellCommandList: string[] = [];
	pastCommandsIndex: number = 0;

	application: PIXI.Application = new PIXI.Application();
	container: PIXI.Container = new PIXI.Container();
	drawnText: PIXI.SplitText;
	ticker?: PIXI.Ticker;

	private sizes: Vec2 = { x: 2400, y: 1600 };

	constructor() {
		this.initApplication();

		this.application.stage.filters = createCrtFilterPipeline({
			scanlines: { pixelHeight: 4, gapBrightness: 0.3 },
			phosphorMask: { pixelWidth: 4.5, maskBrightness: 0.3 },
			bloom: { intensity: 0.5, radius: 1.0 },
			curvature: { curvatureX: 0.5, curvatureY: 0.5 }
		});
		this.application.stage.addChild(this.container);

		this.drawnText = new PIXI.SplitText({
			text: parseMessages(this.shellTextList),
			x: 0,
			y: 0,
			width: this.sizes.x,
			height: this.sizes.y,
			autoSplit: true,

			style: {
				fill: 'white',
				fontFamily: 'monospace',
				fontSize: 60,
				wordWrap: true,
				breakWords: true,
    		wordWrapWidth: this.sizes.x,
				tagStyles: {
					info: { fontWeight: 'bold', fill: 'green' },
					error: { fill: 'red' },
					return: { fill: 'aqua' }
				}
			}
		});

		this.updateTextCommands();
	}

	async initApplication() {
		await this.application.init({
			width: this.sizes.x,
			height: this.sizes.y,
		});

		const background = new PIXI.Graphics()
			.rect(0, 0, this.sizes.x, this.sizes.y)
			.fill({ color: 'black' });


		this.container.addChild(background);
		this.container.addChild(this.drawnText);

		//document.body.appendChild(this.renderer.canvas)
		this.ticker = PIXI.Ticker.shared.add(ticker => this.update(ticker.lastTime));
	}

	update(_time: number) {
		// this.drawnText!.x = Math.cos(_time * 0.005) * 10;
		// this.drawnText!.y = Math.sin(_time * 0.005) * 10;

		this.textInput.focus();
		this.application.render();
	}

	onKeyboardEvent(event: KeyboardEvent) {
		if(event.code !== 'ArrowUp' && event.code !== 'ArrowDown') return;
		event.preventDefault(); //Prevent to move the input selection by default;

		const input = this.textInput;
		event.code === 'ArrowUp' ? this.pastCommandsIndex++ : this.pastCommandsIndex--;
		
		input.value = this.shellCommandList.at(-this.pastCommandsIndex) ?? "";
		this.updateTextCommands();
		input.setSelectionRange(input.value.length, input.value.length);
		console.log(input.value);
		this.textInput.focus()
	}

	onWheelEvent(event: WheelEvent, doScreenScroll: boolean = false) {
		if(!doScreenScroll) return;

		const scrollAmount = Math.sign(event.deltaY) * -20;
		const textPosition = scrollAmount + this.drawnText.position.y;

		this.drawnText.position.y = Math.min(0, textPosition);
	}

	onInputChange(_: Event) {
		this.updateTextCommands();
	}

	onInputEnter(_: Event) {
		const inputValue = this.textInput.value;
		let hasFailed: boolean = false;
		let lateMessage: Message[] = [];

		this.shellCommandList.push(inputValue);
		
		try {
			lateMessage.push(...parseCommand(inputValue));
		} catch (error) {
			lateMessage.push({ content: error as string, state: 'error' });
			hasFailed = true;
		}

		this.shellTextList.push({ content: inputValue, state: 'command', hasFailed });

		if(lateMessage) this.shellTextList.push(...lateMessage);

		this.textInput.value = "";
		this.pastCommandsIndex = 0;
		this.updateTextCommands();
	}

	updateTextCommands() {
		let inputString = this.textInput.value;

		const previousCommands = parseMessages(this.shellTextList)
		this.drawnText.text = `${previousCommands}\n> ${inputString}`;
	}
}