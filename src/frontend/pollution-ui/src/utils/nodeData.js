import axios from "axios";
import completeConf from "./config.json";

const config = completeConf["Hyd"];

function cleanData(reqData) {
  const fieldList = getFields(reqData);

  let table = { created_at: [] };
  fieldList.map((x, i) => {
    table[x.name] = [];
  });
  reqData.feeds.map((entry) => {
    table["created_at"].push(entry["created_at"]);
    fieldList.map((field) => {
      table[field.name].push(entry[field.field]);
    });
  });
  fieldList.map((field) => {
    table[field.name] = table[field.name].map((x) => parseFloat(x));
  });

  table["created_at"] = table["created_at"].map((x) => {
    return Math.floor(new Date(x).getTime());
  });
  return table;
}

async function realtimeData(channelId) {
  const url = `https://api.thingspeak.com/channels/${
    config["channelId"]
  }/feeds.json?api_key=${config["readAPIKey"]}&results=${1}`;
  const reqData = (await axios.get(url)).data;
  let table = cleanData(reqData);
  delete table["created_at"];
  // array of objects
  // table = {
  //   temperature: 20,
  //   humidity: 10,
  //   pm2: 100,
  //   pm10: 200,
  //   co2: 3000,
  //   tvoc: 100,
  //   eco2: 50,
  //   h2: 100,
  // };
  return table;
}

function getFields(data) {
  let attributes = [];
  Object.keys(data.channel).map((x, i) => {
    if (x.startsWith("field")) {
      attributes.push({
        field: x,
        name: data.channel[x],
      });
    }
  });
  return attributes;
}

async function allData(channelId, fromDate, toDate) {
  const url = `https://api.thingspeak.com/channels/${
    config["channelId"]
  }/feeds.json?api_key=${config["readAPIKey"]}&results=${10}`;
  const reqData = (await axios.get(url)).data;
  let table = cleanData(reqData);
  // table = {
  //   created_at: [1636099952084, 1636099952089, 1636099952094],
  //   temperature: [20, 25, 24],
  //   humidity: [10, 20, 12],
  //   pm2: [100, 100, 100],
  //   pm10: [200, 200, 200],
  //   co2: [3000, 3000, 2900],
  //   tvoc: [100, 100, 100],
  //   eco2: [50, 50, 50],
  //   h2: [100, 100, 100],
  // };
  return table;
}

async function avgData(table) {
  const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;
  let averageValues = {};
  for (const attr in table) {
    if (attr === "created_at") continue;
    averageValues[attr] = average(table[attr]);
  }
  return averageValues;
}

async function attrData(channelId) {
  const attributes = {
    temperature: { average: [1, 0], max: [1, 0], min: [0, 1] },
    humidity: { average: [1, 0], max: [1, 0], min: [0, 1] },
    pm2: { average: [1, 0], max: [1, 0], min: [0, 1] },
    pm10: { average: [1, 0], max: [1, 0], min: [0, 1] },
    co2: { average: [1, 0], max: [1, 0], min: [0, 1] },
    tvoc: { average: [1, 0], max: [1, 0], min: [0, 1] },
    eco2: { average: [1, 0], max: [1, 0], min: [0, 1] },
    h2: { average: [1, 0], max: [1, 0], min: [0, 1] },
  };
  return attributes;
}

export { allData, avgData, realtimeData, attrData };
