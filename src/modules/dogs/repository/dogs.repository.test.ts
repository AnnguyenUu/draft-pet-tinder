import { beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
const builder = {
  withMethod: vi.fn().mockReturnThis(),
  withData: vi.fn().mockReturnThis(),
  send,
};
const createRequest = vi.fn((_url: string) => builder);

vi.mock("@/shared/api/request-builder", () => ({
  createRequest: (url: string) => createRequest(url),
}));

const { fetchBreedById, fetchBreedList, voteImage } = await import("./dogs.repository");

const rawAffenpinscher = {
  id: 1,
  name: "Affenpinscher",
  temperament: "Confident, alert, playful",
  origin: "Germany",
  life_span: "12-15",
  breed_group: "Toy",
  bred_for: null,
  description: "A small breed",
  history: "Long history",
  weight: { imperial: "7-10", metric: "3.2-4.5" },
  height: { imperial: "9-11.5", metric: "23-29" },
  image: { id: "abc123", url: "https://cdn2.thedogapi.com/images/abc123.jpg" },
};

const rawAfghanHound = {
  id: 2,
  name: "Afghan Hound",
  origin: "Afghanistan",
};

describe("dogs.repository", () => {
  beforeEach(() => {
    send.mockReset();
    createRequest.mockClear();
    builder.withMethod.mockClear();
    builder.withData.mockClear();
  });

  describe("fetchBreedList", () => {
    it("maps the API's snake_case shape into BreedDetails", async () => {
      send.mockResolvedValueOnce([rawAffenpinscher]);

      const [breed] = await fetchBreedList();

      expect(breed).toEqual({
        id: "1",
        name: "Affenpinscher",
        temperament: ["Confident", "alert", "playful"],
        origin: "Germany",
        lifeSpan: "12-15",
        breedGroup: "Toy",
        bredFor: null,
        description: "A small breed",
        history: "Long history",
        weight: { imperial: "7-10", metric: "3.2-4.5" },
        height: { imperial: "9-11.5", metric: "23-29" },
        imageUrl: "https://cdn2.thedogapi.com/images/abc123.jpg",
        imageId: "abc123",
      });
    });

    it("defaults missing optional fields to null/empty", async () => {
      send.mockResolvedValueOnce([rawAfghanHound]);

      const [breed] = await fetchBreedList();

      expect(breed.temperament).toEqual([]);
      expect(breed.breedGroup).toBeNull();
      expect(breed.imageUrl).toBeNull();
      expect(breed.imageId).toBeNull();
    });

    it("sorts breeds alphabetically by name", async () => {
      send.mockResolvedValueOnce([rawAfghanHound, rawAffenpinscher]);

      const breeds = await fetchBreedList();

      expect(breeds.map((breed) => breed.name)).toEqual(["Affenpinscher", "Afghan Hound"]);
    });

    it("requests GET /v1/breeds", async () => {
      send.mockResolvedValueOnce([]);

      await fetchBreedList();

      expect(createRequest).toHaveBeenCalledWith("/v1/breeds");
      expect(builder.withMethod).toHaveBeenCalledWith("get");
    });

    it("rejects when the response doesn't match the expected shape", async () => {
      send.mockResolvedValueOnce([{ id: 1 /* missing required `name` */ }]);

      await expect(fetchBreedList()).rejects.toThrow();
    });
  });

  describe("fetchBreedById", () => {
    it("requests the breed by id and maps the result", async () => {
      send.mockResolvedValueOnce(rawAffenpinscher);

      const breed = await fetchBreedById("1");

      expect(createRequest).toHaveBeenCalledWith("/v1/breeds/1");
      expect(breed.name).toBe("Affenpinscher");
      expect(breed.imageId).toBe("abc123");
    });
  });

  describe("voteImage", () => {
    it("posts the image id and value to /v1/votes", async () => {
      send.mockResolvedValueOnce({ id: 1, image_id: "abc123", value: 1 });

      await voteImage("abc123", 1);

      expect(createRequest).toHaveBeenCalledWith("/v1/votes");
      expect(builder.withMethod).toHaveBeenCalledWith("post");
      expect(builder.withData).toHaveBeenCalledWith({ image_id: "abc123", value: 1 });
    });

    it("rejects when the vote response doesn't match the expected shape", async () => {
      send.mockResolvedValueOnce({ unexpected: true });

      await expect(voteImage("abc123", -1)).rejects.toThrow();
    });
  });
});
