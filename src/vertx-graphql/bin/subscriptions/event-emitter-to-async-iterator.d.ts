export function eventEmitterAsyncIterator<T>(eventEmitter: EventEmitter,
    eventsNames: string | string[]): AsyncIterator<T>