import helpSheet from '../../assets/help.txt?raw'
import type { Message } from "../../types/shell";

export function parseCommand(command: string): Message[] {

  const firstToken = command.match(/^([\w\-]+)/gm)?.[0] ?? '';
  const args = command.replace(firstToken, '').trim()
  /* const tokens = command.split(' ');
  const firstToken = tokens[0]; */

  switch (firstToken) {
    case 'help':  return [{ content: "EXE HELP", state: 'info' }, { content: helpSheet, state: 'return' }];
    case 'greet': return [{ content: "*** Nono Shell v1.0.0 ***", state: 'info' }];
    case 'echo':  return [{ content: args, state: 'return' }];
  }

  /* if(command.startsWith('help')) return [{ content: "EXE HELP", state: 'info' }, { content: helpSheet, state: 'return' }]
  if(command.startsWith('greet')) return [{ content: "*** Nono Shell v1.0.0 ***", state: 'info' }];
  if(command.startsWith('echo')) return [{ content: "*** Nono Shell v1.0.0 ***", state: 'info' }]; */

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