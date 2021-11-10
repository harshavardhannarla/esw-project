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

import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

const dummyData = {
  datasets: [
    {
      label: "# of Votes",
      data: [12, 19, 3, 5, 2, 3],
      ...colorData,
    },
  ],
};

export default function CustomPaginationActionsTable() {
  const [data, setData] = useState({});
  const [averageData, setAverageData] = useState({});
  const [attributeData, setAttributeData] = useState({});
  const [tempFlag, setTempFlag] = useState(false);
  const [channelId, setChannelId] = useState("");
  const [timeChoice, setTimeChoice] = useState(0);

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [allData, setAllData] = useState(dummyData);

  const [option, setOption] = useState(choices[0]);

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
        const reqData = {
          ...dummyData,
          labels: data["created_at"].map((e) => new Date(e).toUTCString()),
          datasets: [
            {
              ...colorData[0],
              label: option,
              data: data[option],
            },
            {
              ...colorData[1],
              label: "Average " + option,
              data: Array(data[option].length).fill(averageData[option]),
            },
          ],
        };
        setAllData(reqData);
      }
      fetchData();
      props.setFlag(true);
    }
  });

  const handleButton = async () => {
    let table = {};
    if (timeChoice == 0) {
      table = await allData(channelId, fromDate.getTime(), toDate.getTime());
    } else {
      const currentTime = new Date().getTime();
      table = await allData(
        channelId,
        currentTime - timeChoice * 1000,
        currentTime
      );
    }
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
    setGraphFlag(true);
  };

  const updateDate = (updateFunc, value) => {
    updateFunc(value);
    setTimeChoice(0);
  };

  return (
    <Container fixWidth>
      <Realtime />
      <Graph
        allData={data}
        avgData={averageData}
        flag={graphFlag}
        setFlag={setGraphFlag}
      />
      <Container fixWidth sx={{ padding: 2 }}>
        <h1 className="title">Pick Date/Time</h1>
        <Stack spacing={5}>
          <Stack spacing={5} direction="row">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker
                label="From Date"
                inputFormat="MM/dd/yyyy"
                value={fromDate}
                renderInput={(params) => <TextField {...params} />}
                onChange={(val) => {
                  updateDate(setFromDate, val);
                }}
              />
              <DesktopDatePicker
                label="To Date"
                inputFormat="MM/dd/yyyy"
                value={fromDate}
                renderInput={(params) => <TextField {...params} />}
                onChange={(val) => {
                  updateDate(setToDate, val);
                }}
              />
            </LocalizationProvider>
          </Stack>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={timeChoice}
            label="Time based plot"
            onChange={(event) => setTimeChoice(event.target.value)}
          >
            <MenuItem value={0}>Pick</MenuItem>
            <MenuItem value={3600}>One hour</MenuItem>
            <MenuItem value={3600 * 8}>Eight hours</MenuItem>
            <MenuItem value={3600 * 24}>One day</MenuItem>
          </Select>
          <Button variant="contained" onClick={handleButton}>
            Submit
          </Button>
        </Stack>
      </Container>
      <Table attributeData={attributeData} />
    </Container>
  );
}
