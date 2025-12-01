import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Provide a writable clipboard for tests that mock navigator.clipboard
const navigatorMock = { ...globalThis.navigator } as Navigator & { clipboard?: Clipboard };

Object.defineProperty(navigatorMock, 'clipboard', {
  value: {
    writeText: vi.fn(),
    readText: vi.fn(),
  },
  writable: true,
  configurable: true,
});

try {
  Object.defineProperty(globalThis, 'navigator', {
    value: navigatorMock,
    configurable: true,
    writable: true,
  });
} catch {
  // If the environment prevents redefining navigator, continue with stubGlobal fallback
}

vi.stubGlobal('navigator', navigatorMock);

afterEach(() => {
  cleanup();
});
