import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import type { BreedDetails } from "@/types/dog";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => navigateMock };
});

const useBreedDetailMock = vi.fn();
vi.mock("@/modules/dogs/core/handlers/useBreedDetail", () => ({
  useBreedDetail: (...args: unknown[]) => useBreedDetailMock(...args),
}));

const voteMutate = vi.fn();
vi.mock("@/modules/dogs/core/handlers/useVoteImage", () => ({
  useVoteImage: () => ({ mutate: voteMutate }),
}));

const { BreedDetailPage } = await import("./BreedDetailPage");

const breed: BreedDetails = {
  id: "1",
  name: "Affenpinscher",
  temperament: ["Confident", "alert", "playful"],
  origin: "Germany",
  lifeSpan: "12-15",
  breedGroup: "Toy",
  bredFor: "Ratting",
  description: null,
  history: null,
  weight: { imperial: "7-10", metric: "3.2-4.5" },
  height: { imperial: "9-11.5", metric: "23-29" },
  imageUrl: "https://cdn2.thedogapi.com/images/abc123.jpg",
  imageId: "abc123",
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/breads/1"]}>
      <Routes>
        <Route path="/breads/:breedId" element={<BreedDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("BreedDetailPage", () => {
  beforeEach(() => {
    navigateMock.mockClear();
    voteMutate.mockClear();
    useBreedDetailMock.mockReset();
  });

  it("shows a loading message while the breed is loading", () => {
    useBreedDetailMock.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    renderPage();

    expect(screen.getByText("Loading breed…")).toBeInTheDocument();
  });

  it("shows an error message when the fetch fails", () => {
    useBreedDetailMock.mockReturnValue({ data: undefined, isLoading: false, isError: true });

    renderPage();

    expect(screen.getByText("Could not load this breed.")).toBeInTheDocument();
  });

  it("renders every field once the breed loads", () => {
    useBreedDetailMock.mockReturnValue({ data: breed, isLoading: false, isError: false });

    renderPage();

    expect(screen.getByText("Breed Name")).toBeInTheDocument();
    expect(screen.getByText("Affenpinscher")).toBeInTheDocument();
    expect(screen.getByText("Bred For")).toBeInTheDocument();
    expect(screen.getByText("Ratting")).toBeInTheDocument();
    expect(screen.getByText("Breed Group")).toBeInTheDocument();
    expect(screen.getByText("Toy")).toBeInTheDocument();
    expect(screen.getByText("Temperament")).toBeInTheDocument();
    expect(screen.getByText("Confident, alert, playful")).toBeInTheDocument();
    expect(screen.getByText("Life Span")).toBeInTheDocument();
    expect(screen.getByText("12-15")).toBeInTheDocument();
  });

  it("falls back to an em dash for missing fields", () => {
    useBreedDetailMock.mockReturnValue({
      data: { ...breed, bredFor: null, breedGroup: null },
      isLoading: false,
      isError: false,
    });

    renderPage();

    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(2);
  });

  it("votes like (1) and navigates back when Like is clicked", async () => {
    useBreedDetailMock.mockReturnValue({ data: breed, isLoading: false, isError: false });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Like Affenpinscher" }));

    expect(voteMutate).toHaveBeenCalledWith({ imageId: "abc123", value: 1 });
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it("votes dislike (-1) and navigates back when Dislike is clicked", async () => {
    useBreedDetailMock.mockReturnValue({ data: breed, isLoading: false, isError: false });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Dislike Affenpinscher" }));

    expect(voteMutate).toHaveBeenCalledWith({ imageId: "abc123", value: -1 });
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it("navigates back without voting when the breed has no image id", async () => {
    useBreedDetailMock.mockReturnValue({
      data: { ...breed, imageId: null },
      isLoading: false,
      isError: false,
    });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Like Affenpinscher" }));

    expect(voteMutate).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it("navigates back when the back button is clicked", async () => {
    useBreedDetailMock.mockReturnValue({ data: breed, isLoading: false, isError: false });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
