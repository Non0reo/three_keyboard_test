type State = 'error' | 'info' | 'command';

type Message = {
  content: string,
  state: State
}

export type {
  Message
}