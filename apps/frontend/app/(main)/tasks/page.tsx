import type { Metadata } from "next";
import Tasks from "@/app/components/Tasks/Tasks";

export const metadata: Metadata = {
  title: "Tasks",
};

export default function TasksPage() {
  return <Tasks />;
}
