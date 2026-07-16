import { createBrowserRouter } from "react-router-dom";

import App from "@/App";
import { DogFinderPage } from "@/modules/dogs/presentation/DogFinderPage";

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/breads", element: <DogFinderPage /> },
]);
