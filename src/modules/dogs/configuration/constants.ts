export const DOGS_QUERY_KEYS = {
  breedList: ["dogs", "breeds"] as const,
  breedImages: (breed: string) => ["dogs", "breeds", breed, "images"] as const,
};

export const RECENT_BREED_COOKIE = "df_recent_breed";
