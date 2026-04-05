import * as PIXI from 'pixi.js';
import { animate, steps } from 'animejs';
import { BaseProgram } from "./BaseProgram";
import type { Shell } from '../ShellManager';
import type { Vec2 } from '../../../types/vec';
import type { ComputerOS } from '../../Computer';

export class ShellProgram extends BaseProgram {
  programID = 'Shell'
  textInput: HTMLInputElement = document.querySelector('#computer-screen-textinput') as HTMLInputElement;
  drawnText: PIXI.SplitText;
  context: ComputerOS;

  constructor(sizes: Vec2, shell: Shell, context: ComputerOS) {
    super(sizes, shell);
    
    this.context = context;
    this.drawnText = new PIXI.SplitText({
      text: shell.parsedString,
      x: 0,
      y: 0,
      width: sizes.x,
      height: sizes.y,
      autoSplit: true,

      style: {
        fill: 'white',
        fontFamily: 'monospace',
        fontSize: 60,
        wordWrap: true,
        breakWords: true,
        wordWrapWidth: sizes.x,
        tagStyles: {
          info: { fontWeight: 'bold', fill: 'green' },
          error: { fill: 'red' },
          return: { fill: 'aqua' }
        }
      }
    });
    
    this.addChild(this.drawnText);
    this.updateTextCommands();
  }

  async initProgram(): Promise<void> {
    this.drawnText.chars.forEach((char, i) => {
      animate(char, {
        alpha: [0, 1],
        delay: i * 5,
        duration: 100,
        ease: steps(1)
      })
    })
  }

  update(_time: number): void {
    this.textInput.focus();
  }

  updateTextCommands() {
		let inputString = this.textInput.value;

		const previousCommands = this.shell?.parsedString;
		this.drawnText.text = `${previousCommands}\n> ${inputString}`;
	}

  onKeyboardEvent(_event: KeyboardEvent): void {
    if(_event.code !== 'ArrowUp' && _event.code !== 'ArrowDown') return;
		_event.preventDefault(); //Prevent to move the input selection by default;

		const moveBy = _event.code === 'ArrowUp' ? 1 : -1; //Point to +1 or -1 in the command list
		this.shell?.setFromPastCommand(moveBy);
		this.updateTextCommands();
  }

  onInputChange(_event: Event): void {
    this.updateTextCommands();
  }

  onInputEnter(_event: Event): void {
    this.shell?.sendCommand()
    this.updateTextCommands();
  }

  onWheelEvent(_event: WheelEvent): void {
    const scrollAmount = Math.sign(_event.deltaY) * -20;
		const textPosition = scrollAmount + this.drawnText.position.y;

		this.drawnText.position.y = Math.max(Math.min(0, textPosition), -this.drawnText.height);
  }
}