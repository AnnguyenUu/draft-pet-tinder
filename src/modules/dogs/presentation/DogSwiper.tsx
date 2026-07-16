
import TinderCard from "react-tinder-card";
import type { BreedDetails } from "@/types/dog";
import { BreedCard } from "@/modules/dogs/presentation/BreedCard";
import { SWIPE_THRESHOLD } from "../configuration/constants";
import { useSwiper } from "../core/handlers/useSwiper";

interface DogSwiperProps {
  breeds: BreedDetails[];
}

export function DogSwiper({ breeds }: DogSwiperProps) {
  const {
    index,
    handleKeyDown,
    windowed,
    activeCardRef,
    handleSwipe,
    triggerSwipe,
    atEnd,
    current
  } = useSwiper(breeds)

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
