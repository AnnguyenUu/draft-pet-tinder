import type { BreedDetails } from "@/types/dog";

export interface TinderCardApi {
  swipe(direction?: "left" | "right" | "up" | "down"): Promise<void>;
  restoreCard(): Promise<void>;
}

export interface DogSwiperProps {
  breeds: BreedDetails[];
}