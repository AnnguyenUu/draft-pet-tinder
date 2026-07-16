import { Link } from "react-router-dom";

import type { BreedDetails } from "@/types/dog";
import { BadgeCheckIcon, LikeIcon, PassIcon, PinIcon } from "@/modules/dogs/presentation/icons";

interface BreedCardProps {
  breed: BreedDetails;
  onPass?: () => void;
  onLike?: () => void;
  disabled?: boolean;
}

export function BreedCard({ breed, onPass, onLike, disabled }: BreedCardProps) {
  return (
    <article className="breed-card">
      <Link to={`/breads/${breed.id}`} className="breed-card__media" draggable={false} aria-label={`More about ${breed.name}`}>
        {breed.imageUrl ? (
          <img
            src={breed.imageUrl}
            alt={breed.name}
            className="breed-card__image"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="breed-card__image breed-card__image--placeholder" aria-hidden="true" />
        )}
        <div className="breed-card__scrim" />
      </Link>

      <div className="breed-card__panel">
        <Link
          to={`/breads/${breed.id}`}
          className="breed-card__content"
          draggable={false}
          aria-label={`More about ${breed.name}`}
        >
          <h3 className="breed-card__title">
            {breed.name}
            {breed.breedGroup && (
              <span className="breed-card__verified" title={`${breed.breedGroup} group`}>
                <BadgeCheckIcon />
              </span>
            )}
          </h3>

          {breed.origin && (
            <p className="breed-card__meta">
              <PinIcon />
              {breed.origin}
            </p>
          )}
        </Link>

        {(onPass || onLike) && (
          <div className="breed-card__actions">
            {onPass && (
              <button
                type="button"
                className="breed-card__action breed-card__action--pass"
                onClick={onPass}
                disabled={disabled}
                aria-label={`Pass on ${breed.name}`}
              >
                <PassIcon />
              </button>
            )}
            {onLike && (
              <button
                type="button"
                className="breed-card__action breed-card__action--like"
                onClick={onLike}
                disabled={disabled}
                aria-label={`Like ${breed.name}`}
              >
                <LikeIcon />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
