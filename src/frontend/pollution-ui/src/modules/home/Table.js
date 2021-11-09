import { useState, useEffect } from "react";
import Container from "@mui/material/Container";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const choices = [
  "temperature",
  "humidity",
  "pm2",
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

export default function TableCustom(props) {
  const [option, setOption] = useState(choices[0]);
  const [data, setData] = useState([]);
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    if (!flag && typeof props.attributeData[option] != "undefined") {
      const tableData = Object.keys(props.attributeData[option]).map((x, i) => {
        return {
          attribute: x,
          value: props.attributeData[option][x][0],
          recc: props.attributeData[option][x][1],
        };
      });
      setFlag(true);
      setData(tableData);
    }
  });

  const handleRadio = (event) => {
    setOption(event.target.value);
    if (typeof props.attributeData[event.target.value] != "undefined") {
      const tableData = Object.keys(
        props.attributeData[event.target.value]
      ).map((x, i) => {
        return {
          attribute: x,
          value: props.attributeData[event.target.value][x][0],
          recc: props.attributeData[event.target.value][x][1],
        };
      });
      setData(tableData);
    }
  };

  return (
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
              <StyledTableCell align="right">
                Reccommended Value
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <StyledTableRow key={row.attribute}>
                <StyledTableCell>{row.attribute}</StyledTableCell>
                <StyledTableCell align="right">{row.value}</StyledTableCell>
                <StyledTableCell align="right">{row.recc}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <FormControl component="fieldset">
        <FormLabel component="legend">Table Attribute: {option}</FormLabel>
        <RadioGroup
          row
          aria-label="gender"
          name="controlled-radio-buttons-group"
          value={option}
          onChange={handleRadio}
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
  );
}
