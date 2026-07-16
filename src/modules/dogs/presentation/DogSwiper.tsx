import { useRef, useState } from "react";

import type { BreedDetails } from "@/types/dog";
import { BreedCard } from "@/modules/dogs/presentation/BreedCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@/modules/dogs/presentation/icons";

interface DogSwiperProps {
  breeds: BreedDetails[];
}

const SWIPE_THRESHOLD = 100;
const EXIT_DISTANCE = 600;
const EXIT_DURATION = 240;

export function DogSwiper({ breeds }: DogSwiperProps) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const startX = useRef(0);

  const current = breeds[index];
  const atEnd = index >= breeds.length - 1;
  function advance(direction: "left" | "right") {
    if (isAnimating || atEnd) {
      setDragX(0);
      return;
    }

    setIsAnimating(true);
    setIsDragging(false);
    setDragX(direction === "right" ? EXIT_DISTANCE : -EXIT_DISTANCE);
    window.setTimeout(() => {
      setIndex((i) => Math.min(i + 1, breeds.length - 1));
      setDragX(0);
      setIsAnimating(false);
    }, EXIT_DURATION);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (isAnimating || atEnd) return;
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
      if (Math.abs(dx) > SWIPE_THRESHOLD) advance(dx > 0 ? "right" : "left");
      else setDragX(0);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") advance("right");
    if (event.key === "ArrowLeft") advance("left");
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
        <div
          className="breed-swiper__card"
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
          onClick={() => advance("left")}
          disabled={isAnimating || atEnd}
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
          onClick={() => advance("right")}
          disabled={isAnimating || atEnd}
          aria-label="Next breed (swipe right)"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}
