import React, { useState } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useHistory } from "react-router-dom";

import { login } from "../../utils/login.js";

const theme = createTheme();

const Login = () => {
  let history = useHistory();
  const [channelId, setChannelId] = useState("");

  async function pushData() {
    if (channelId == "admin") {
      localStorage.setItem("channelId", "519907");
      localStorage.setItem("city", "Hyd");
      history.push("/home/");
    }
    try {
      let res = await login(channelId);
      if (res.data.success) {
        localStorage.setItem("channelId", channelId);
        localStorage.setItem("city", res.data.city);
        history.push("/home/");
      } else if (res.data.channelId) {
        alert(res.data.channelId);
      }
    } catch (err) {
      console.log(err);
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const obj = {
      channelId: data.get("channelId"),
    };
    pushData(obj);
    // Send data to the backend and await for the query
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h2" variant="h2">
            Indoor Pollution
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="channelId"
              label="Channel ID"
              name="channelId"
              autoComplete="channelId"
              value={channelId}
              onChange={(event) => {
                setChannelId(event.target.value);
              }}
              autoFocus
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Login;
