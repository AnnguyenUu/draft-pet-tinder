import { create } from "zustand";

interface DogsState {
  selectedBreed: string | null;
  selectedImage: string | null;
  selectBreed: (breed: string | null) => void;
  selectImage: (imageUrl: string | null) => void;
}

export const useDogsStore = create<DogsState>((set) => ({
  selectedBreed: null,
  selectedImage: null,
  selectBreed: (breed) => set({ selectedBreed: breed, selectedImage: null }),
  selectImage: (imageUrl) => set({ selectedImage: imageUrl }),
}));
