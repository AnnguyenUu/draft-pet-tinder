import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { withQueryClient } from "@/test/test-utils";

const voteImage = vi.fn();
vi.mock("@/modules/dogs/repository/dogs.repository", () => ({
  voteImage: (...args: unknown[]) => voteImage(...args),
}));

const { useVoteImage } = await import("./useVoteImage");

describe("useVoteImage", () => {
  beforeEach(() => {
    voteImage.mockReset();
  });

  it("calls voteImage with the image id and a like value", async () => {
    voteImage.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useVoteImage(), { wrapper: withQueryClient() });

    act(() => {
      result.current.mutate({ imageId: "abc123", value: 1 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(voteImage).toHaveBeenCalledWith("abc123", 1);
  });

  it("calls voteImage with a dislike value", async () => {
    voteImage.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useVoteImage(), { wrapper: withQueryClient() });

    act(() => {
      result.current.mutate({ imageId: "abc123", value: -1 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(voteImage).toHaveBeenCalledWith("abc123", -1);
  });

  it("surfaces an error state when the vote fails", async () => {
    voteImage.mockRejectedValueOnce(new Error("rate limited"));
    const { result } = renderHook(() => useVoteImage(), { wrapper: withQueryClient() });

    act(() => {
      result.current.mutate({ imageId: "abc123", value: 1 });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
