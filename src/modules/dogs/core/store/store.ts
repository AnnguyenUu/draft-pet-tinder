import { context } from "@packages/react-kit/src/context";
import { DOGS } from "../../configuration/constants";
import { useBreedList } from "../handlers/useBreedList";

const useBreeds = () => {
  const query = useBreedList()
  return {
    query,
  }
}

export const [BreedsProvider, useBreedsContext] = context(
  DOGS,
  useBreeds
);