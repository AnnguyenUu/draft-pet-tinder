export const DOGS_QUERY_KEYS = {
  breedList: ["dogs", "breeds"] as const,
  breedImages: (breed: string) => ["dogs", "breeds", breed, "images"] as const,
  breedDetail: (id: string) => ["dogs", "breeds", "detail", id] as const,
};

export const DOGS: string = "dogs";

export const SWIPE_THRESHOLD = 100;
export const WINDOW_AHEAD = 2;

export const LAST_BREED_ID_STORAGE_KEY = "dog-finder:last-breed-id";
