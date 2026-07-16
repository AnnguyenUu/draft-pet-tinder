import { context } from "@packages/react-kit/src/context";
import { DOGS } from "../../configuration/constants";
import { useBreedList } from "../handlers/useBreedList";
import { useVoteImage } from "../handlers/useVoteImage";

const useBreeds = () => {
  const query = useBreedList()
  const vote = useVoteImage()
  return {
    query,
    vote
  }
}

export const [BreedsProvider, useBreedsContext] = context(
  DOGS,
  useBreeds
);