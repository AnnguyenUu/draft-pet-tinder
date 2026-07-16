import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import type { BreedDetails } from "@/types/dog";
import { BreedCard } from "./BreedCard";

const breed: BreedDetails = {
  id: "1",
  name: "Affenpinscher",
  temperament: ["Confident", "alert", "playful", "loyal"],
  origin: "Germany",
  lifeSpan: "12-15",
  breedGroup: "Toy",
  bredFor: null,
  description: null,
  history: null,
  weight: null,
  height: null,
  imageUrl: "https://cdn2.thedogapi.com/images/abc123.jpg",
  imageId: "abc123",
};

function renderCard(props: Partial<React.ComponentProps<typeof BreedCard>> = {}) {
  return render(
    <MemoryRouter>
      <BreedCard breed={breed} {...props} />
    </MemoryRouter>,
  );
}

describe("BreedCard", () => {
  it("renders the breed's name and origin", () => {
    renderCard();

    expect(screen.getByText("Affenpinscher")).toBeInTheDocument();
    expect(screen.getByText("Germany")).toBeInTheDocument();
  });

  it("links the photo and the text to the breed's detail page", () => {
    renderCard();

    const links = screen.getAllByRole("link", { name: "More about Affenpinscher" });
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute("href", "/breads/1");
    }
  });

  it("does not render Pass/Like buttons when no handlers are given", () => {
    renderCard();

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("only renders the buttons for the handlers actually provided", () => {
    renderCard({ onPass: vi.fn() });

    expect(screen.getByRole("button", { name: "Pass on Affenpinscher" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Like Affenpinscher" })).not.toBeInTheDocument();
  });

  it("calls onPass and onLike when their buttons are clicked", async () => {
    const user = userEvent.setup();
    const onPass = vi.fn();
    const onLike = vi.fn();
    renderCard({ onPass, onLike });

    await user.click(screen.getByRole("button", { name: "Pass on Affenpinscher" }));
    await user.click(screen.getByRole("button", { name: "Like Affenpinscher" }));

    expect(onPass).toHaveBeenCalledTimes(1);
    expect(onLike).toHaveBeenCalledTimes(1);
  });

  it("disables the action buttons when disabled is true", () => {
    renderCard({ onPass: vi.fn(), onLike: vi.fn(), disabled: true });

    expect(screen.getByRole("button", { name: "Pass on Affenpinscher" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Like Affenpinscher" })).toBeDisabled();
  });

  it("falls back to a placeholder when there is no photo", () => {
    renderCard({ breed: { ...breed, imageUrl: null } });

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
