import { useState, useEffect } from "react";
import Container from "@mui/material/Container";

import {
  allData,
  avgData,
  attrData,
  realtimeData,
} from "../../utils/nodeData.js";

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
import { getId } from "../../utils/login.js";

const cities = ["Hyd", "Del"];

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
const choices = {
  Hyd: [
    "temperature",
    "humidity",
    "pm2.5",
    "pm10",
    "co2",
    "tvoc",
    "eco2",
    "h2",
  ],
  Del: ["Temp", "Humidity", "Pm25", "Pm10", "Co2", "voc_index"],
};
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
  const [timeChoice, setTimeChoice] = useState(0);

  const [channelId, setChannelId] = useState("1519907");
  const [city, setCity] = useState("Hyd");

  const [attributeData, setAttributeData] = useState({});
  const [averageData, setAverageData] = useState({});
  const [data, setData] = useState({});

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  /* graph */
  const [graphOption, setGraphOption] = useState("");
  const [graphData, setGraphData] = useState(dummyData);

  /* table */
  const [tableOption, setTableOption] = useState("");
  const [tableData, setTableData] = useState([]);
  /* Real time data */
  const [realData, setRealData] = useState([]);

  const setRealTime = async (channel) => {
    const table = await realtimeData(channel);
    const tableData = Object.keys(table).map((x, i) => {
      return {
        attribute: x,
        value: table[x],
      };
    });
    setRealData(tableData);
  };

  const setGraph = (choice, table) => {
    setGraphOption(choice);
    setData(table);
    const reqData = {
      ...dummyData,
      labels: table["created_at"].map((e) => new Date(e).toUTCString()),
      datasets: [
        {
          ...colorData[0],
          label: choice,
          data: table[choice],
        },
        {
          ...colorData[1],
          label: "Average " + choice,
          data:
            typeof table[choice] == "undefined"
              ? []
              : Array(table[choice].length).fill(averageData[choice]),
        },
      ],
    };
    setGraphData(reqData);
  };

  const setTableRadio = (choice, attrTable) => {
    setAttributeData(attrTable);
    const tableData = Object.keys(attrTable[choice]).map((x) => {
      return {
        attribute: x,
        value: attrTable[choice][x],
      };
    });
    setTableData(tableData);
  };

  const setTable = async (choice, table) => {
    setTableOption(choice);
    const averageTable = await avgData(table);
    setAverageData(averageTable);

    const attrTable = await attrData(table);
    setTableRadio(choice, attrTable);
  };

  useEffect(() => {
    if (!tempFlag) {
      async function fetchData() {
        setTempFlag(true);

        const table = await allData(channelId, 0, 0);
        const choice = choices[city][0];
        setGraph(choice, table);
        await setTable(choice, table);
        setRealTime(channelId);
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
    setTable(tableOption, table);
    setGraph(tableOption, table);
  };

  const updateDate = (updateFunc, value) => {
    updateFunc(value);
    setTimeChoice(0);
  };

  const handleTableRadio = (chosen) => {
    setTableOption(chosen);
    setTableRadio(chosen, attributeData);
  };

  const handleGraphRadio = (chosen) => {
    setGraph(chosen, data);
  };

  const changeCity = async (city) => {
    setCity(city);
    const id = await getId(city);
    const table = await allData(id, 0, 0);
    const choice = choices[city][0];
    console.log(table, city, id, choice);
    setGraph(choice, table);
    await setTable(choice, table);
    setRealTime(id);
  };

  return (
    <Container fixWidth>
      <Container>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={city}
          label="Choose City"
          onChange={(event) => changeCity(event.target.value)}
        >
          <MenuItem value={0}>City</MenuItem>
          <MenuItem value={"Hyd"}>Hyderabad</MenuItem>
          <MenuItem value={"Del"}>Delhi</MenuItem>
        </Select>
      </Container>
      <Container fixWidth>
        <div className="header">
          <h1 className="title">Realtime values</h1>
          <div className="links"></div>
        </div>
        <TableContainer style={style}>
          <Table sx={{ minWidth: 200 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                {realData.map((row) => (
                  <StyledTableCell>{row.attribute}</StyledTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <StyledTableRow>
                {realData.map((row) => (
                  <StyledTableCell align="left">{row.value}</StyledTableCell>
                ))}
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
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
                {choices[city].map((choice) => (
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
            {choices[city].map((choice) => (
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
