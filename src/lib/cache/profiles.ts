import { cacheLife } from "next/cache";

export const cacheProfiles = {
  storeStaticDays: () => cacheLife("days", 7),
  catalogHours: () => cacheLife("hours", 2),
  reviewsMinutes: () => cacheLife("minutes", 10),
  priceSeconds: () => cacheLife("seconds", 5),
};
