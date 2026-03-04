import { Button, Grid, TextField } from "@mui/material";
import { useFormik } from "formik";

export default function Form() {
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid
        container
        spacing={2}
        direction={"column"}
        size={12}
        sx={{ padding: "10px" }}
      >
        <Grid size={12}>
          <TextField
            label="Name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            label="Email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            label="Password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
          />
        </Grid>
        <Grid size={12}>
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </Grid>
      </Grid>
      {/* <input
        type="text"
        name="name"
        value={formik.values.name}
        onChange={formik.handleChange}
      />
      <input
        type="email"
        name="email"
        value={formik.values.email}
        onChange={formik.handleChange}
      />
      <input
        type="password"
        name="password"
        value={formik.values.password}
        onChange={formik.handleChange}
      />
      <button type="submit">Submit</button> */}
    </form>
  );
}
