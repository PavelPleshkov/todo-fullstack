import { Stack } from "@mui/material";
import Stopwatch from "./Stopwatch/Stopwatch";
import Tasks from "./Tasks/Tasks";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";

export default function Content() {
  const theme = useContext(ThemeContext);
  const className = "content-" + theme;

  return (
    <div className={className}>
      <Stack spacing={2}>
        <Stopwatch />

        <Tasks />
      </Stack>
    </div>
  );
}
