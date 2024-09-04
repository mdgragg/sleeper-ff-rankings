// import React from "react";
// import { createRoot } from "react-dom/client";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import "./index.css";
// import App from "./App";
// import SeasonRecap from "./SeasonRecap";
// import SleeperFFRankings from "./components/Standings";
// import * as serviceWorker from "./serviceWorker";

// const container = document.getElementById("root");
// const root = createRoot(container);

// const routing = (
//   <Router>
//     <Routes>
//       <Route exact path="/" component={App} />
//       <Route path="/:id" component={SeasonRecap} />
//       <Route path="/sleeper-ff-rankings" element={<SleeperFFRankings />} />
//     </Routes>
//   </Router>
// );

// root.render(routing);

// serviceWorker.unregister();

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import SeasonRecap from "./SeasonRecap";
import * as serviceWorker from "./serviceWorker";

const container = document.getElementById("root");
const root = createRoot(container);

const routing = (
  <Router>
    <Routes>
      {/* Render SeasonRecap for all routes */}
      <Route path="*" element={<SeasonRecap />} />
    </Routes>
  </Router>
);

root.render(routing);

serviceWorker.unregister();
