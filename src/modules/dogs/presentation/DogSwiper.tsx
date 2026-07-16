import { useRef, useState } from "react";
import TinderCard from "react-tinder-card";
import type { BreedDetails } from "@/types/dog";
import { BreedCard } from "@/modules/dogs/presentation/BreedCard";
import { LikeIcon, PassIcon } from "@/modules/dogs/presentation/icons";

interface TinderCardApi {
  swipe(direction?: "left" | "right" | "up" | "down"): Promise<void>;
  restoreCard(): Promise<void>;
}

interface DogSwiperProps {
  breeds: BreedDetails[];
}

const SWIPE_THRESHOLD = 100;
// Keep this many upcoming breeds pre-mounted (hidden, non-interactive)
// behind the active card. react-tinder-card attaches its drag listeners in
// a layout effect scoped to each mounted instance, so remounting a single
// card via `key` on every swipe leaves a split-second gap where a new drag
// can start after the old instance's listeners are torn down but before
// the new one's are attached — the gesture just silently vanishes. Keeping
// the next cards mounted (just invisible) the whole time means "advancing"
// is only ever a class-name flip on an already-ready component, so that
// gap never exists.
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
            <BreedCard breed={breed} />
          </TinderCard>
        ))}
      </div>
      <div className="breed-swiper__controls">
        <button
          type="button"
          className="breed-swiper__action breed-swiper__action--pass"
          onClick={() => triggerSwipe("left")}
          disabled={atEnd}
          aria-label={`Pass on ${current.name}`}
        >
          <PassIcon />
        </button>
        <button
          type="button"
          className="breed-swiper__action breed-swiper__action--like"
          onClick={() => triggerSwipe("right")}
          disabled={atEnd}
          aria-label={`Like ${current.name}`}
        >
          <LikeIcon />
        </button>
      </div>
    </div>
  );
}
