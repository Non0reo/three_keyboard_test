import * as PIXI from 'pixi.js';
import { createCrtFilterPipeline } from '@blockstacking/jims-shaders';
import type { Vec2 } from '../types/vec';
import { Shell } from './shell/ShellManager';
import type { Program } from '../types/shell';
import { ShellProgram } from './shell/programs/Shell';
import { DVDLockscreenProgram } from './shell/programs/DVDLockscreen';

export class ComputerOS {
	
	application: PIXI.Application = new PIXI.Application();
	container: PIXI.Container = new PIXI.Container();
	ticker?: PIXI.Ticker;
	noSignalText: PIXI.Text;

	private shell: Shell = new Shell(this);
	private sizes: Vec2 = { x: 2400, y: 1600 };

	activeProgram?: Program;
	programs: Program[] = [
		new ShellProgram(this.sizes, this.shell, this),
		new DVDLockscreenProgram(this.sizes),
	]
	
	constructor() {
		this.initApplication();


		this.noSignalText = new PIXI.Text({
			text: 'No Signal',
			x: this.sizes.x / 2,
			y: this.sizes.y / 2,
			anchor: 0.5,
			visible: false,
			style: {
				fill: 'white',
				fontFamily: 'monospace',
				fontSize: 100,
			}
		});

		this.application.stage.filters = createCrtFilterPipeline({
			scanlines: { pixelHeight: 4, gapBrightness: 0.3 },
			phosphorMask: { pixelWidth: 4.5, maskBrightness: 0.3 },
			bloom: { intensity: 0.5, radius: 1.0 },
			curvature: { curvatureX: 0.5, curvatureY: 0.5 }
		});
		this.application.stage.addChild(this.container);
		

		this.programs.forEach(program => {
			this.application.stage.addChild(program);
		});

		this.setProgram(this.programs[0]);
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
		this.container.addChild(this.noSignalText);

		this.ticker = PIXI.Ticker.shared.add(ticker => this.update(ticker.deltaTime, ticker.lastTime));
	}


	update(_deltaTime: number, _time: number) {
		this.activeProgram?.update(_deltaTime, _time);
		this.application.render();
	}
	
	onKeyboardEvent(event: KeyboardEvent) {
		const isCtrlCPressed = (event.ctrlKey || event.metaKey) && event.code === 'KeyC';
		const isEscape = event.code === 'Escape';
		if ( isCtrlCPressed || isEscape) {
			this.setProgram(this.getProgramByName('Shell'));
			//this.shell.executeCommand('run Shell')
		}


		this.activeProgram?.onKeyboardEvent(event);
	}
	onInputChange(event: Event) { this.activeProgram?.onInputChange(event); }
	onInputEnter(event: Event) { this.activeProgram?.onInputEnter(event); }
	onWheelEvent(event: WheelEvent, doScreenScroll: boolean = false) {
		if(!doScreenScroll) return;
		this.activeProgram?.onWheelEvent(event);
	}

	getProgramByName(id: string): Program | undefined {
		return this.programs.find(program => program.programID === id)
	}

	setProgram(setProgram?: Program): boolean {
		// this.activeProgram?.disposeProgram();

		if(!setProgram) return false;

		this.noSignalText.visible = false;
		this.programs.forEach(program => {
			program.visible = program.isActiveProgram = false;
		});

		this.activeProgram = setProgram; //new program
		setProgram.visible = setProgram.isActiveProgram = true;
		setProgram.initProgram();
		return true;
	}

	forceExitProgram() {
		this.noSignalText.visible = true;
		this.activeProgram = undefined;
		this.programs.forEach(program => {
			program.visible = program.isActiveProgram = false;
		});
	}
}