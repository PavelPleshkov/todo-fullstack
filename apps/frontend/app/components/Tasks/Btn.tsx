import { ThemeContext } from "@/app/ThemeContext";
import { Button } from "@mui/material";
import { useContext } from "react";
import { SxProps } from "@mui/material";
import { ButtonProps } from "@mui/material";

interface BtnProps extends ButtonProps {
  disabled?: boolean;
  onClick: () => void;
  sx?: SxProps;
  title?: string;
  variant: ButtonProps["variant"];
  children: React.ReactNode;
}

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
  variant = "contained",
  children,
}: BtnProps): React.ReactNode {
  const theme: string = useContext(ThemeContext);
  const className: string = "btn-" + theme;

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
