import * as PIXI from 'pixi.js';
import { createCrtFilterPipeline } from '@blockstacking/jims-shaders';

export class ComputerScreen {
    renderer: PIXI.Renderer;
    stage: PIXI.Container = new PIXI.Container();
		text: PIXI.Text;
    ticker?: PIXI.Ticker;

    constructor() {
        this.renderer = new PIXI.WebGLRenderer();
        this.initRenderer();
				/* this.stage.scale.set(1, 1) */
				
        this.stage.filters = createCrtFilterPipeline({
            scanlines: { pixelHeight: 4, gapBrightness: 0.3 },
            phosphorMask: { pixelWidth: 4.5, maskBrightness: 0.3 },
            bloom: { intensity: 0.5, radius: 6.5 },
            curvature: { curvatureX: 0.35, curvatureY: 0.35 }
        });

				const circle = new PIXI.Graphics();
				circle
					.circle(100, 100, 50)
					.fill({ color: 'red' })

				this.stage.addChild(circle)

				this.text = new PIXI.Text({
					text: 'Hello !',
					x: 0,
					y: 100,
					style: {
						fill: 'white',
						fontSize: 60
					}
				})
				this.stage.addChild(this.text)


				
				

    }

    async initRenderer() {
        await this.renderer.init({
            background: 'blue',
            width: 600,
            height:  400,
        });

				this.stage.position.set( 0, -300 )
				this.stage.setSize( 600, 600 )

				//document.body.appendChild(this.renderer.canvas)
        this.ticker = PIXI.Ticker.shared.add(_ => this.update());
    }

    update() {
        this.renderer.render(this.stage)
    }
}