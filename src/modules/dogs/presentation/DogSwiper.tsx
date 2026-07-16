import { useRef, useState } from "react";
import TinderCard from "react-tinder-card";
import type { BreedDetails } from "@/types/dog";
import { BreedCard } from "@/modules/dogs/presentation/BreedCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@/modules/dogs/presentation/icons";

interface TinderCardApi {
  swipe(direction?: "left" | "right" | "up" | "down"): Promise<void>;
  restoreCard(): Promise<void>;
}

interface DogSwiperProps {
  breeds: BreedDetails[];
}

const SWIPE_THRESHOLD = 100;

export function DogSwiper({ breeds }: DogSwiperProps) {
  const [index, setIndex] = useState(0);
  const cardRef = useRef<TinderCardApi | null>(null);

  const current = breeds[index];
  const atEnd = index >= breeds.length - 1;

  function handleSwipe() {
    setIndex((i) => Math.min(i + 1, breeds.length - 1));
  }

  function triggerSwipe(direction: "left" | "right") {
    if (atEnd) return;
    cardRef.current?.swipe(direction);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") triggerSwipe("right");
    if (event.key === "ArrowLeft") triggerSwipe("left");
  }

  return (
    <div className="breed-swiper">
      <div
        className="breed-swiper__deck"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={`Dog breeds, showing ${index + 1} of ${breeds.length}: ${current.name}`}
        onKeyDown={handleKeyDown}
      >
        <TinderCard
          key={current.id}
          ref={cardRef}
          className="breed-swiper__card"
          preventSwipe={["up", "down"]}
          swipeRequirementType="position"
          swipeThreshold={SWIPE_THRESHOLD}
          onSwipe={handleSwipe}
        >
          <BreedCard breed={current} />
        </TinderCard>
      </div>

      <div className="breed-swiper__controls">
        <button
          type="button"
          className="breed-swiper__nav"
          onClick={() => triggerSwipe("left")}
          disabled={atEnd}
          aria-label="Skip breed (swipe left)"
        >
          <ChevronLeftIcon />
        </button>
        <span className="breed-swiper__counter">
          {index + 1} / {breeds.length}
        </span>
        <button
          type="button"
          className="breed-swiper__nav"
          onClick={() => triggerSwipe("right")}
          disabled={atEnd}
          aria-label="Next breed (swipe right)"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}
