import type { Metadata } from "next";
import Form from "@/app/components/Form/Form";

export const metadata: Metadata = {
  title: "Form",
};

export default function FormPage() {
  return <Form />;
}
