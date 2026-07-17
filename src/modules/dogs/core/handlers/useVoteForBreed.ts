import { toast } from "react-toastify";
import { useVoteImage } from "./useVoteImage";
import { BreadAction, SwipeDirectionMapping, type SwipeDirection } from "../../domain/model";

const bulkFacade = {
  [SwipeDirectionMapping.LEFT]: BreadAction.Dislike,
  [SwipeDirectionMapping.RIGHT]: BreadAction.Like,
};

const notifyFacade = {
  [SwipeDirectionMapping.LEFT]: {
    type: "info",
    messageTemplate: `You disliked`,
  },
  [SwipeDirectionMapping.RIGHT]: {
    type: "success",
    messageTemplate: `You liked`,
  },
} satisfies Record<SwipeDirection, { type: "info" | "success"; messageTemplate: string }>;

export const useVoteForBreed = () => {
  const { mutate } = useVoteImage();

  const vote = ({
    imageId,
    direction,
    label = "this breed"
  }: {
    imageId: string, direction: SwipeDirection
    label?: string
  }) => {
    mutate(
      {
        imageId: imageId,
        value: bulkFacade[direction],
      },
      {
        onSuccess: () => {
          toast[notifyFacade[direction].type](
            `${notifyFacade[direction].messageTemplate} ${label}.`,
          );
        },
        onError: () => {
          toast.error(
            `Couldn't save your vote for ${label}. Please try again.`,
          );
        },
      },
    );
  };

  const onChangeDirection = (
    direction: SwipeDirection,
    imageId: string,
    breedName?: string,
  ) => {
    if (
      [SwipeDirectionMapping.RIGHT, SwipeDirectionMapping.LEFT].includes(
        direction,
      ) &&
      imageId
    ) {
      const label = breedName ?? "this breed";

      vote({
        imageId,
        direction,
        label
      })
    }
  };

  return {
    vote,
    onChangeDirection
  }
};
