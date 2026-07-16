import { Select } from "radix-ui";

import { useBreedList } from "@/modules/dogs/core/handlers/useBreedList";
import { useDogsStore } from "@/modules/dogs/core/store/dogs.store";

export function BreedSelect() {
  const { data: breeds, isLoading, isError } = useBreedList();
  const selectedBreed = useDogsStore((state) => state.selectedBreed);
  const selectBreed = useDogsStore((state) => state.selectBreed);

  if (isLoading) return <p className="hint">Loading breeds…</p>;
  if (isError || !breeds) return <p className="hint hint--error">Could not load breeds.</p>;

  return (
    <Select.Root value={selectedBreed ?? undefined} onValueChange={selectBreed}>
      <Select.Trigger className="select-trigger" aria-label="Breed">
        <Select.Value placeholder="Choose a breed…" />
        <Select.Icon>▾</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="select-content">
          <Select.Viewport>
            {breeds.map((breed) => (
              <Select.Item key={breed.id} value={breed.name} className="select-item">
                <Select.ItemText>{breed.name}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
