import axios from "axios";
import completeConf from "./config.json";
import dateFormat, { masks } from "dateformat";

const config = completeConf["Hyd"];
const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;
const min = (arr) => arr.reduce((p, c) => (p < c ? p : c));
const max = (arr) => arr.reduce((p, c) => (p > c ? p : c));

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

    const averageValue = average(table[field.name].filter((x) => x >= 0));
    table[field.name] = table[field.name].map((x) => {
      if (x >= 0) return x;
      else return averageValue;
    });
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
  Object.keys(table).map((x) => {
    if (table[x][0] == -1) {
      table[x][0] = "-";
    }
  });
  // array of objects
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
  let averageValues = {};
  for (const attr in table) {
    if (attr === "created_at") continue;
    averageValues[attr] = average(table[attr]);
  }
  return averageValues;
}

async function attrData(table) {
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
