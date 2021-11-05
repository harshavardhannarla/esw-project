async function predictionData(channelId) {
  // array of objects
  let table = [];
  return table;
}

async function allData(channelId) {
  // object of arrays.
  // created_at must be epoch values in milliseconds.
  // To convert to date object:
  // myDate = new Date(epoch_in_milliseconds);
  // console.log(myDate.toLocaleString());
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

async function avgData(channelId) {
  const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;
  let averageValues = {};
  const table = await allData(channelId);
  for (const attr in table) {
    if (attr === "created_at") continue;
    averageValues[attr] = average(table[attr]);
  }
  return averageValues;
}

export { allData, avgData, predictionData };
