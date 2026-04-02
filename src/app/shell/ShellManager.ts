import { parseCommand, parseMessages } from "./MessageParser";
import type { Message } from "../../types/shell";
import type { ComputerOS } from "../Computer";

export class Shell {
  textInput: HTMLInputElement = document.querySelector('#computer-screen-textinput') as HTMLInputElement;
  messagesList: Message[] = parseCommand('greet');
	commandList: string[] = [];
	pastCommandsIndex: number = 0;

	context: ComputerOS;

	constructor(context: ComputerOS) {
		this.context = context
	}

  get parsedString() {
    return parseMessages(this.messagesList);
  }

  sendCommand() {
		const command = this.textInput.value;
		this.commandList.push(command);
		
		//the messages returned are the return values of the execute
		const {messages, hasFailed} = this.executeCommand(command);

		this.messagesList.push({ content: command, state: 'command', hasFailed });
		if(messages) this.messagesList.push(...messages);

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

	executeCommand(command: string): { messages: Message[], hasFailed: boolean } {
		let hasFailed: boolean = false;
		let messages: Message[] = [];

		try {
			messages.push(...parseCommand(command, this.context));
		} catch (error) {
			messages.push({ content: error as string, state: 'error' });
			hasFailed = true;
		}

		return { messages, hasFailed }
	}
}