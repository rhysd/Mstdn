interface RequestIdleCallback {
  didTimeout?: boolean;
  timeRemaining?: () => number;
}

interface RequestIdleCallbackOptions {
    timeout?: number;
}

type RequestIdleCallbackId = number;

interface Window {
  requestIdleCallback(cb: (deadline: RequestIdleCallback) => any, options?: RequestIdleCallbackOptions): RequestIdleCallbackId;
  cancelIdleCallback(id: RequestIdleCallbackId): void;
}
