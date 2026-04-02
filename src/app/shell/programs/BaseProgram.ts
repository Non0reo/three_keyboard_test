import * as PIXI from 'pixi.js';
import type { Program } from "../../../types/shell";
import type { Shell } from '../ShellManager';
import type { Vec2 } from '../../../types/vec';

export class BaseProgram extends PIXI.Container implements Program {
	programID = 'BaseProgram';
  shell?: Shell;
  sizes: Vec2;
	isActiveProgram: boolean = false;

  constructor(sizes: Vec2, shell?: Shell) {
     super({
        width: sizes.x,
        height: sizes.y
     });
     this.shell = shell;
     this.sizes = sizes;
  }

  async initProgram(): Promise<void> {};
  async disposeProgram(): Promise<void> { this.removeFromParent() }
  update(_deltaTime: number, _time: number): void {};
  
  onKeyboardEvent(_event: KeyboardEvent): void {};
  onWheelEvent(_event: WheelEvent): void {};
  onInputChange(_event: Event): void {};
  onInputEnter(_event: Event): void {};
}