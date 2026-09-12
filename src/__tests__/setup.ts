import "@testing-library/jest-dom/vitest";

// Chrome Storage API 모킹
const store: Record<string, unknown> = {};

Object.assign(globalThis, {
  chrome: {
    storage: {
      sync: {
        get: vi.fn(
          (
            key: string,
            callback?: (result: Record<string, unknown>) => void,
          ) => {
            const result = { [key]: store[key] };
            if (callback) callback(result);
            return Promise.resolve(result);
          },
        ),
        set: vi.fn(
          (items: Record<string, unknown>, callback?: () => void) => {
            Object.assign(store, items);
            if (callback) callback();
            return Promise.resolve();
          },
        ),
      },
    },
    runtime: {
      id: "test-extension-id",
    },
  },
});
