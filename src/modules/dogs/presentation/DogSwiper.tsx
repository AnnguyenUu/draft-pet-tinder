import { useRef, useState } from "react";
import TinderCard from "react-tinder-card";
import type { BreedDetails } from "@/types/dog";
import { BreedCard } from "@/modules/dogs/presentation/BreedCard";

interface TinderCardApi {
  swipe(direction?: "left" | "right" | "up" | "down"): Promise<void>;
  restoreCard(): Promise<void>;
}

interface DogSwiperProps {
  breeds: BreedDetails[];
}

const SWIPE_THRESHOLD = 100;
const WINDOW_AHEAD = 2;

export function DogSwiper({ breeds }: DogSwiperProps) {
  const [index, setIndex] = useState(0);
  const activeCardRef = useRef<TinderCardApi | null>(null);

  const current = breeds[index];
  const atEnd = index >= breeds.length - 1;
  const windowed = breeds.slice(index, index + 1 + WINDOW_AHEAD);

  function handleSwipe() {
    setIndex((i) => Math.min(i + 1, breeds.length - 1));
  }

  function triggerSwipe(direction: "left" | "right") {
    if (atEnd) return;
    activeCardRef.current?.swipe(direction);
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
        {windowed.map((breed, i) => (
          <TinderCard
            key={breed.id}
            ref={i === 0 ? activeCardRef : undefined}
            className={`breed-swiper__card ${i === 0 ? "breed-swiper__card--active" : "breed-swiper__card--hidden"}`}
            preventSwipe={["up", "down"]}
            swipeRequirementType="position"
            swipeThreshold={SWIPE_THRESHOLD}
            onSwipe={i === 0 ? handleSwipe : undefined}
          >
            <BreedCard
              breed={breed}
              onPass={i === 0 ? () => triggerSwipe("left") : undefined}
              onLike={i === 0 ? () => triggerSwipe("right") : undefined}
              disabled={atEnd}
            />
          </TinderCard>
        ))}
      </div>
    </div>
  );
}
