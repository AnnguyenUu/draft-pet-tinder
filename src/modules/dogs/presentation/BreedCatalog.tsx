import { DogSwiper } from "./DogSwiper";
import { memo } from "react";
import { useBreedsContext } from "../core/store/dog.store";

const LoadingBread = () => {
  return <p className="hint">Loading breeds…</p>;
};

const ErrorBread = () => {
  return <p className="hint hint--error">Could not load breeds.</p>;
};

function BreedCatalog() {

  const context = useBreedsContext()

  const query = context.query

  const { data: breeds, isLoading, isError } = query

  if (isLoading) return <LoadingBread />;

  if (isError || !breeds || breeds.length === 0) return <ErrorBread />;

  return <DogSwiper breeds={breeds} />;
}

export default memo(BreedCatalog);
