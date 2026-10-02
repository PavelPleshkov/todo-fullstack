import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";

export default function Footer() {
  const theme = useContext(ThemeContext);
  return (
    <div className={`footer footer-${theme}`} data-testid="footer">
      React, TS, Next.js, Nest.js, PostgreSQL, Formik with Yup, RTL, Jest,
      GraphQL, AI, App Router, optimization, JWT Authentication, RBAC
      (Role-Based Access Control) with permissions
    </div>
  );
}
