import * as PIXI from 'pixi.js';
import { createCrtFilterPipeline } from '@blockstacking/jims-shaders';
import type { Vec2 } from '../types/vec';
import { Shell } from './shell/ShellManager';
import type { Program } from '../types/shell';
import { ShellProgram } from './shell/programs/Shell';
import { DVDLockscreenProgram } from './shell/programs/DVDLockscreen';

export class ComputerScreen {
	
	application: PIXI.Application = new PIXI.Application();
	container: PIXI.Container = new PIXI.Container();
	ticker?: PIXI.Ticker;

	private shell: Shell = new Shell();
	private sizes: Vec2 = { x: 2400, y: 1600 };

	activeProgram?: Program;
	programs: Program[] = [
		new ShellProgram(this.sizes, this.shell),
		new DVDLockscreenProgram(this.sizes),
	]
	
	constructor() {
		this.initApplication();

		this.application.stage.filters = createCrtFilterPipeline({
			scanlines: { pixelHeight: 4, gapBrightness: 0.3 },
			phosphorMask: { pixelWidth: 4.5, maskBrightness: 0.3 },
			bloom: { intensity: 0.5, radius: 1.0 },
			curvature: { curvatureX: 0.5, curvatureY: 0.5 }
		});
		this.application.stage.addChild(this.container);
		this.program = this.programs[0];
	}

	set program(program: Program) {
		this.activeProgram?.disposeProgram();

		this.activeProgram = program; //new program
		this.activeProgram.initProgram();
		this.application.stage.addChild(this.activeProgram);
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
		this.ticker = PIXI.Ticker.shared.add(ticker => this.update(ticker.deltaTime, ticker.lastTime));
	}


	update(_deltaTime: number, _time: number) {
		this.activeProgram?.update(_deltaTime, _time);
		this.application.render();
	}
	
	onKeyboardEvent(event: KeyboardEvent) { this.activeProgram?.onKeyboardEvent(event);}
	onInputChange(event: Event) { this.activeProgram?.onInputChange(event); }
	onInputEnter(event: Event) { this.activeProgram?.onInputEnter(event); }
	onWheelEvent(event: WheelEvent, doScreenScroll: boolean = false) {
		if(!doScreenScroll) return;
		this.activeProgram?.onWheelEvent(event);
	}
}