import axios from "axios";
import completeConf from "./config.json";
import dateFormat, { masks } from "dateformat";

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
  if (fromDate == 0) {
    const url = `https://api.thingspeak.com/channels/${
      config["channelId"]
    }/feeds.json?api_key=${config["readAPIKey"]}&results=${10}`;
    const reqData = (await axios.get(url)).data;
    return cleanData(reqData);
  } else {
    let from = new Date(fromDate);
    let to = new Date(toDate);
    from = dateFormat(from, "yyyy-mm-dd HH:MM:ss");
    to = dateFormat(to, "yyyy-mm-dd HH:MM:ss");

    const url = `https://api.thingspeak.com/channels/${config["channelId"]}/feeds.json?api_key=${config["readAPIKey"]}&start=${from}&end=${to}`;
    const reqData = (await axios.get(url)).data;
    let table = cleanData(reqData);
    return table;
  }
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

async function attrData(table) {
  const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;
  const min = (arr) => arr.reduce((p, c) => (p < c ? p : c));
  const max = (arr) => arr.reduce((p, c) => (p > c ? p : c));

  let averageValues = {};
  for (const attr in table) {
    if (attr === "created_at") continue;
    averageValues[attr] = {
      average: average(table[attr]),
      max: max(table[attr]),
      min: min(table[attr]),
    };
  }
  return averageValues;
}

export { allData, avgData, realtimeData, attrData };
