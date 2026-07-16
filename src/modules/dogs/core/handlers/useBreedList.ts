import { useQuery } from "@tanstack/react-query";

import { DOGS_QUERY_KEYS } from "@/modules/dogs/configuration/constants";
import { fetchBreedList } from "@/modules/dogs/repository/dogs.repository";

export function useBreedList() {
  return useQuery({
    queryKey: DOGS_QUERY_KEYS.breedList,
    queryFn: fetchBreedList,
    staleTime: 1000 * 60 * 60,
  });
}
