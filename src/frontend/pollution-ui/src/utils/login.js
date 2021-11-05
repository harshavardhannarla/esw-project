import axios from "axios";

async function login(channelId) {
  let response = {
    data: {
      success: true,
      channelId: "Doesn't exist",
    },
  };
  // response = await axios.post("/user/login", {
  //   channelId: channelId,
  // });
  return response;
}

export { login };
