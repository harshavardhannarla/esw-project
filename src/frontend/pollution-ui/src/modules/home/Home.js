import * as React from "react";
import Container from "@mui/material/Container";

import Table from "./Table";
import Graph from "./Graph";

export default function CustomPaginationActionsTable() {
  return (
    <Container fixWidth>
      <Table />
      <Graph />
    </Container>
  );
}
