import * as PIXI from 'pixi.js';
import type { Program } from "../../../types/shell";
import type { Vec2 } from '../../../types/vec';
import { BaseProgram } from './BaseProgram';

export class WebcamProgram extends BaseProgram implements Program {
	programID = 'Webcam';
  videoElement: HTMLVideoElement;
  stream?: MediaStream;
  isVideoPlaying: boolean = false;

  loadingGraphic: PIXI.Graphics;
  videoSprite: PIXI.Sprite;
  noiseFilter: PIXI.NoiseFilter = new PIXI.NoiseFilter({
    resolution: 0.5,
    noise: 0.25
  });

  constructor(sizes: Vec2) {
    super(sizes);

    this.filters = this.noiseFilter;

    //Displayed Video Source
    this.videoSprite = new PIXI.Sprite({
      width: this.sizes.x,
      height: this.sizes.y,
      visible: false,
      texture: PIXI.Texture.WHITE
    });
    this.addChild(this.videoSprite);

    //Loading circle when pending webcam stream
    this.loadingGraphic = new PIXI.Graphics({
      visible: true,
      origin: { x: sizes.x / 2, y: sizes.y / 2 }
    })
      .arc(sizes.x / 2, sizes.y / 2, 100, 0, Math.PI * 1.5).stroke({ width: 20, color: 'white'})
    
    this.addChild(this.loadingGraphic);

    

    // Video Element
    this.videoElement = document.createElement('video');
    this.videoElement.id = 'camera-program-video';
    //document.body.appendChild(this.videoElement)

    this.videoElement.onloadedmetadata = (e) => {
      if(!e.target) return;

      this.videoSprite.texture = PIXI.Texture.from(e.target as HTMLVideoElement);
      
      this.videoElement?.play().then(() => {
        setTimeout(() => {
          this.loadingGraphic.visible = false;
          this.videoSprite.visible = true;
          this.isVideoPlaying = true;
        }, 1500);
      });
      
    };
  }

  async initProgram(): Promise<void> {

    
    this.videoSprite.visible = false;
    this.loadingGraphic.visible = true;

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { frameRate: { max: 5 } },
      audio: false
    });

    this.videoElement.srcObject = this.stream;
    
  };

  async disposeProgram(): Promise<void> {
    this.stream?.getTracks()[0].stop();
    this.videoElement.srcObject = null;
    this.isVideoPlaying = false;
  }

  update(_deltaTime: number, _time: number): void {
    if(!this.isVideoPlaying) {
      this.loadingGraphic.rotation += 0.05 * _deltaTime;
    } else {
      this.noiseFilter.seed = Math.random()
    }
  };
  
  onKeyboardEvent(_event: KeyboardEvent): void {};
  onWheelEvent(_event: WheelEvent): void {};
  onInputChange(_event: Event): void {};
  onInputEnter(_event: Event): void {};
}