import { Buffer } from 'buffer'

export function initFhevmPolyfills() {
  if (typeof window === 'undefined') return;

  // @ts-ignore
  if (!window.global) {
    // @ts-ignore
    window.global = window;
  }

  // @ts-ignore
  if (!window.Buffer) {
    // @ts-ignore
    window.Buffer = Buffer;
  }
}

