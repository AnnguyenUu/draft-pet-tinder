import type { BreedDetails } from "@/types/dog";
// import { BreedDetailsDialog } from "@/modules/dogs/presentation/BreedDetailsDialog";
import { BadgeCheckIcon, PinIcon } from "@/modules/dogs/presentation/icons";

interface BreedCardProps {
  breed: BreedDetails;
}

export function BreedCard({ breed }: BreedCardProps) {
  const tags = breed.temperament.slice(0, 3);

  return (
    <article className="breed-card">
      <div className="breed-card__media">
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
      </div>

      <div className="breed-card__panel">
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

        {tags.length > 0 && (
          <ul className="breed-card__tags">
            {tags.map((tag) => (
              <li key={tag} className="breed-card__tag">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* <BreedDetailsDialog breed={breed}>
        <button type="button" className="breed-card__info" aria-label={`More about ${breed.name}`}>
          <InfoIcon />
        </button>
      </BreedDetailsDialog> */}
    </article>
  );
}
