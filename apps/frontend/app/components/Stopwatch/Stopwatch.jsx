"use client";

import { Button, Grid } from "@mui/material";
import { memo, useCallback, useEffect, useRef, useState } from "react";

const RunBtn = memo(function RunBtn({
  isRunning,
  isDisabled,
  setIsRunning,
  children,
}) {
  return (
    <Button
      disabled={isDisabled}
      onClick={() => {
        setIsRunning(!isRunning);
      }}
      sx={
        !isRunning
          ? {
              width: "100px",
              color: "#ffffff",
              borderRadius: "5px",
              padding: "15px",
            }
          : {
              width: "100px",
              color: "#ffffff",
              bgcolor: "#940000",
              borderRadius: "5px",
              padding: "15px",
            }
      }
      variant="contained"
    >
      {children}
    </Button>
  );
});

const ResetBtn = memo(function ResetBtn({ handleResetBtn, children }) {
  return (
    <Button
      onClick={handleResetBtn}
      sx={{
        width: "100px",
        borderRadius: "5px",
        padding: "15px",
      }}
      variant="contained"
    >
      {children}
    </Button>
  );
});

const StopwatchControl = memo(function StopwatchControl({
  isRunning,
  isDisabled,
  setIsRunning,
  handleResetBtn,
}) {
  console.log("🔄 StopwatchControl render");
  return (
    <Grid container padding={"10px"} spacing={2}>
      <RunBtn
        isRunning={isRunning}
        isDisabled={isDisabled}
        setIsRunning={setIsRunning}
      >
        {isRunning ? "Stop" : "Run"}
      </RunBtn>
      <ResetBtn handleResetBtn={handleResetBtn}>Reset</ResetBtn>
    </Grid>
  );
});

export default function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const timeRef = useRef(0);

  async function stopTime(timeId) {
    clearInterval(timeId);
    await setIsRunning(false);
    return;
  }

  useEffect(() => {
    if (isRunning && minutes < 60) {
      timeRef.current = +setInterval(() => {
        if (minutes === 59 && seconds === 59) {
          stopTime(timeRef.current);
          setHours(1);
          setMinutes(0);
          setSeconds(0);
          setIsDisabled(true);
          console.log(`1 hour left at ${new Date().toLocaleTimeString()}`);
        } else if (seconds === 59) {
          setSeconds(0);
          setMinutes((m) => m + 1);
        } else {
          setSeconds((s) => s + 1);
        }
      }, 1000);
    } else {
      if (minutes === 60) {
        stopTime(timeRef.current);
        setIsDisabled(true);
        console.log("else effect");
      }
    }

    return () => {
      clearInterval(timeRef.current);
    };
  }, [isRunning, seconds, minutes]);

  const handleResetBtn = useCallback(() => {
    console.log("🔄 StopwatchControl render");
    setHours(0);
    setSeconds(0);
    setMinutes(0);
    stopTime(timeRef.current);
    setIsDisabled(false);
  }, []);

  return (
    <div>
      <div style={{ padding: "10px" }}>
        Stopwatch: {"0" + hours.toFixed(0)}
        {" : "}
        {minutes > 9 && minutes < 60
          ? minutes.toFixed(0)
          : "0" + minutes.toFixed(0)}
        {" : "}
        {seconds > 9 && seconds < 60
          ? seconds.toFixed(0)
          : "0" + seconds.toFixed(0)}
      </div>
      {/* <div>{time.toLocaleTimeString()}</div> */}
      <StopwatchControl
        isRunning={isRunning}
        isDisabled={isDisabled}
        setIsRunning={setIsRunning}
        handleResetBtn={handleResetBtn}
      />
    </div>
  );
}
