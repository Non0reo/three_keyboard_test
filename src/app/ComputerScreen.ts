import * as PIXI from 'pixi.js';
import { createCrtFilterPipeline } from '@blockstacking/jims-shaders';
import type { Vec2 } from '../types/vec';
import type { Message } from '../types/shell';
import { parseMessages } from './shell/MessageParser';

export class ComputerScreen {
	// textArea: HTMLTextAreaElement = document.querySelector('#computer-screen-textarea') as HTMLTextAreaElement;
	textInput: HTMLInputElement = document.querySelector('#computer-screen-textinput') as HTMLInputElement;
	shellTextList: Message[] = [{ content: "*** Nono Shell v1.0.0 ***", state: 'info' }];

	application: PIXI.Application = new PIXI.Application();
	container: PIXI.Container = new PIXI.Container();
	drawnText: PIXI.SplitText;
	ticker?: PIXI.Ticker;
	

	private sizes: Vec2 = { x: 1200, y: 800 };

	constructor() {
		this.initApplication();

		this.application.stage.filters = createCrtFilterPipeline({
			scanlines: { pixelHeight: 4, gapBrightness: 0.3 },
			phosphorMask: { pixelWidth: 4.5, maskBrightness: 0.3 },
			bloom: { intensity: 0.5, radius: 2.0 },
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
					error: { fill: 'red' }
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
		// this.drawnText!.y = Math.sin(time * 0.005) * 10;
		
		this.textInput.focus();
		this.application.render();
	}

	onKeyboardEvent() {
		
	}

	onInputChange(_: InputEvent) {
		this.updateTextCommands();
	}

	onInputEnter(_: Event) {
		const finalValue = this.textInput.value
		this.shellTextList.push({ content: finalValue, state: 'command' });
		
		try {
			eval(`${finalValue}`);
		} catch (error) {
			this.shellTextList.push({ content: error as string, state: 'error' });
		}

		this.textInput.value = "";
		this.updateTextCommands();
	}

	updateTextCommands() {
		let finalString = this.textInput.value;

		const previousCommands = parseMessages(this.shellTextList)
		this.drawnText.text = `${previousCommands}\n> ${finalString}`;
	}
}