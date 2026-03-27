import * as PIXI from 'pixi.js';
import { createCrtFilterPipeline } from '@blockstacking/jims-shaders';

export class ComputerScreen {
	application: PIXI.Application = new PIXI.Application();
	container: PIXI.Container = new PIXI.Container();
	text: PIXI.SplitText;
	ticker?: PIXI.Ticker;

	constructor() {
		this.initApplication();

		this.application.stage.filters = createCrtFilterPipeline({
			scanlines: { pixelHeight: 4, gapBrightness: 0.3 },
			phosphorMask: { pixelWidth: 4.5, maskBrightness: 0.3 },
			bloom: { intensity: 0.5, radius: 6.5 },
			curvature: { curvatureX: 0.5, curvatureY: 0.5 }
		});
		this.application.stage.addChild(this.container);
		console.log(this.container)

		const rect = new PIXI.Graphics()
			.rect(0, 0, this.container.width, this.container.height)
			.fill({ color: 'red' })

		this.container.addChild(rect)

		this.text = new PIXI.SplitText({
			text: 'abc',
			x: 0,
			y: 0,
			style: {
				fill: 'white',
				fontSize: 60
			}
		})
		this.container.addChild(this.text)


		
		

	}

	async initApplication() {
		await this.application.init({
			background: 'blue',
			width: 600,
			height: 400,
			
		});

		this.container.setSize(
			this.application.renderer.width,
			this.application.renderer.height
		);

		//document.body.appendChild(this.renderer.canvas)
		this.ticker = PIXI.Ticker.shared.add(_ => this.update());
	}

	update() {
			this.application.render();
	}
}