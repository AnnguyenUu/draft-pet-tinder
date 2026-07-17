import { context } from "@packages/react-kit/src/context";
import { DOGS } from "../../configuration/constants";
import { useBreedList } from "../handlers/useBreedList";
import { useVoteImage } from "../handlers/useVoteImage";

const useBreeds = () => {
  const query = useBreedList();
  const vote = useVoteImage();

  const onChangeDirection = (direction: "left" | "right", imageId: string) => {
    if ((direction === "left" || direction === "right") && imageId) {
      vote.mutate({
        imageId: imageId,
        value: direction === "right" ? 1 : -1,
      });
    }
  };
  return {
    query,
    vote,
    onChangeDirection,
  };
};

export const [BreedsProvider, useBreedsContext] = context(DOGS, useBreeds);
