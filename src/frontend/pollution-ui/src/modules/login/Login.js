import React, { useState } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useHistory } from "react-router-dom";

const theme = createTheme();

const Login = () => {
  let history = useHistory();
  const [channelId, setChannelId] = useState("");

  async function pushData() {
    try {
      let res = await axios.post("/user/login", {
        channelId: channelId,
      });
      if (res.data.success) {
        localStorage.setItem("channelId", channelId);
        setChannelId("");
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
