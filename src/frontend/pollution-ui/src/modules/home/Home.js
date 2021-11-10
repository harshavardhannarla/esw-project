import { useState, useEffect } from "react";
import Container from "@mui/material/Container";

import Realtime from "./Realtime";

import { allData, avgData, attrData } from "../../utils/nodeData.js";

import DesktopDatePicker from "@mui/lab/DesktopDatePicker";
import TextField from "@mui/material/TextField";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import { Line } from "react-chartjs-2";

const colorData = [
  {
    fill: false,
    backgroundColor: "rgb(255, 99, 132)",
    borderColor: "rgba(255, 99, 132, 0.2)",
  },
  {
    fill: false,
    backgroundColor: "rgb(0, 99, 132)",
    borderColor: "rgba(0, 99, 132, 0.2)",
  },
];

const options = {
  scales: {
    y: {
      beginAtZero: true,
    },
    xAxes: [
      {
        type: "time",
        time: {
          unit: "minute",
        },
      },
    ],
  },
};

const dummyData = {
  datasets: [
    {
      label: "# of Votes",
      data: [12, 19, 3, 5, 2, 3],
      ...colorData,
    },
  ],
};
const choices = [
  "temperature",
  "humidity",
  "pm2.5",
  "pm10",
  "co2",
  "tvoc",
  "eco2",
  "h2",
];
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const style = {
  transform: "translate(22%, 0%)",
  width: 800,
  bgcolor: "background.paper",
  border: "1px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function CustomPaginationActionsTable() {
  const [tempFlag, setTempFlag] = useState(false);
  const [channelId, setChannelId] = useState("");
  const [timeChoice, setTimeChoice] = useState(0);

  const [attributeData, setAttributeData] = useState({});
  const [averageData, setAverageData] = useState({});
  const [data, setData] = useState({});

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  /* graph */
  const [graphOption, setGraphOption] = useState(choices[0]);
  const [graphData, setGraphData] = useState(dummyData);

  /* table */
  const [tableOption, setTableOption] = useState(choices[0]);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const channel = localStorage.getItem("channelId");
    setChannelId(channel);
    if (!tempFlag) {
      async function fetchData() {
        const table = await allData(channelId, 0, 0);
        setData(table);
        const reqData = {
          ...dummyData,
          labels: table["created_at"].map((e) => new Date(e).toUTCString()),
          datasets: [
            {
              ...colorData[0],
              label: graphOption,
              data: table[graphOption],
            },
            {
              ...colorData[1],
              label: "Average " + graphOption,
              data: Array(table[graphOption].length).fill(
                averageData[graphOption]
              ),
            },
          ],
        };
        setGraphData(reqData);

        const averageTable = await avgData(table);
        setAverageData(averageTable);

        const attrTable = await attrData(table);
        setAttributeData(attrTable);
        if (typeof attributeData[tableOption] != "undefined") {
          const table = Object.keys(attributeData[tableOption]).map((x) => {
            return {
              attribute: x,
              value: attributeData[tableOption][x],
            };
          });
          setTableData(table);
          setTempFlag(true);
        }
      }
      fetchData();
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
    const averageTable = await avgData(table);
    setAverageData(averageTable);
    const attrTable = await attrData(table);
    setAttributeData(attrTable);
    const tableData = Object.keys(attrTable[tableOption]).map((x) => {
      return {
        attribute: x,
        value: attrTable[tableOption][x],
      };
    });
    setTableData(tableData);

    const reqData = {
      ...dummyData,
      labels: table["created_at"].map((e) => new Date(e).toUTCString()),
      datasets: [
        {
          ...colorData[0],
          label: graphOption,
          data: table[graphOption],
        },
        {
          ...colorData[1],
          label: "Average " + graphOption,
          data: Array(table[graphOption].length).fill(
            averageTable[graphOption]
          ),
        },
      ],
    };
    setGraphData(reqData);
  };

  const updateDate = (updateFunc, value) => {
    updateFunc(value);
    setTimeChoice(0);
  };

  const handleTableRadio = (chosen) => {
    setTableOption(chosen);
    if (typeof attributeData[chosen] != "undefined") {
      const tableData = Object.keys(attributeData[chosen]).map((x) => {
        return {
          attribute: x,
          value: attributeData[chosen][x],
        };
      });
      setTableData(tableData);
    }
  };

  const handleGraphRadio = (chosen) => {
    setGraphOption(chosen);
    const reqData = {
      ...dummyData,
      labels: data["created_at"].map((e) => new Date(e).toUTCString()),
      datasets: [
        {
          ...colorData[0],
          label: chosen,
          data: data[chosen],
        },
        {
          ...colorData[1],
          label: "Average " + chosen,
          data: Array(data[chosen].length).fill(averageData[chosen]),
        },
      ],
    };
    setGraphData(reqData);
  };

  return (
    <Container fixWidth>
      <Realtime />
      <Container>
        <div className="header">
          <h1 className="title">Statistics</h1>
          <div className="links"></div>
        </div>
        <Stack spacing={2}>
          <Line data={graphData} options={options} />
          <Container>
            <FormControl component="fieldset">
              <FormLabel component="legend">
                Graph Attribute: {graphData.datasets[0].label}
              </FormLabel>
              <RadioGroup
                row
                aria-label="gender"
                name="controlled-radio-buttons-group"
                value={graphOption}
                onChange={(event) => {
                  handleGraphRadio(event.target.value);
                }}
              >
                {choices.map((choice) => (
                  <FormControlLabel
                    value={choice}
                    control={<Radio />}
                    label={choice}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Container>
        </Stack>
      </Container>
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
                value={toDate}
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
      <Container fixWidth>
        <div className="header">
          <h1 className="title">Details</h1>
          <div className="links"></div>
        </div>
        <TableContainer component={Paper} style={style}>
          <Table sx={{ minWidth: 400 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Attribute</StyledTableCell>
                <StyledTableCell align="right">Value</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row) => (
                <StyledTableRow key={row.attribute}>
                  <StyledTableCell>{row.attribute}</StyledTableCell>
                  <StyledTableCell align="right">{row.value}</StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <FormControl component="fieldset">
          <FormLabel component="legend">
            Table Attribute: {tableOption}
          </FormLabel>
          <RadioGroup
            row
            aria-label="gender"
            name="controlled-radio-buttons-group"
            value={tableOption}
            onChange={(event) => {
              handleTableRadio(event.target.value);
            }}
          >
            {choices.map((choice) => (
              <FormControlLabel
                value={choice}
                control={<Radio />}
                label={choice}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Container>
    </Container>
  );
}
