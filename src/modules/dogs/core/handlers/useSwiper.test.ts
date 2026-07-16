import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BreedDetails } from "@/types/dog";
import { LAST_BREED_ID_STORAGE_KEY } from "../../configuration/constants";
import { getInitialIndex, useSwiper } from "./useSwiper";

function makeBreed(id: string, name: string): BreedDetails {
  return {
    id,
    name,
    temperament: [],
    origin: null,
    lifeSpan: null,
    breedGroup: null,
    bredFor: null,
    description: null,
    history: null,
    weight: null,
    height: null,
    imageUrl: null,
    imageId: `${id}-img`,
  };
}

const breeds: BreedDetails[] = [
  makeBreed("1", "Affenpinscher"),
  makeBreed("2", "Afghan Hound"),
  makeBreed("3", "Africanis"),
];

describe("getInitialIndex", () => {
  it("starts at 0 when there is no last id", () => {
    expect(getInitialIndex(breeds, null)).toBe(0);
  });

  it("resumes right after the last swiped breed", () => {
    expect(getInitialIndex(breeds, "1")).toBe(1);
  });

  it("falls back to 0 when the last id is no longer in the list", () => {
    expect(getInitialIndex(breeds, "does-not-exist")).toBe(0);
  });

  it("clamps to the last index when the saved id was the last breed", () => {
    expect(getInitialIndex(breeds, "3")).toBe(2);
  });
});

describe("useSwiper", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts at the first breed", () => {
    const { result } = renderHook(() => useSwiper(breeds));

    expect(result.current.current.name).toBe("Affenpinscher");
    expect(result.current.index).toBe(0);
    expect(result.current.atEnd).toBe(false);
  });

  it("advances to the next breed on swipe and persists the swiped id", () => {
    const { result } = renderHook(() => useSwiper(breeds));

    act(() => {
      result.current.handleSwipe();
    });

    expect(result.current.current.name).toBe("Afghan Hound");
    expect(result.current.index).toBe(1);
    expect(localStorage.getItem(LAST_BREED_ID_STORAGE_KEY)).toBe(JSON.stringify("1"));
  });

  it("stops advancing once it reaches the last breed", () => {
    const { result } = renderHook(() => useSwiper(breeds));

    act(() => result.current.handleSwipe());
    act(() => result.current.handleSwipe());
    act(() => result.current.handleSwipe());

    expect(result.current.index).toBe(2);
    expect(result.current.current.name).toBe("Africanis");
    expect(result.current.atEnd).toBe(true);
  });

  it("windowed includes the current breed plus upcoming ones", () => {
    const { result } = renderHook(() => useSwiper(breeds));

    expect(result.current.windowed.map((breed) => breed.name)).toEqual([
      "Affenpinscher",
      "Afghan Hound",
      "Africanis",
    ]);
  });

  it("triggerSwipe delegates to the active card ref", () => {
    const { result } = renderHook(() => useSwiper(breeds));
    const swipe = vi.fn();
    result.current.activeCardRef.current = { swipe, restoreCard: vi.fn() };

    act(() => {
      result.current.triggerSwipe("right");
    });

    expect(swipe).toHaveBeenCalledWith("right");
  });

  it("triggerSwipe is a no-op once atEnd", () => {
    const { result } = renderHook(() => useSwiper(breeds));
    act(() => result.current.handleSwipe());
    act(() => result.current.handleSwipe());

    const swipe = vi.fn();
    result.current.activeCardRef.current = { swipe, restoreCard: vi.fn() };

    act(() => {
      result.current.triggerSwipe("left");
    });

    expect(swipe).not.toHaveBeenCalled();
  });

  it("handleKeyDown triggers a swipe for the arrow keys", () => {
    const { result } = renderHook(() => useSwiper(breeds));
    const swipe = vi.fn();
    result.current.activeCardRef.current = { swipe, restoreCard: vi.fn() };

    act(() => {
      result.current.handleKeyDown({ key: "ArrowRight" } as React.KeyboardEvent);
    });

    expect(swipe).toHaveBeenCalledWith("right");
  });

  it("resumes right after the persisted last id on a fresh mount", () => {
    localStorage.setItem(LAST_BREED_ID_STORAGE_KEY, JSON.stringify("1"));

    const { result } = renderHook(() => useSwiper(breeds));

    expect(result.current.current.name).toBe("Afghan Hound");
    expect(result.current.index).toBe(1);
  });
});
