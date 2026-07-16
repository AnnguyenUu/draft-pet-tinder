export const DOGS_QUERY_KEYS = {
  breedList: ["dogs", "breeds"] as const,
  breedImages: (breed: string) => ["dogs", "breeds", breed, "images"] as const,
};

export const DOGS: string = "dogs";

export const SWIPE_THRESHOLD = 100;
export const WINDOW_AHEAD = 2;
