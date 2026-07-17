import TinderCard from "react-tinder-card";
import { BreedCard } from "@/modules/dogs/presentation/BreedCard";
import { SWIPE_THRESHOLD } from "../configuration/constants";
import { useSwiper } from "../core/handlers/useSwiper";
import { useBreedsContext } from "../core/store/dog.store";
import { useDebounceCallback } from "@hooks/useDebounceCallback";
import { SwipeDirectionMapping, type DogSwiperProps, type SwipeDirection } from "../domain/model";

export function DogSwiper({ breeds }: DogSwiperProps) {
  const context = useBreedsContext();

  const swiper = useSwiper(breeds);
  const debounceOnchange = useDebounceCallback(context.onChangeDirection, 200);

  const onChangeDirection = (direction: SwipeDirection) => {
    swiper.handleSwipe();

    debounceOnchange(direction, swiper?.current.imageId, swiper?.current.name);
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
                onPass: () => swiper?.triggerSwipe(SwipeDirectionMapping.LEFT),
                onLike: () => swiper?.triggerSwipe(SwipeDirectionMapping.RIGHT),
              })}
            />
          </TinderCard>
        ))}
      </div>
    </div>
  );
}
