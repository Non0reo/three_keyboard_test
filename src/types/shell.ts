import * as PIXI from 'pixi.js';
import type { Shell } from '../app/shell/ShellManager';
import type { Vec2 } from './vec';

type State = 'error' | 'info' | 'command' | 'return';

type Message = {
  content: string,
  state: State,
  hasFailed?: boolean;
}


interface Program extends PIXI.Container {
  id?: string;
  shell?: Shell;
  sizes: Vec2;

  initProgram(): Promise<void>;
  disposeProgram(): Promise<void>;
  update(_deltaTime: number, _time: number): void;
  onKeyboardEvent(event: KeyboardEvent): void;
  onWheelEvent(event: WheelEvent): void;
  onInputChange(event: Event): void;
  onInputEnter(event: Event): void;
}


export type {
  Message,
  Program
}