import { createRequest } from "@/shared/api/request-builder";
import {
  breedImagesResponseSchema,
  breedListResponseSchema,
} from "@/shared/server-constract/dogs.contract";
import type { Breed, BreedDetails } from "@/types/dog";

export async function fetchBreedList(): Promise<BreedDetails[]> {
  const data = await createRequest("/v1/breeds").withMethod("get").send();
  const parsed = breedListResponseSchema.parse(data);
  return parsed
    .map((breed) => ({
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
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchBreedImages(breed: string): Promise<Breed[]> {
  const data = await createRequest(`/dogs/breeds/${breed}/images`).withMethod("get").send();
  const parsed = breedImagesResponseSchema.parse(data);
  return parsed.message.map((imageUrl) => ({ name: breed, imageUrl }));
}
