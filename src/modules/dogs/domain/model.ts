import type { BreedDetails } from "@/types/dog";

export interface TinderCardApi {
  swipe(direction?: "left" | "right" | "up" | "down"): Promise<void>;
  restoreCard(): Promise<void>;
}

export interface DogSwiperProps {
  breeds: BreedDetails[];
}

export type BreadBulkAction = 1 | -1

export const BreadAction = {
  Like: 1,
  Dislike: -1
} as const

export type SwipeDirection = "left" | "right"

export const SwipeDirectionMapping = {
  LEFT: "left",
  RIGHT: "right"
} as const