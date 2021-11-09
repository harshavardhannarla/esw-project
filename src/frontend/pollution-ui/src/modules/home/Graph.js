import { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import { Line } from "react-chartjs-2";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

import Stack from "@mui/material/Stack";

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
  const [flag, setFlag] = useState(false);

  const [option, setOption] = useState(choices[0]);

  useEffect(() => {
    if (
      !flag &&
      typeof props.allData.co2 !== "undefined" &&
      typeof props.avgData.co2 !== "undefined"
    ) {
      const reqData = {
        ...dummyData,
        labels: props.allData["created_at"].map((e) =>
          new Date(e).toUTCString()
        ),
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
    setOption(event.target.value);
    const reqData = {
      ...dummyData,
      labels: props.allData["created_at"].map((e) => new Date(e).toUTCString()),
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
    <Container>
      <div className="header">
        <h1 className="title">Statistics</h1>
        <div className="links"></div>
      </div>
      <Stack spacing={2}>
        <Line data={allData} options={options} />
        <Container>
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
      </Stack>
    </Container>
  );
}
