export interface Breed {
  name: string;
  imageUrl: string;
}

export interface BreedDetails {
  id: string;
  name: string;
  temperament: string[];
  origin: string | null;
  lifeSpan: string | null;
  breedGroup: string | null;
  bredFor: string | null;
  description: string | null;
  history: string | null;
  weight: { imperial: string; metric: string } | null;
  height: { imperial: string; metric: string } | null;
  imageUrl: string | null;
}
