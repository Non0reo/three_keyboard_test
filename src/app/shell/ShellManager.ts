import { parseCommand, parseMessages } from "./MessageParser";
import type { Message } from "../../types/shell";

export class Shell {
  textInput: HTMLInputElement = document.querySelector('#computer-screen-textinput') as HTMLInputElement;
  messagesList: Message[] = parseCommand('greet');
	commandList: string[] = [];
	pastCommandsIndex: number = 0;

  get parsedString() {
    return parseMessages(this.messagesList);
  }

  sendCommand() {
    const inputValue = this.textInput.value;
		let hasFailed: boolean = false;
		let lateMessage: Message[] = [];

		this.commandList.push(inputValue);
		
		try {
			lateMessage.push(...parseCommand(inputValue));
		} catch (error) {
			lateMessage.push({ content: error as string, state: 'error' });
			hasFailed = true;
		}

		this.messagesList.push({ content: inputValue, state: 'command', hasFailed });

		if(lateMessage) this.messagesList.push(...lateMessage);

		this.textInput.value = "";
		this.pastCommandsIndex = 0;
  }

  setFromPastCommand(moveBy: number) {
    const input = this.textInput;
		this.pastCommandsIndex += moveBy;

    input.value = this.commandList.at(-this.pastCommandsIndex) ?? "";
		input.setSelectionRange(input.value.length, input.value.length);
		this.textInput.focus()
  }
}