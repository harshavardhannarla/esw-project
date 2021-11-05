import react, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import { Line } from "react-chartjs-2";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

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

const dummyData = {
  labels: ["1", "2", "3", "4", "5", "6"],
  datasets: [
    {
      label: "# of Votes",
      data: [12, 19, 3, 5, 2, 3],
      ...colorData,
    },
  ],
};

const options = {
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

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

export default function Graph(props) {
  const [allData, setAllData] = useState(dummyData);
  const [avgData, setAvgData] = useState({});
  const [flag, setFlag] = useState(false);

  const [option, setOption] = useState(choices[0]);

  useEffect(() => {
    if (
      !flag &&
      typeof props.allData.co2 !== "undefined" &&
      typeof props.avgData.co2 !== "undefined"
    ) {
      const labels = Array(props.allData[option].length)
        .fill(0)
        .map((_, i) => i.toString());
      const reqData = {
        ...dummyData,
        labels: labels,
        datasets: [
          {
            ...colorData[0],
            label: option,
            data: props.allData[option],
          },
          {
            ...colorData[1],
            label: "Average " + option,
            data: Array(props.allData[option].length).fill(
              props.avgData[option]
            ),
          },
        ],
      };
      console.log(props.avgData);
      setAllData(reqData);
      setFlag(true);
    }
  });

  const handleRadio = (event) => {
    const labels = Array(props.allData[option].length)
      .fill(0)
      .map((_, i) => i.toString());
    setOption(event.target.value);
    const reqData = {
      ...dummyData,
      labels: labels,
      datasets: [
        {
          ...colorData[0],
          label: event.target.value,
          data: props.allData[event.target.value],
        },
        {
          ...colorData[1],
          label: "Average " + event.target.value,
          data: Array(props.allData[event.target.value].length).fill(
            props.avgData[event.target.value]
          ),
        },
      ],
    };
    setAllData(reqData);
  };

  return (
    <Container fixWidth>
      <div className="header">
        <h1 className="title">Chart</h1>
        <div className="links"></div>
      </div>
      <Line data={allData} options={options} />
      <FormControl component="fieldset">
        <FormLabel component="legend">
          Graph Attribute: {allData.datasets[0].label}
        </FormLabel>
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