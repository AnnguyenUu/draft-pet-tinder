import { useRef, useState } from "react";

import type { BreedDetails } from "@/types/dog";
import { BreedCard } from "@/modules/dogs/presentation/BreedCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@/modules/dogs/presentation/icons";

interface BreedSwiperProps {
  breeds: BreedDetails[];
}

const SWIPE_THRESHOLD = 120;
const EXIT_DISTANCE = 600;
const EXIT_DURATION = 260;

export function DogSwiper({ breeds }: BreedSwiperProps) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const startX = useRef(0);

  const current = breeds[index];
  const upcoming = breeds[index + 1];

  console.log({
    current
  })

  function commitSwipe(direction: "left" | "right") {
    if (isAnimating) return;

    const canGoNext = direction === "right" && index < breeds.length - 1;
    const canGoPrev = direction === "left" && index > 0;
    if (!canGoNext && !canGoPrev) {
      setDragX(0);
      return;
    }

    setIsAnimating(true);
    setIsDragging(false);
    setDragX(direction === "right" ? EXIT_DISTANCE : -EXIT_DISTANCE);
    window.setTimeout(() => {
      setIndex((i) => (direction === "right" ? i + 1 : i - 1));
      setDragX(0);
      setIsAnimating(false);
    }, EXIT_DURATION);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (isAnimating) return;
    startX.current = event.clientX;
    setIsDragging(true);

    const handleMove = (moveEvent: PointerEvent) => {
      setDragX(moveEvent.clientX - startX.current);
    };

    const handleUp = (upEvent: PointerEvent) => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      setIsDragging(false);

      const dx = upEvent.clientX - startX.current;
      if (dx > SWIPE_THRESHOLD) commitSwipe("right");
      else if (dx < -SWIPE_THRESHOLD) commitSwipe("left");
      else setDragX(0);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") commitSwipe("right");
    if (event.key === "ArrowLeft") commitSwipe("left");
  }

  const rotation = Math.max(-15, Math.min(15, dragX / 18));

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
        {upcoming && (
          <div className="breed-swiper__card breed-swiper__card--behind">
            <BreedCard breed={upcoming} />
          </div>
        )}
        <div
          className="breed-swiper__card breed-swiper__card--active"
          style={{
            transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
            transition: isDragging ? "none" : `transform ${EXIT_DURATION}ms cubic-bezier(.2,.8,.2,1)`,
          }}
          onPointerDown={handlePointerDown}
        >
          <BreedCard breed={current} />
        </div>
      </div>

      <div className="breed-swiper__controls">
        <button
          type="button"
          className="breed-swiper__nav"
          onClick={() => commitSwipe("left")}
          disabled={isAnimating || index === 0}
          aria-label="Previous breed"
        >
          <ChevronLeftIcon />
        </button>
        <span className="breed-swiper__counter">
          {index + 1} / {breeds.length}
        </span>
        <button
          type="button"
          className="breed-swiper__nav"
          onClick={() => commitSwipe("right")}
          disabled={isAnimating || index === breeds.length - 1}
          aria-label="Next breed"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}
