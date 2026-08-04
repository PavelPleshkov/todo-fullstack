"use client";

import { Button, Grid, TextField, Typography } from "@mui/material";
import { useMutation } from "@apollo/client/react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import * as yup from "yup";
import { useAuth } from "@/app/AuthContext";
import { LOGIN_MUTATION } from "@/app/lib/graphql/operations";
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
  const classNameLoginBtn: string = "login-btn login-btn-" + theme;

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

        setSession(payload.accessToken, {
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

  return (
    <Grid size={12}>
      <h1 style={{ margin: "0 10px", padding: "10px 10px" }}>Login</h1>

      <form data-testid="login-form" onSubmit={formik.handleSubmit}>
        <Grid
          container
          spacing={2}
          direction="column"
          size={12}
          sx={{ padding: "10px" }}
        >
          <Grid size={6}>
            <TextField
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

          <Grid size={6}>
            <TextField
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

          <Grid size={12}>
            <Button
              className={classNameLoginBtn}
              data-testid="login-submit"
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Grid>
  );
}
