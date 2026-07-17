import { createRequest } from "@/shared/api/request-builder";
import {
  breedListResponseSchema,
  breedSchema,
  voteResponseSchema,
} from "@/shared/server-constract/dogs.contract";
import type { BreedDetails } from "@/types/dog";
import type { z } from "zod";

function mapBreed(breed: z.infer<typeof breedSchema>): BreedDetails {
  return {
    id: String(breed.id),
    name: breed.name,
    temperament: breed.temperament?.split(",").map((trait) => trait.trim()) ?? [],
    origin: breed.origin ?? null,
    lifeSpan: breed.life_span ?? null,
    breedGroup: breed.breed_group ?? null,
    bredFor: breed.bred_for ?? null,
    description: breed.description ?? null,
    history: breed.history ?? null,
    weight: breed.weight ?? null,
    height: breed.height ?? null,
    imageUrl: breed.image?.url ?? null,
    imageId: breed.image?.id ?? null,
  };
}

export async function fetchBreedList(): Promise<BreedDetails[]> {
  const data = await createRequest("/v1/breeds").withMethod("get").send();
  const parsed = breedListResponseSchema.parse(data);
  return parsed.map(mapBreed).sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchBreedById(id: string): Promise<BreedDetails> {
  const data = await createRequest(`/v1/breeds/${id}`).withMethod("get").send();
  const parsed = breedSchema.parse(data);
  return mapBreed(parsed);
}

export async function voteImage(imageId: string, value: 1 | -1): Promise<void> {
  const data = await createRequest("/v1/votes")
    .withMethod("post")
    .withData({ image_id: imageId, value })
    .send();
  voteResponseSchema.parse(data);
}
