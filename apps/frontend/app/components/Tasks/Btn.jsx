import { ThemeContext } from "@/app/ThemeContext";
import { Button } from "@mui/material";
import { useContext } from "react";

export default function Btn({
  disabled = false,
  onClick,
  sx = {
    transition: "0.3s",
    ":hover": {
      color: "#9c1a1a",
    },
  },
  title,
  variant,
  children,
}) {
  const theme = useContext(ThemeContext);
  const className = "btn-" + theme;
  return (
    <Button
      title={title}
      className={className}
      disabled={disabled}
      onClick={onClick}
      sx={sx}
      variant={variant}
    >
      {children}
    </Button>
  );
}
