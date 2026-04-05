import * as PIXI from 'pixi.js';
import 'pixi.js/math-extras'
import { BaseProgram } from "./BaseProgram";
import type { Vec2 } from '../../../types/vec';

const svgTexture = await PIXI.Assets.load('textures/programs/DVD_logo.svg');

export class DVDProgram extends BaseProgram {
  programID = 'DVD'
  logo: PIXI.Texture;
  sprite: PIXI.Sprite;
  velocity: PIXI.Point;

  constructor(sizes: Vec2) {
    super(sizes);

    //this.logo = PIXI.Assets.load('textures/programs/DVD_logo.svg');
    this.logo = svgTexture;
    this.sprite = new PIXI.Sprite(this.logo);
    
    this.sprite.scale.set(2)
    this.sprite.position.set(
      Math.random() * (sizes.x - this.sprite.width),
      Math.random() * (sizes.y - this.sprite.height)
    );

    const angle = Math.random() * Math.PI * 2;
    this.velocity = new PIXI.Point(
      Math.cos(angle),
      Math.sin(angle)
    ).multiplyScalar(10);

    this.addChild(this.sprite);
  }

  randomColor() {
    this.sprite.tint = `hsl(${Math.random() * 360} 100% 50%)`
  }

  update(_deltaTime: number, _time: number): void {
    const reflectVectFrom = (plane: 'x' | 'y') => {
      const planeValues = plane === 'x' ? [1, 0] : [0, 1];

      //const velocityN = this.velocity.normalize();
      //const velocityAngle = Math.a

      this.velocity.reflect( new PIXI.Point(...planeValues).rotate(Math.random() * 0.4 - 0.2).normalize(), this.velocity );
      this.sprite.position[plane] += this.velocity[plane] * _deltaTime;
      this.randomColor();
    }

    const bounds = this.sprite.getBounds();
    if (bounds.minX < 0 || this.sizes.x < bounds.maxX) reflectVectFrom('x');
    if (bounds.minY < 0 || this.sizes.y < bounds.maxY) reflectVectFrom('y');

    this.sprite.position.x += this.velocity.x * _deltaTime;
    this.sprite.position.y += this.velocity.y * _deltaTime;
  }

  onKeyboardEvent(_event: KeyboardEvent): void {
    
  }
}