import { useQuery } from "@tanstack/react-query";

import { DOGS_QUERY_KEYS } from "@/modules/dogs/configuration/constants";
import { fetchBreedImages } from "@/modules/dogs/repository/dogs.repository";

export function useBreedImages(breed: string | null) {
  return useQuery({
    queryKey: DOGS_QUERY_KEYS.breedImages(breed ?? ""),
    queryFn: () => fetchBreedImages(breed as string),
    enabled: breed !== null,
  });
}
