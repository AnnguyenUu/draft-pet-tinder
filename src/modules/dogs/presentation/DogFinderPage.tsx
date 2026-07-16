import BreedCatalog from "./BreedCatalog";

export function DogFinderPage() {
  return (
    <main className="page page--wide">
      <h1>Dog Finder</h1>

      <section>
        <h2>Browse breeds</h2>
        <BreedCatalog />
      </section>
    </main>
  );
}
