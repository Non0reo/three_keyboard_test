type State = 'error' | 'info' | 'command' | 'return';

type Message = {
  content: string,
  state: State,
  hasFailed?: boolean;
}

export type {
  Message
}