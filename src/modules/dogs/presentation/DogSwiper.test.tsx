import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { forwardRef, useImperativeHandle, type ReactNode } from "react";

import type { BreedDetails } from "@/types/dog";

// react-tinder-card owns real drag gestures/animation, which isn't our code
// to test here. This stub preserves its contract (a forwarded ref exposing
// `swipe`/`restoreCard`, and an `onSwipe` callback) so we can test how
// DogSwiper wires the deck together without depending on its internals.
interface TinderCardStubProps {
  children: ReactNode;
  className?: string;
  onSwipe?: (direction: "left" | "right" | "up" | "down") => void;
}
vi.mock("react-tinder-card", () => ({
  default: forwardRef<{ swipe: (dir?: string) => Promise<void> }, TinderCardStubProps>(
    ({ children, onSwipe, className }, ref) => {
      useImperativeHandle(ref, () => ({
        swipe: async (dir) => {
          onSwipe?.((dir ?? "right") as "left" | "right");
        },
        restoreCard: async () => {},
      }));
      return <div className={className}>{children}</div>;
    },
  ),
}));

const onChangeDirection = vi.fn();
vi.mock("@/modules/dogs/core/store/dog.store", () => ({
  useBreedsContext: () => ({ onChangeDirection }),
}));

const { DogSwiper } = await import("./DogSwiper");

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

const breeds = [makeBreed("1", "Affenpinscher"), makeBreed("2", "Afghan Hound"), makeBreed("3", "Africanis")];

function renderSwiper(list = breeds) {
  return render(
    <MemoryRouter>
      <DogSwiper breeds={list} />
    </MemoryRouter>,
  );
}

describe("DogSwiper", () => {
  beforeEach(() => {
    onChangeDirection.mockClear();
    localStorage.clear();
  });

  it("shows the first breed initially", () => {
    renderSwiper();

    expect(screen.getByText("Affenpinscher")).toBeInTheDocument();
  });

  it("advances and reports a right swipe when Like is clicked", async () => {
    const user = userEvent.setup();
    renderSwiper();

    await user.click(screen.getByRole("button", { name: "Like Affenpinscher" }));

    // The deck itself advances immediately; reporting the direction to the
    // store is debounced (see DogSwiper's `useDebounceCallback`), so it
    // lands slightly after the click.
    expect(screen.getByText("Afghan Hound")).toBeInTheDocument();
    await waitFor(
      () => expect(onChangeDirection).toHaveBeenCalledWith("right", "1-img", "Affenpinscher"),
      {
        timeout: 1000,
      },
    );
  });

  it("advances and reports a left swipe when Pass is clicked", async () => {
    const user = userEvent.setup();
    renderSwiper();

    await user.click(screen.getByRole("button", { name: "Pass on Affenpinscher" }));

    expect(screen.getByText("Afghan Hound")).toBeInTheDocument();
    await waitFor(
      () => expect(onChangeDirection).toHaveBeenCalledWith("left", "1-img", "Affenpinscher"),
      {
        timeout: 1000,
      },
    );
  });

  it("advances via the ArrowRight key", async () => {
    const user = userEvent.setup();
    renderSwiper();

    screen.getByRole("group").focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByText("Afghan Hound")).toBeInTheDocument();
    await waitFor(
      () => expect(onChangeDirection).toHaveBeenCalledWith("right", "1-img", "Affenpinscher"),
      {
        timeout: 1000,
      },
    );
  });

  it("exposes an accessible label describing progress through the list", () => {
    renderSwiper();

    expect(
      screen.getByRole("group", { name: "Dog breeds, showing 1 of 3: Affenpinscher" }),
    ).toBeInTheDocument();
  });

  it("disables the action buttons once the last breed is reached", async () => {
    const user = userEvent.setup();
    renderSwiper();

    await user.click(screen.getByRole("button", { name: "Like Affenpinscher" }));
    await user.click(screen.getByRole("button", { name: "Like Afghan Hound" }));

    expect(screen.getByRole("button", { name: "Pass on Africanis" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Like Africanis" })).toBeDisabled();
  });
});
