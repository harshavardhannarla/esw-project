import completeConf from "./config.json";

async function login(channelId) {
  let city = "";
  if (
    Object.keys(completeConf).some((x) => {
      if (completeConf[x]["channelId"] == channelId) {
        city = x;
        return true;
      } else {
        return false;
      }
    })
  ) {
    return {
      data: {
        success: true,
        city: city,
      },
    };
  } else {
    return {
      data: {
        success: false,
        channelId: `channel Id:${channelId} Doesn't exist`,
      },
    };
  }
}

export { login };
