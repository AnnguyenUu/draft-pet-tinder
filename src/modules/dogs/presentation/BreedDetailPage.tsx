import { useNavigate, useParams } from "react-router-dom";

import { useBreedDetail } from "@/modules/dogs/core/handlers/useBreedDetail";
import { useVoteImage } from "@/modules/dogs/core/handlers/useVoteImage";
import { ChevronLeftIcon } from "@/modules/dogs/presentation/icons";
import BreedDetailsDescription from "./BreedDetailsDescription";
import type { BreedDetails } from "@/types/dog";
import type { BreadBulkAction } from "../domain/model";

export function BreedDetailPage() {
  const { breedId } = useParams<{ breedId: string }>();

  const navigate = useNavigate();

  const { data: breed, isLoading, isError } = useBreedDetail(breedId);

  const vote = useVoteImage();

  const handleVote = (value: BreadBulkAction) => {
    if (breed?.imageId) {
      vote.mutate({ imageId: breed.imageId, value });
    }

    navigate(-1);
  };

  return (
    <main className="breed-detail">
      <header className="breed-detail__header">
        <button
          type="button"
          className="breed-detail__back"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <ChevronLeftIcon />
        </button>
      </header>

      <BreadPage
        breed={breed}
        isLoading={isLoading}
        isError={isError}
        handleVote={handleVote}
      />
    </main>
  );
}

const BreadPage = ({
  breed,
  isLoading,
  handleVote,
  isError,
}: {
  breed: BreedDetails;
  isLoading: boolean;
  handleVote: (value: BreadBulkAction) => void;
  isError: boolean;
}) => {
  if (isLoading) {
    return <p className="hint">Loading breed…</p>;
  }

  if (isError) {
    return <p className="hint hint--error">Could not load this breed.</p>;
  }
  return <BreedDetailsDescription breed={breed} handleVote={handleVote} />;
};
