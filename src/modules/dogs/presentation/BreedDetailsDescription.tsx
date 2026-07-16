import type { BreedDetails } from "@/types/dog"
import { memo } from "react"
import { LikeIcon, PassIcon } from "./icons";
import { BreadAction, type BreadBulkAction } from "../domain/model";

const FALLBACK = "—";

const BreedDetailsDescription = ({
  breed,
  handleVote
}: {
  breed: BreedDetails
  handleVote: (value: BreadBulkAction) => void
}) => {
  return  <>
  <dl className="breed-detail__fields">
    <div className="breed-detail__field">
      <dt>Breed Name</dt>
      <dd>{breed.name || FALLBACK}</dd>
    </div>
    <div className="breed-detail__field">
      <dt>Bred For</dt>
      <dd>{breed.bredFor || FALLBACK}</dd>
    </div>
    <div className="breed-detail__field">
      <dt>Weight & Height</dt>
      <dd>
        {breed.weight?.metric ?? FALLBACK} kg - {breed.height?.metric ?? FALLBACK} cm
      </dd>
    </div>
    <div className="breed-detail__field">
      <dt>Breed Group</dt>
      <dd>{breed.breedGroup || FALLBACK}</dd>
    </div>
    <div className="breed-detail__field">
      <dt>Temperament</dt>
      <dd>{breed.temperament.length > 0 ? breed.temperament.join(", ") : FALLBACK}</dd>
    </div>
    <div className="breed-detail__field">
      <dt>Life Span</dt>
      <dd>{breed.lifeSpan || FALLBACK}</dd>
    </div>
  </dl>

  <div className="breed-detail__actions">
    <button
      type="button"
      className="breed-card__action breed-card__action--pass"
      onClick={() => handleVote(BreadAction.Dislike)}
      aria-label={`Dislike ${breed.name}`}
    >
      <PassIcon />
    </button>
    <button
      type="button"
      className="breed-card__action breed-card__action--like"
      onClick={() => handleVote(BreadAction.Like)}
      aria-label={`Like ${breed.name}`}
    >
      <LikeIcon />
    </button>
  </div>
</>
}

export default memo(BreedDetailsDescription)