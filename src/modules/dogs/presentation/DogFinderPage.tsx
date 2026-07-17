import { BreedsProvider } from "../core/store/dog.store";
import BreedCatalog from "./BreedCatalog";

export function DogFinderPage() {
  return (
    <BreedsProvider>
      <main className="page page--wide page--immersive">
        <section>
          <BreedCatalog />
        </section>
      </main>
    </BreedsProvider>
  );
}
