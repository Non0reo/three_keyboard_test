import type { Message } from "../../types/shell";

export function parseMessages(messages: Message[]): string {
  let constructedString = "";
  messages.forEach(messages => {
    switch (messages.state) {
      case 'error':   constructedString += `\n<error>${messages.content}</error>`; break;
      case 'command': constructedString += `\n> ${messages.content}`; break;
      case 'info':    constructedString += `\n<info>*** ${messages.content} ***</info>`; break;
    } 
  });

  return constructedString
}