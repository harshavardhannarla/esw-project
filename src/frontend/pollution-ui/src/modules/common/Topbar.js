import React, { useState, useEffect } from "react";
import Tabs from "@mui/material/Tabs";
import Box from "@mui/material/Box";

import { useHistory } from "react-router-dom";

export default function Topbar() {
  const history = useHistory();

  // TabPanel is where the content should go into.
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}></Box>
    </Box>
  );
}

