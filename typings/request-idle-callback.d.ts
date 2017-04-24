interface RequestIdleCallback {
  didTimeout?: boolean;
  timeRemaining?: () => number;
}

interface Window {
  requestIdleCallback(cb: (deadline: RequestIdleCallback) => any): NodeJS.Timer;
  cancelIdleCallback(id: NodeJS.Timer): void;
}
