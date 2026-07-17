import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BreedDetails } from "@/types/dog";
import { withQueryClient } from "@/test/test-utils";

const fetchBreedById = vi.fn();
vi.mock("@/modules/dogs/repository/dogs.repository", () => ({
  fetchBreedById: (...args: unknown[]) => fetchBreedById(...args),
}));

const { useBreedDetail } = await import("./useBreedDetail");

const breed: BreedDetails = {
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
  imageId: null,
};

describe("useBreedDetail", () => {
  beforeEach(() => {
    fetchBreedById.mockReset();
  });

  it("fetches the breed by id when an id is given", async () => {
    fetchBreedById.mockResolvedValueOnce(breed);

    const { result } = renderHook(() => useBreedDetail("1"), { wrapper: withQueryClient() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchBreedById).toHaveBeenCalledWith("1");
    expect(result.current.data).toEqual(breed);
  });

  it("does not fetch when the id is undefined", () => {
    renderHook(() => useBreedDetail(undefined), { wrapper: withQueryClient() });

    expect(fetchBreedById).not.toHaveBeenCalled();
  });

  it("surfaces an error state when the fetch rejects", async () => {
    fetchBreedById.mockRejectedValueOnce(new Error("not found"));

    const { result } = renderHook(() => useBreedDetail("missing"), {
      wrapper: withQueryClient(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
