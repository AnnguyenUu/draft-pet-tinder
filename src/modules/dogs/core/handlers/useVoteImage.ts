import { useMutation } from "@tanstack/react-query";

import { voteImage } from "@/modules/dogs/repository/dogs.repository";

export function useVoteImage() {
  return useMutation({
    mutationFn: ({ imageId, value }: { imageId: string; value: 1 | -1 }) =>
      voteImage(imageId, value),
  });
}
