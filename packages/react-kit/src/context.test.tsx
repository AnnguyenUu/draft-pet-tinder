import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { context } from "./context";

describe("context", () => {
  it("throws when the hook is used outside its provider", () => {
    const [, useCounterContext] = context("Counter", () => 0);

    expect(() => renderHook(() => useCounterContext())).toThrow(
      "useCounterContext must be used within a CounterProvider.",
    );
  });

  it("exposes the wrapped hook's return value through the consumer hook", () => {
    const [CounterProvider, useCounterContext] = context("Counter", () => ({
      count: 42,
    }));

    const { result } = renderHook(() => useCounterContext(), {
      wrapper: ({ children }) => <CounterProvider>{children}</CounterProvider>,
    });

    expect(result.current.count).toBe(42);
  });

  it("passes the `value` prop through to the wrapped hook as its argument", () => {
    const useDoubled = (value: number) => value * 2;
    const [DoubledProvider, useDoubledContext] = context("Doubled", useDoubled);

    function Display() {
      return <p>{useDoubledContext()}</p>;
    }

    render(
      <DoubledProvider value={21}>
        <Display />
      </DoubledProvider>,
    );

    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("gives the Provider and Context the expected display names", () => {
    const [Provider, , Context] = context("Counter", () => 0);

    expect(Provider.displayName).toBe("CounterProvider");
    expect(Context.displayName).toBe("CounterContext");
  });
});
