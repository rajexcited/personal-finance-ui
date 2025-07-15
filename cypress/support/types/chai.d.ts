/// <reference types="chai" />

declare global {
  namespace Chai {
    interface Assertion {
      loaded(): void;
    }
  }
}
