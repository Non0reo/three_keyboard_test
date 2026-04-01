import helpSheet from '../../assets/help.txt?raw'
import type { Message } from "../../types/shell";

export function parseCommand(command: string): Message[] {

  if(command.startsWith('help')) return [{ content: "EXE HELP", state: 'info' }, { content: helpSheet, state: 'return' }]
  if(command.startsWith('greet')) return [{ content: "*** Nono Shell v1.0.0 ***", state: 'info' }];

  const evalString = command.replace('console.log(', 'consoleLogInterpreter(');
  return [{ content: eval(`${evalString}`) as string, state: 'return' }];
}

export function parseMessages(messages: Message[]): string {
  let constructedString = "";
  messages.forEach(messages => {
    switch (messages.state) {
      case 'error':   constructedString += `\n<error>${messages.content}</error>`; break;
      case 'command': constructedString += `\n> ${messages.content}`; break;
      case 'info':    constructedString += `\n<info>*** ${messages.content} ***</info>`; break;
      case 'return':  constructedString += `\n<return>${messages.content}</return>`; break;
    } 
  });

  return constructedString
}