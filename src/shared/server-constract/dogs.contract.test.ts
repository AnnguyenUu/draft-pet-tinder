import { describe, expect, it } from "vitest";

import {
  breedImagesResponseSchema,
  breedListResponseSchema,
  breedSchema,
  voteResponseSchema,
} from "./dogs.contract";

describe("breedSchema", () => {
  it("accepts a fully-populated breed", () => {
    const result = breedSchema.safeParse({
      id: 1,
      name: "Affenpinscher",
      temperament: "Confident, alert",
      origin: "Germany",
      life_span: "12-15",
      breed_group: "Toy",
      bred_for: null,
      description: "desc",
      history: "history",
      weight: { imperial: "7-10", metric: "3-4" },
      height: { imperial: "9-11", metric: "23-28" },
      image: { id: "abc123", url: "https://cdn2.thedogapi.com/images/abc123.jpg" },
    });

    expect(result.success).toBe(true);
  });

  it("accepts a breed with only the required fields", () => {
    const result = breedSchema.safeParse({ id: "2", name: "Aidi" });

    expect(result.success).toBe(true);
  });

  it("accepts a numeric or string id", () => {
    expect(breedSchema.safeParse({ id: 1, name: "A" }).success).toBe(true);
    expect(breedSchema.safeParse({ id: "1", name: "A" }).success).toBe(true);
  });

  it("rejects a breed missing the required name field", () => {
    const result = breedSchema.safeParse({ id: 1 });

    expect(result.success).toBe(false);
  });

  it("rejects an image without an id (older API shape)", () => {
    const result = breedSchema.safeParse({
      id: 1,
      name: "Affenpinscher",
      image: { url: "https://cdn2.thedogapi.com/images/abc123.jpg" },
    });

    expect(result.success).toBe(false);
  });

  it("rejects a non-URL image url", () => {
    const result = breedSchema.safeParse({
      id: 1,
      name: "Affenpinscher",
      image: { id: "abc123", url: "not-a-url" },
    });

    expect(result.success).toBe(false);
  });
});

describe("breedListResponseSchema", () => {
  it("accepts an array of breeds", () => {
    const result = breedListResponseSchema.safeParse([{ id: 1, name: "Affenpinscher" }]);

    expect(result.success).toBe(true);
  });

  it("rejects a non-array payload", () => {
    const result = breedListResponseSchema.safeParse({ id: 1, name: "Affenpinscher" });

    expect(result.success).toBe(false);
  });
});

describe("breedImagesResponseSchema", () => {
  it("accepts the Dog CEO success envelope", () => {
    const result = breedImagesResponseSchema.safeParse({
      message: ["https://images.dog.ceo/breeds/affenpinscher/1.jpg"],
      status: "success",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a non-success status", () => {
    const result = breedImagesResponseSchema.safeParse({
      message: [],
      status: "error",
    });

    expect(result.success).toBe(false);
  });
});

describe("voteResponseSchema", () => {
  it("accepts a well-formed vote response", () => {
    const result = voteResponseSchema.safeParse({
      id: 12345,
      image_id: "abc123",
      value: 1,
      sub_id: null,
      created_at: "2026-07-17T00:00:00.000Z",
      country_code: "VN",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a response missing image_id", () => {
    const result = voteResponseSchema.safeParse({ id: 1, value: 1 });

    expect(result.success).toBe(false);
  });
});
