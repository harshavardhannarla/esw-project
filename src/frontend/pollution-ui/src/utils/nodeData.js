async function realtimeData(channelId) {
  // array of objects
  let table = {
    temperature: 20,
    humidity: 10,
    pm2: 100,
    pm10: 200,
    co2: 3000,
    tvoc: 100,
    eco2: 50,
    h2: 100,
  };
  return table;
}

async function allData(channelId, fromDate, toDate) {
  console.log(fromDate, toDate);
  let table = {
    created_at: [1636099952084, 1636099952089, 1636099952094],
    temperature: [20, 25, 24],
    humidity: [10, 20, 12],
    pm2: [100, 100, 100],
    pm10: [200, 200, 200],
    co2: [3000, 3000, 2900],
    tvoc: [100, 100, 100],
    eco2: [50, 50, 50],
    h2: [100, 100, 100],
  };
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
