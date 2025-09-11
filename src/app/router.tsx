import { createBrowserRouter } from "react-router-dom";
import Navbar from "../components/Navbar";

import Home from "../pages/Home";
import Week from "../pages/Week";
import History from "../pages/History";
import Update from "../pages/Update";

import Awards from "../pages/Awards";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Navbar />
        <Home />
      </>
    ),
  },
  {
    path: "/week/:week",
    element: (
      <>
        <Week />
      </>
    ),
  },
  {
    path: "/history",
    element: (
      <>
        <Navbar />
        <History />{" "}
      </>
    ),
  },

  {
    path: "/awards",
    element: (
      <>
        <Navbar />
        <Awards />{" "}
      </>
    ),
  },
  {
    path: "/update",
    element: (
      <>
        <Navbar />
        <Update />
      </>
    ),
  },
]);
