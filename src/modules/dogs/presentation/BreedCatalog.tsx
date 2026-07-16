import { useBreedList } from "@/modules/dogs/core/handlers/useBreedList";
import { DogSwiper } from "./DogSwiper";
import { memo } from "react";

const LoadingBread = () => {
  return <p className="hint">Loading breeds…</p>;
};

const ErrorBread = () => {
  return <p className="hint hint--error">Could not load breeds.</p>;
};

function BreedCatalog() {
  const { data: breeds, isLoading, isError } = useBreedList();

  if (isLoading) return <LoadingBread />;

  if (isError || !breeds || breeds.length === 0) return <ErrorBread />;

  return <DogSwiper breeds={breeds} />;
}

export default memo(BreedCatalog);
