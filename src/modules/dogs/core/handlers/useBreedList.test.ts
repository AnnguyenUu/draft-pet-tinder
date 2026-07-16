import { waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BreedDetails } from "@/types/dog";
import { createTestQueryClient, withQueryClient } from "@/test/test-utils";
import { DOGS_QUERY_KEYS } from "@/modules/dogs/configuration/constants";

const fetchBreedList = vi.fn();
vi.mock("@/modules/dogs/repository/dogs.repository", () => ({
  fetchBreedList: (...args: unknown[]) => fetchBreedList(...args),
}));

const { useBreedList } = await import("./useBreedList");

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
    imageId: null,
  },
];

describe("useBreedList", () => {
  beforeEach(() => {
    fetchBreedList.mockReset();
  });

  it("resolves the breed list via fetchBreedList", async () => {
    fetchBreedList.mockResolvedValueOnce(breeds);

    const { result } = renderHook(() => useBreedList(), { wrapper: withQueryClient() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(breeds);
  });

  it("caches the result under the shared breedList query key", async () => {
    fetchBreedList.mockResolvedValueOnce(breeds);
    const client = createTestQueryClient();

    const { result } = renderHook(() => useBreedList(), { wrapper: withQueryClient(client) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.getQueryData(DOGS_QUERY_KEYS.breedList)).toEqual(breeds);
  });

  it("surfaces an error state when the fetch rejects", async () => {
    fetchBreedList.mockRejectedValueOnce(new Error("network down"));

    const { result } = renderHook(() => useBreedList(), { wrapper: withQueryClient() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
