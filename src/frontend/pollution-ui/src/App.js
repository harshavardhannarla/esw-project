import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import Home from "./modules/home/Home";
import Topbar from "./modules/common/Topbar";

const App = () => {
  return (
    <Router>
      <Topbar />
      <div className="App">
        <Route exact path="/" component={Home} />
      </div>
    </Router>
  );
};

export default App;
