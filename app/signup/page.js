"use client";

import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth, firestore } from "../../firebase";
import { setDoc, doc } from "firebase/firestore";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import {
  Button,
  Divider,
  Snackbar,
  Stack,
  TextField,
  Typography,
  createTheme,
  ThemeProvider,
} from "@mui/material";
const theme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderWidth: 2, // Ensure this is set to show the border
              borderStyle: "solid",
              borderImage: "linear-gradient(#033363, #021F3B) 1", // Gradient border
            },
            "&:hover fieldset": {
              borderImage: "none", // Remove gradient on hover
            },
            "&.Mui-focused fieldset": {
              borderImage: "linear-gradient(#033363, #021F3B) 1", // Gradient border on focus
            },
            "& input": {
              color: "white", // Text color inside the TextField
            },
          },
          "& .MuiInputLabel-root": {
            color: "white", // Default label color
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "white", // Label color on focus
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "white", // Default label color
          "&.Mui-focused": {
            color: "white", // Label color on focus
          },
        },
      },
    },
  },
});

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(firestore, "Users", user.uid), {
          email: user.email,
          firstName: fname,
          lastName: lname,
        });
      }
      setEmail("");
      setPassword("");
      setFname("");
      setLname("");
      setSnackbarMessage("User Registered successfully!");
      setSnackbarOpen(true);

      // Delay the switch to login to allow Snackbar to display
      setTimeout(() => {
        setSnackbarOpen(false);
      }, 3000); // Adjust the delay time as needed
    } catch (error) {
      console.log(error.message);
      setSnackbarMessage("Registration failed. Please try again.");
      setSnackbarOpen(true);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            "& > :not(style)": {
              width: {
                xs: "90vw",
                md: "35vw",
              },
              p: 3,
            },
          }}
        >
          <Paper
            elevation={3}
            sx={{
              backgroundColor: "transparent",
              color: "white",
              borderWidth: 2, // Border width
              borderStyle: "solid",
              borderColor: "transparent", // Hide the default border color
              borderRadius: "16px", // Apply border radius
              position: "relative", // Ensure proper positioning for pseudo-elements
              overflow: "hidden", // Hide overflow to prevent border radius issues
              boxShadow: "10px 14px 16px #4a148c", // Adjust shadow size, spread, and color
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                border: "2px solid transparent",
                borderRadius: "16px", // Ensure border radius for pseudo-element
                background: "linear-gradient(#4a148c, #212121)", // Gradient border
                zIndex: -1, // Place behind content
              },
            }}
          >
            <h1 style={{ textAlign: "center" }}>Sign Up</h1>
            <br />
            <Snackbar
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              autoHideDuration={6000} // Adjust the duration as needed
              open={snackbarOpen}
              onClose={handleSnackbarClose}
              message={snackbarMessage}
            />
            <form onSubmit={handleRegister}>
              <Stack
                direction={"column"}
                sx={{
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <TextField
                  type="text"
                  variant="outlined"
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                  label="First name"
                  fullWidth
                />
                <TextField
                  type="text"
                  variant="outlined"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                  label="Last name"
                  fullWidth
                />
                <TextField
                  type="email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  label="Email Address"
                  fullWidth
                />
                <TextField
                  type="password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  label="Password"
                  fullWidth
                />
                <Divider
                  sx={{
                    bgColor: "black",
                    width: "100%",
                  }}
                />
                <Typography variant="p">
                  Already Registered?{" "}
                  <Button
                    href="/login"
                    style={{
                      color: "white",
                    }}
                  >
                    Log In
                  </Button>
                </Typography>
                <Button
                  variant="contained"
                  type="submit"
                  fullWidth
                  sx={{
                    background: "linear-gradient(#4a148c, #212121)",
                  }}
                >
                  Signup
                </Button>
              </Stack>
            </form>
          </Paper>
        </Box>
      </div>
    </ThemeProvider>
  );
}
