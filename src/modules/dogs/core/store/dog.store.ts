import { context } from "@packages/react-kit/src/context";
import { DOGS } from "../../configuration/constants";
import { useBreedList } from "../handlers/useBreedList";
import { useVoteForBreed } from "../handlers/useVoteForBreed";

const useBreeds = () => {
  const query = useBreedList();
  const { onChangeDirection } = useVoteForBreed();

  return {
    query,
    onChangeDirection,
  };
};

export const [BreedsProvider, useBreedsContext] = context(DOGS, useBreeds);
