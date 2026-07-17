import type { BreedDetails } from "@/types/dog";
import { memo, type ReactNode } from "react";
import { LikeIcon, PassIcon } from "./icons";
import { BreadAction, type BreadBulkAction } from "../domain/model";

const FALLBACK = "—";

const BreedDetailsDescription = ({
  breed,
  handleVote,
}: {
  breed: BreedDetails;
  handleVote: (value: BreadBulkAction) => void;
}) => {
  const items = [
    {
      label: "Breed Name",
      value: breed?.name || FALLBACK,
    },
    {
      label: "Bred For",
      value: breed?.bredFor || FALLBACK,
    },
    {
      label: "Weight & Height",
      value: `${breed?.weight?.metric ?? FALLBACK} kg -
            ${breed?.height?.metric ?? FALLBACK} cm`,
    },
    {
      label: "Breed Group",
      value: breed?.breedGroup || FALLBACK,
    },
    {
      label: "Temperament",
      value:
        breed?.temperament?.length > 0
          ? breed.temperament.join(", ")
          : FALLBACK,
    },
    {
      label: "Life Span",
      value: breed.lifeSpan || FALLBACK,
    },
  ];
  return (
    <>
      <List items={items} />

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
  );
};

const List = ({ items }: { items: { label: string; value: ReactNode }[] }) => {
  return (
    <dl className="breed-detail__fields">
      {(items || []).map((item) => {
        return (
          <div key={item?.label} className="breed-detail__field">
            <dt>{item?.label}</dt>
            <dd>{item?.value}</dd>
          </div>
        );
      })}
    </dl>
  );
};

export default memo(BreedDetailsDescription);
