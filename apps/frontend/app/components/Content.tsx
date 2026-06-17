import { Grid } from "@mui/material";
import Stopwatch from "./Stopwatch/Stopwatch";
import Tasks from "./Tasks/Tasks";
import { useContext } from "react";

import { ThemeContext } from "../ThemeContext";
import Form from "./Form/Form";

export default function Content(): React.ReactNode {
  const theme: string = useContext(ThemeContext);
  const className: string = "content-" + theme;

  return (
    <div className={"content " + className} data-testid="content">
      <Grid container direction={"column"} spacing={2}>
        <Stopwatch />
        <Form />
        <Tasks />
      </Grid>
    </div>
  );
}
