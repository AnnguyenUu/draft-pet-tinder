import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("falls back to the initial value when storage is empty", () => {
    const { result } = renderHook(() => useLocalStorage("count", 0));

    expect(result.current[0]).toBe(0);
  });

  it("reads and JSON-parses an existing stored value", () => {
    localStorage.setItem("count", JSON.stringify(42));

    const { result } = renderHook(() => useLocalStorage("count", 0));

    expect(result.current[0]).toBe(42);
  });

  it("persists a new value to storage as JSON", () => {
    const { result } = renderHook(() => useLocalStorage("count", 0));

    act(() => {
      result.current[1](5);
    });

    expect(result.current[0]).toBe(5);
    expect(localStorage.getItem("count")).toBe("5");
  });

  it("supports functional updates based on the previous value", () => {
    const { result } = renderHook(() => useLocalStorage("count", 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(2);
    expect(localStorage.getItem("count")).toBe("2");
  });

  it("falls back to the initial value when stored data is unparsable", () => {
    localStorage.setItem("count", "{not valid json");

    const { result } = renderHook(() => useLocalStorage("count", 0));

    expect(result.current[0]).toBe(0);
  });

  describe("when storage throws", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("still updates in-memory state if setItem throws", () => {
      const { result } = renderHook(() => useLocalStorage("count", 0));
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

      act(() => {
        result.current[1](7);
      });

      expect(result.current[0]).toBe(7);
    });

    it("falls back to the initial value if getItem throws", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("SecurityError");
      });

      const { result } = renderHook(() => useLocalStorage("count", 0));

      expect(result.current[0]).toBe(0);
    });
  });
});
