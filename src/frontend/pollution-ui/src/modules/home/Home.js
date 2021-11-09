import { useState, useEffect } from "react";
import Container from "@mui/material/Container";

import Table from "./Table";
import Graph from "./Graph";
import Realtime from "./Realtime";

import { allData, avgData, attrData } from "../../utils/nodeData.js";

import DesktopDatePicker from "@mui/lab/DesktopDatePicker";
import TextField from "@mui/material/TextField";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

export default function CustomPaginationActionsTable() {
  const [data, setData] = useState({});
  const [averageData, setAverageData] = useState({});
  const [attributeData, setAttributeData] = useState({});
  const [tempFlag, setTempFlag] = useState(false);
  const [channelId, setChannelId] = useState("");

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  useEffect(() => {
    const channel = localStorage.getItem("channelId");
    setChannelId(channel);
    if (!tempFlag) {
      async function fetchData() {
        const table = await allData(channelId, 0, 0);
        setData(table);
        const averageTable = await avgData(table);
        setAverageData(averageTable);
        const attrTable = await attrData(channelId, 0, 0);
        setAttributeData(attrTable);
        setTempFlag(true);
      }
      fetchData();
    }
  });

  const handleButton = async () => {
    const table = await allData(
      channelId,
      fromDate.getTime(),
      toDate.getTime()
    );
    setData(table);
    const averageTable = await avgData(
      channelId,
      fromDate.getTime(),
      toDate.getTime()
    );
    setAverageData(averageTable);
    const attrTable = await attrData(channelId);
    setAttributeData(attrTable);
    setTempFlag(true);
  };

  return (
    <Container fixWidth>
      <Realtime />
      <Graph allData={data} avgData={averageData} />
      <Container fixWidth sx={{ padding: 2 }}>
        <h1 className="title">Timeline</h1>
        <Stack spacing={5} direction="row">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DesktopDatePicker
              label="From Date"
              inputFormat="MM/dd/yyyy"
              value={fromDate}
              renderInput={(params) => <TextField {...params} />}
              onChange={setFromDate}
            />
            <DesktopDatePicker
              label="To Date"
              inputFormat="MM/dd/yyyy"
              value={fromDate}
              renderInput={(params) => <TextField {...params} />}
              onChange={setToDate}
            />
          </LocalizationProvider>
          <Button variant="contained" onClick={handleButton}>
            Submit
          </Button>
        </Stack>
      </Container>
      <Table attributeData={attributeData} />
    </Container>
  );
}
