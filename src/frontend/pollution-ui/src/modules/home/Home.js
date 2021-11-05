import { useState, useEffect } from "react";
import Container from "@mui/material/Container";

import Table from "./Table";
import Graph from "./Graph";

import { allData, avgData, attrData } from "../../utils/nodeData.js";

export default function CustomPaginationActionsTable() {
  const [data, setData] = useState({});
  const [averageData, setAverageData] = useState({});
  const [attributeData, setAttributeData] = useState({});
  const [tempFlag, setTempFlag] = useState(false);

  useEffect(() => {
    const channelId = localStorage.getItem("channelId");
    if (!tempFlag) {
      async function fetchData() {
        const table = await allData(channelId);
        setData(table);
        const averageTable = await avgData(channelId);
        setAverageData(averageTable);
        const attrTable = await attrData(channelId);
        setAttributeData(attrTable);
        setTempFlag(true);
      }
      fetchData();
    }
  });
  return (
    <Container fixWidth>
      <Graph allData={data} avgData={averageData} />
      <Table attributeData={attributeData} />
    </Container>
  );
}
