import axios from "axios";
import completeConf from "./config.json";
import dateFormat, { masks } from "dateformat";

const average = (arr) =>
  typeof arr == "undefined" ? "-" : arr.reduce((p, c) => p + c, 0) / arr.length;

function cleanData(reqData) {
  const fieldList = getFields(reqData);

  let table = { created_at: [] };
  fieldList.map((x) => {
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
    if (typeof table[field.name] != "undefined") {
      table[field.name] = table[field.name].map((x) => {
        if (x >= 0) return x;
        else return averageValue;
      });
    } else {
      table[field.name] = ["-"];
    }
  });

  table["created_at"] = table["created_at"].map((x) => {
    return Math.floor(new Date(x).getTime());
  });
  return table;
}

function getCity(channelId) {
  let city = "";
  Object.keys(completeConf).map((x) => {
    if (completeConf[x]["channelId"] == channelId) city = x;
  });
  return city;
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
async function realtimeData(channelId) {
  const city = getCity(channelId);
  const url = `https://api.thingspeak.com/channels/${
    completeConf[city]["channelId"]
  }/feeds.json?api_key=${completeConf[city]["readAPIKey"]}&results=${1}`;
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

async function allData(channelId, fromDate, toDate) {
  const city = getCity(channelId);
  if (fromDate == 0) {
    const url = `https://api.thingspeak.com/channels/${
      completeConf[city]["channelId"]
    }/feeds.json?api_key=${completeConf[city]["readAPIKey"]}&results=${10}`;
    const reqData = (await axios.get(url)).data;
    const cleaned = cleanData(reqData);
    return cleaned;
  } else {
    let from = new Date(fromDate);
    let to = new Date(toDate);
    from = dateFormat(from, "yyyy-mm-dd HH:MM:ss");
    to = dateFormat(to, "yyyy-mm-dd HH:MM:ss");

    const url = `https://api.thingspeak.com/channels/${completeConf[city]["channelId"]}/feeds.json?api_key=${completeConf[city]["readAPIKey"]}&start=${from}&end=${to}`;
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
  let values = {};
  for (const attr in table) {
    if (attr === "created_at") continue;
    console.log(Math.max(table[attr]), table[attr]);
    values[attr] = {
      average: average(table[attr]),
      max: Math.max(...table[attr]),
      min: Math.min(...table[attr]),
    };
  }
  return values;
}

export { allData, avgData, realtimeData, attrData };
