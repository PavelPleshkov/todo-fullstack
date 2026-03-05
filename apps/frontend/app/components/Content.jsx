import { Stack } from "@mui/material";
import Stopwatch from "./Stopwatch/Stopwatch";
import Tasks from "./Tasks/Tasks";
import { useContext, useState } from "react";
import { ThemeContext } from "../ThemeContext";
import Form from "./Form/Form";

export default function Content() {
  const theme = useContext(ThemeContext);
  const className = "content-" + theme;
  // const [isSignedIn, setIsSignedIn] = useState(false);

  return (
    <div className={"content " + className}>
      <Stack spacing={2}>
        {/* {isSignedIn && <Stopwatch />} */}
        <Stopwatch />
        {/* <Form setIsSignedIn={setIsSignedIn} /> */}
        <Form />
        {/* {isSignedIn && <Tasks />} */}
        <Tasks />
      </Stack>
    </div>
  );
}
