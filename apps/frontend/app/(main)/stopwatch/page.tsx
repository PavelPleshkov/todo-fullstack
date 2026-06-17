import type { Metadata } from "next";
import Stopwatch from "@/app/components/Stopwatch/Stopwatch";

export const metadata: Metadata = {
  title: "Stopwatch",
};

export default function StopwatchPage() {
  return <Stopwatch />;
}
