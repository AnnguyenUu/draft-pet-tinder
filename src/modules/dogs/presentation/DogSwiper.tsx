import TinderCard from "react-tinder-card";
import type { BreedDetails } from "@/types/dog";
import { BreedCard } from "@/modules/dogs/presentation/BreedCard";
import { SWIPE_THRESHOLD } from "../configuration/constants";
import { useSwiper } from "../core/handlers/useSwiper";
import { useBreedsContext } from "../core/store/store";

interface DogSwiperProps {
  breeds: BreedDetails[];
}

export function DogSwiper({ breeds }: DogSwiperProps) {

  const context = useBreedsContext();
  
  const {
    index,
    atEnd,
    current,
    windowed,
    activeCardRef,
    handleKeyDown,
    handleSwipe,
    triggerSwipe,
  } = useSwiper(breeds);

  const onChangeDirection = (direction: "left" | "right") => {
    if ((direction === "left" || direction === "right") && current.imageId) {
      context.vote.mutate({
        imageId: current.imageId,
        value: direction === "right" ? 1 : -1,
      });
    }
    handleSwipe(direction);
  };

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
            {...(i === 0 && {
              onSwipe: onChangeDirection,
            })}
          >
            <BreedCard
              breed={breed}
              disabled={atEnd}
              {...(i === 0 && {
                onPass: () => triggerSwipe("left"),
                onLike: () => triggerSwipe("right"),
              })}
            />
          </TinderCard>
        ))}
      </div>
    </div>
  );
}
