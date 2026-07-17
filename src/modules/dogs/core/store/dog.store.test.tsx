import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BreedDetails } from "@/types/dog";
import { withQueryClient } from "@/test/test-utils";

const fetchBreedList = vi.fn();
const voteImage = vi.fn();
vi.mock("@/modules/dogs/repository/dogs.repository", () => ({
  fetchBreedList: (...args: unknown[]) => fetchBreedList(...args),
  voteImage: (...args: unknown[]) => voteImage(...args),
}));

const { BreedsProvider, useBreedsContext } = await import("./dog.store");

const breeds: BreedDetails[] = [
  {
    id: "1",
    name: "Affenpinscher",
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
    imageId: "img1",
  },
];

function renderStore() {
  const QueryWrapper = withQueryClient();
  return renderHook(() => useBreedsContext(), {
    wrapper: ({ children }) => (
      <QueryWrapper>
        <BreedsProvider>{children}</BreedsProvider>
      </QueryWrapper>
    ),
  });
}

describe("dog.store", () => {
  beforeEach(() => {
    fetchBreedList.mockReset();
    voteImage.mockReset();
  });

  it("exposes the breed list query's data once it resolves", async () => {
    fetchBreedList.mockResolvedValueOnce(breeds);

    const { result } = renderStore();

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.query.data).toEqual(breeds);
  });

  it("votes 1 (like) when swiping right", async () => {
    fetchBreedList.mockResolvedValueOnce(breeds);
    voteImage.mockResolvedValueOnce(undefined);
    const { result } = renderStore();
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    act(() => {
      result.current.onChangeDirection("right", "img1");
    });

    await waitFor(() => expect(voteImage).toHaveBeenCalledWith("img1", 1));
  });

  it("votes -1 (dislike) when swiping left", async () => {
    fetchBreedList.mockResolvedValueOnce(breeds);
    voteImage.mockResolvedValueOnce(undefined);
    const { result } = renderStore();
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    act(() => {
      result.current.onChangeDirection("left", "img1");
    });

    await waitFor(() => expect(voteImage).toHaveBeenCalledWith("img1", -1));
  });

  it("does not vote when there is no image id", async () => {
    fetchBreedList.mockResolvedValueOnce(breeds);
    const { result } = renderStore();
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    act(() => {
      result.current.onChangeDirection("right", "");
    });

    expect(voteImage).not.toHaveBeenCalled();
  });
});
