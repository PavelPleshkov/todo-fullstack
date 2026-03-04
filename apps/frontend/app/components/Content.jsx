import { Stack } from "@mui/material";
import Stopwatch from "./Stopwatch/Stopwatch";
import Tasks from "./Tasks/Tasks";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import Form from "./Form/Form";

export default function Content() {
  const theme = useContext(ThemeContext);
  const className = "content-" + theme;

  return (
    <div className={"content " + className}>
      <Stack spacing={2}>
        <Stopwatch />
        <Form />
        <Tasks />
      </Stack>
    </div>
  );
}
