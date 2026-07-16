import { z } from "zod";

// Matches TheDogAPI's response shape for GET /v1/breeds
// (https://developers.thedogapi.com/view-account/heztjqzS0Ge1Cg9dNJ7Rw?report=W1lQ2eBn-).
const measurementSchema = z.object({
  imperial: z.string(),
  metric: z.string(),
});

export const breedSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  temperament: z.string().nullable().optional(),
  origin: z.string().nullable().optional(),
  life_span: z.string().nullable().optional(),
  breed_group: z.string().nullable().optional(),
  bred_for: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  history: z.string().nullable().optional(),
  weight: measurementSchema.optional(),
  height: measurementSchema.optional(),
  image: z.object({ url: z.string().url() }).optional(),
});

export const breedListResponseSchema = z.array(breedSchema);

// Matches the Dog CEO API's response shape (https://dog.ceo/dog-api/documentation).
export const breedImagesResponseSchema = z.object({
  message: z.array(z.string().url()),
  status: z.literal("success"),
});

export type BreedListResponse = z.infer<typeof breedListResponseSchema>;
export type BreedImagesResponse = z.infer<typeof breedImagesResponseSchema>;
