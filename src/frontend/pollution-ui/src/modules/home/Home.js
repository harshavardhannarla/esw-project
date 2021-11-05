import react, { useState, useEffect } from "react";
import Container from "@mui/material/Container";

import Table from "./Table";
import Graph from "./Graph";

import { allData, avgData, predictionData } from "../../utils/nodeData.js";

export default function CustomPaginationActionsTable() {
  const [data, setData] = useState({});
  const [averageData, setAverageData] = useState({});
  const [tempFlag, setTempFlag] = useState(false);

  useEffect(() => {
    const channelId = localStorage.getItem("channelId");
    if (!tempFlag) {
      async function fetchData() {
        const table = await allData(channelId);
        setData(table);
        const averageTable = await avgData(channelId);
        setAverageData(averageTable);
        setTempFlag(true);
      }
      fetchData();
    }
  });
  return (
    <Container fixWidth>
      <Table allData={data} avgData={averageData} />
      <Graph
        allData={data}
        avgData={averageData}
        predictionData={predictionData}
      />
    </Container>
  );
}
