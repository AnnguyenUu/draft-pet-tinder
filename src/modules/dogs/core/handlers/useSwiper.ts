import { useRef, useState } from "react";
import type { TinderCardApi } from "../../domain/model";
import type { BreedDetails } from "@/types/dog";
import { WINDOW_AHEAD } from "../../configuration/constants";

export const useSwiper = (breeds: BreedDetails[]) => {
  const [index, setIndex] = useState(0);
  
  const activeCardRef = useRef<TinderCardApi | null>(null);

  const current = breeds[index];
  const atEnd = index >= breeds.length - 1;
  const windowed = breeds.slice(index, index + 1 + WINDOW_AHEAD);

  const handleSwipe = () => {
    setIndex((i) => Math.min(i + 1, breeds.length - 1));
  }

  const triggerSwipe = (direction: "left" | "right") => {
    if (atEnd) return;
    activeCardRef.current?.swipe(direction);
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") triggerSwipe("right");
    if (event.key === "ArrowLeft") triggerSwipe("left");
  }

  return {
    current,
    windowed,
    handleKeyDown,
    handleSwipe,
    index,
    activeCardRef,
    triggerSwipe,
    atEnd
  }
}