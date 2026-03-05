import { Button, Grid, TextField } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";

const validationSchema = yup.object({
  name: yup
    .string()
    .matches(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces")
    .required("Name is required"),
  password: yup
    .string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number",
    )
    .min(4, "Password must be at least 4 characters")
    .required("Password is required"),
});

const trickyWords = ["boy", "day", "cat", "dog", "girl", "password"];

export default function Form({ setIsSignedIn }) {
  const formik = useFormik({
    initialValues: {
      name: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
      setIsSignedIn(true);
    },
  });

  const isValid = (password) => {
    if (!/[a-z]+/g.test(password)) return false;
    if (!/[A-Z]+/g.test(password)) return false;
    if (!/[\d]+/g.test(password)) return false;
    if (password.length < 4) return false;

    for (const trickyWord of trickyWords) {
      if (password.includes(trickyWord)) {
        return false;
      }
    }
    return true;
  };

  return (
    <form enableReinitialize={false} onSubmit={formik.handleSubmit}>
      <Grid
        container
        spacing={2}
        direction={"column"}
        size={12}
        sx={{ padding: "10px" }}
      >
        <Grid size={6}>
          <TextField
            label="Name"
            name="name"
            value={formik.values.name}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            type="text"
          />
        </Grid>
        <Grid size={6}>
          <TextField
            label="Password"
            name="password"
            value={formik.values.password}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            type="password"
          />
        </Grid>
        <Grid size={12}>
          <div>
            {String(isValid(formik.values.password))
              ? "You can sign up with this password"
              : "You cannot sign up with this password"}
          </div>

          <Button type="submit" variant="contained">
            Submit
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
