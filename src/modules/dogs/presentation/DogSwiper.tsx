import TinderCard from "react-tinder-card";
import type { BreedDetails } from "@/types/dog";
import { BreedCard } from "@/modules/dogs/presentation/BreedCard";
import { SWIPE_THRESHOLD } from "../configuration/constants";
import { useSwiper } from "../core/handlers/useSwiper";
import { useBreedsContext } from "../core/store/dog.store";

interface DogSwiperProps {
  breeds: BreedDetails[];
}

export function DogSwiper({ breeds }: DogSwiperProps) {

  const context = useBreedsContext();

  const swiper = useSwiper(breeds);

  const onChangeDirection = (direction: "left" | "right") => {
    context.onChangeDirection(direction, swiper?.current.imageId)
    swiper.handleSwipe();
  };

  return (
    <div className="breed-swiper">
      <div
        className="breed-swiper__deck"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={`Dog breeds, showing ${swiper?.index + 1} of ${breeds.length}: ${swiper?.current?.name}`}
        onKeyDown={swiper?.handleKeyDown}
      >
        {(swiper?.windowed || []).map((breed, i) => (
          <TinderCard
            key={breed.id}
            ref={i === 0 ? swiper?.activeCardRef : undefined}
            className={`breed-swiper__card ${i === 0 ? "breed-swiper__card--active" : "breed-swiper__card--hidden"}`}
            preventSwipe={["up", "down"]}
            swipeRequirementType="position"
            swipeThreshold={SWIPE_THRESHOLD}
            {...(i === 0 && {
              onSwipe: onChangeDirection,
            })}
          >
            <BreedCard
              breed={breed}
              disabled={swiper?.atEnd}
              {...(i === 0 && {
                onPass: () => swiper?.triggerSwipe("left"),
                onLike: () => swiper?.triggerSwipe("right"),
              })}
            />
          </TinderCard>
        ))}
      </div>
    </div>
  );
}
