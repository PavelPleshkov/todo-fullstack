"use client";

import { Grid, TextField, Typography } from "@mui/material";
import { useMutation } from "@apollo/client/react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import * as yup from "yup";
import { useAuth } from "@/app/AuthContext";
import { LOGIN_MUTATION } from "@/app/lib/graphql/operations";
import Btn from "../Btn";
import { ThemeContext } from "@/app/ThemeContext";

const validationSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(4, "Password must be at least 4 characters")
    .required("Password is required"),
});

export default function LoginForm() {
  const theme: string = useContext(ThemeContext);

  const router = useRouter();
  const { setSession } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setFormError(null);
      try {
        const result = await loginMutation({
          variables: {
            input: {
              email: values.email,
              password: values.password,
            },
          },
        });

        const payload = result.data?.login;
        if (!payload) {
          setFormError("Login failed");
          return;
        }

        await setSession(payload.accessToken, {
          id: payload.user.id,
          email: payload.user.email,
          role: payload.user.role,
        });

        router.push("/tasks");
      } catch {
        setFormError("Invalid email or password");
      }
    },
  });

  const slotProps = {
    // inputLabel: {
    //   sx: {
    //     color: theme === "dark" ? "#ffffff" : "green",
    //   },
    // },
    input: {
      sx: {
        color: theme === "dark" ? "var(--foreground)" : "var(--background)",
        backgroundColor: theme === "dark" ? "#363636" : "#ffffff",
        borderRadius: "5px",
        // "& fieldset": { border: "1px solid #1d1d1d" },
        // "&:hover fieldset": { border: "1px solid #1d1d1d" },
        // "&.Mui-focused fieldset": { border: "1px solid #1d1d1d" },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#1d1d1d",
          borderWidth: "1px",
        },
        // "&:hover .MuiOutlinedInput-notchedOutline": {
        //   borderColor: "#1d1d1d",
        // },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          // borderColor: "#1d1d1d",
          borderColor:
            theme === "dark" ? "var(--foreground)" : "var(--background)",
          borderWidth: "2px",
        },
        "&.Mui-error .MuiOutlinedInput-notchedOutline": {
          borderColor: "#d32f2f",
          color: "#d32f2f",
        },
        "&.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline": {
          // borderColor: "#d32f2f",
        },
      },
    },
    inputLabel: {
      sx: {
        color: theme === "dark" ? "var(--foreground)" : "var(--background)",
        "&.Mui-focused": {
          // position: "relative",
          // left: "-7px",
          // top: "28px",
          // width: "fit-content",
          padding: "1px 2px",
          borderRadius: "5px",
          // backgroundColor: theme === "dark" ? "#363636" : "#ffffff",
          color: theme === "dark" ? "var(--foreground)" : "var(--background)",
        },
        "&.Mui-error.Mui-focused": {
          // borderColor: "#d32f2f",
          backgroundColor: "#d32f2f",
          // color: theme === "dark" ? "var(--foreground)" : "var(--background)",
          color: "var(--foreground)",
          // color: "#d32f2f",
        },
      },
    },
    formHelperText: {
      sx: {
        backgroundColor: "transparent",
        mx: 0,
      },
    },
  };

  return (
    <Grid size={12}>
      <h1
        style={{
          margin: "0 10px",
          padding: "20px 10px 10px",
          textAlign: "center",
        }}
      >
        Login
      </h1>

      <form data-testid="login-form" onSubmit={formik.handleSubmit}>
        <Grid
          container
          spacing={2}
          direction="column"
          size={12}
          sx={{
            padding: "10px",
            alignItems: "center",
          }}
        >
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
            <TextField
              slotProps={slotProps}
              fullWidth
              data-testid="login-email"
              label="Email"
              name="email"
              type="email"
              value={formik.values.email}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
            <TextField
              slotProps={slotProps}
              fullWidth
              data-testid="login-password"
              label="Password"
              name="password"
              type="password"
              value={formik.values.password}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
          </Grid>

          {formError ? (
            <Grid size={12}>
              <Typography color="error" data-testid="login-error">
                {formError}
              </Typography>
            </Grid>
          ) : null}

          <Grid
            container
            size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
            sx={{ justifyContent: "flex-end" }}
          >
            <Btn
              data-testid="login-submit"
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </Btn>
          </Grid>
        </Grid>
      </form>
    </Grid>
  );
}
