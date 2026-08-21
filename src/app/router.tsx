import { createBrowserRouter } from "react-router-dom";
// import Navbar from "../components/Navbar";
// import NavDrawer from "../components/NavDrawer";

import Home from "../pages/Home";
import Week from "../pages/Week";
import History from "../pages/History";
import Update from "../pages/Update";
import MarketShare from "../pages/MarketShare";
import Activity from "../pages/Activity";

// import Awards from "../pages/Awards";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
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
        <History />{" "}
      </>
    ),
  },
  {
    path: "/market-share",
    element: (
      <>
        <MarketShare />{" "}
      </>
    ),
  },
  {
    path: "/activity",
    element: (
      <>
        <Activity />{" "}
      </>
    ),
  },

  // {
  //   path: "/awards",
  //   element: (
  //     <>
  //       <Navbar />
  //       <Awards />{" "}
  //     </>
  //   ),
  // },
  {
    path: "/update",
    element: (
      <>
        {/* <Navbar /> */}
        <Update />
      </>
    ),
  },
]);
