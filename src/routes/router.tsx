import { createBrowserRouter } from "react-router-dom";

import App from "@/App";
import { DogFinderPage } from "@/modules/dogs/presentation/DogFinderPage";
import { BreedDetailPage } from "@/modules/dogs/presentation/BreedDetailPage";

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/breads", element: <DogFinderPage /> },
  { path: "/breads/:breedId", element: <BreedDetailPage /> },
]);
