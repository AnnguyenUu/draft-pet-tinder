import { useBreedImages } from "@/modules/dogs/core/handlers/useBreedImages";
import { useDogsStore } from "@/modules/dogs/core/store/dogs.store";

export function BreedGallery() {
  const selectedBreed = useDogsStore((state) => state.selectedBreed);
  const selectedImage = useDogsStore((state) => state.selectedImage);
  const selectImage = useDogsStore((state) => state.selectImage);
  const { data: images, isLoading, isError } = useBreedImages(selectedBreed);

  if (!selectedBreed) return <p className="hint">Pick a breed to see photos.</p>;
  if (isLoading) return <p className="hint">Fetching photos…</p>;
  if (isError || !images) return <p className="hint hint--error">Could not load photos.</p>;

  return (
    <div className="gallery">
      {images.slice(0, 12).map((dog) => (
        <button
          key={dog.imageUrl}
          type="button"
          className={`gallery-item ${selectedImage === dog.imageUrl ? "gallery-item--selected" : ""}`}
          onClick={() => selectImage(dog.imageUrl)}
        >
          <img src={dog.imageUrl} alt={dog.name} loading="lazy" />
        </button>
      ))}
    </div>
  );
}
