import { useRef, useState } from "react";
import { SwipeDirectionMapping, type SwipeDirection, type TinderCardApi } from "../../domain/model";
import type { BreedDetails } from "@/types/dog";
import { LAST_BREED_ID_STORAGE_KEY, WINDOW_AHEAD } from "../../configuration/constants";
import { useLocalStorage } from "@packages/react-kit/src/useLocalStorage";

export function getInitialIndex(breeds: BreedDetails[], lastId: string | null): number {
  if (!lastId) return 0;

  const lastIndex = breeds.findIndex((breed) => breed.id === lastId);
  if (lastIndex === -1) return 0;

  return Math.min(lastIndex + 1, breeds.length - 1);
}

export const useSwiper = (breeds: BreedDetails[]) => {
  const [lastBreedId, setLastBreedId] = useLocalStorage<string | null>(
    LAST_BREED_ID_STORAGE_KEY,
    null,
  );
  const [index, setIndex] = useState(() => getInitialIndex(breeds, lastBreedId));

  const activeCardRef = useRef<TinderCardApi | null>(null);

  const current = breeds[index];
  const atEnd = index >= breeds.length - 1;
  const windowed = breeds.slice(index, index + 1 + WINDOW_AHEAD);

  const handleSwipe = () => {
    if (current) {
      setLastBreedId(current.id);
    }
    setIndex((i) => Math.min(i + 1, breeds.length - 1));
  }

  const triggerSwipe = (direction: SwipeDirection) => {
    if (atEnd) return;
    activeCardRef.current?.swipe(direction);
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") triggerSwipe(SwipeDirectionMapping.RIGHT);
    if (event.key === "ArrowLeft") triggerSwipe(SwipeDirectionMapping.LEFT);
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
