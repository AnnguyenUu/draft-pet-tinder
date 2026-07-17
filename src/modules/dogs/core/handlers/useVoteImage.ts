import { useMutation } from "@tanstack/react-query";
import { voteImage } from "@/modules/dogs/repository/dogs.repository";
import type { BreadBulkAction } from "../../domain/model";

export function useVoteImage() {
  return useMutation({
    mutationFn: ({ imageId, value }: { imageId: string; value: BreadBulkAction }) =>
      voteImage(imageId, value),
  });
}
