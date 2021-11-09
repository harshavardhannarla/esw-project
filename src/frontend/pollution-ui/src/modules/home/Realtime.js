import { useState, useEffect } from "react";
import Container from "@mui/material/Container";

import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import { realtimeData } from "../../utils/nodeData.js";

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
  transform: "translate(2%, 0%)",
  width: 1000,
  bgcolor: "background.paper",
  border: "1px solid #000",
  boxShadow: 24,
  p: 2,
};

export default function Realtime() {
  const [data, setData] = useState([]);
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    const channel = localStorage.getItem("channelId");
    if (!flag) {
      async function fetchData() {
        const table = await realtimeData(channel);
        const tableData = Object.keys(table).map((x, i) => {
          return {
            attribute: x,
            value: table[x],
          };
        });
        setFlag(true);
        setData(tableData);
      }
      fetchData();
    }
  });

  return (
    <Container fixWidth>
      <div className="header">
        <h1 className="title">Realtime values</h1>
        <div className="links"></div>
      </div>
      <TableContainer style={style}>
        <Table sx={{ minWidth: 200 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              {data.map((row) => (
                <StyledTableCell>{row.attribute}</StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <StyledTableRow>
              {data.map((row) => (
                <StyledTableCell align="left">{row.value}</StyledTableCell>
              ))}
            </StyledTableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
