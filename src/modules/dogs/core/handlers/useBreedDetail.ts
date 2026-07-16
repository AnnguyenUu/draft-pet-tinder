import { useQuery } from "@tanstack/react-query";

import { DOGS_QUERY_KEYS } from "@/modules/dogs/configuration/constants";
import { fetchBreedById } from "@/modules/dogs/repository/dogs.repository";

export function useBreedDetail(breedId: string | undefined) {
  return useQuery({
    queryKey: DOGS_QUERY_KEYS.breedDetail(breedId ?? ""),
    queryFn: () => fetchBreedById(breedId as string),
    enabled: breedId !== undefined,
  });
}
