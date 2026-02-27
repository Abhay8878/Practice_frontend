import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";

// Global localStorage mock
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Fix for shadcn / dropdown / media queries
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    matches: false,
    media: "",
    onchange: null,
    addListener: vi.fn(), // legacy
    removeListener: vi.fn(), // legacy
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

/* ---------------- TEST SUITE ---------------- */

describe("StaffCreation setup", () => {
  it("should have localStorage available", () => {
    expect(window.localStorage).toBeDefined();
    expect(typeof window.localStorage.getItem).toBe("function");
  });

  it("should mock matchMedia correctly", () => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    expect(mediaQuery.matches).toBe(false);
  });
});
