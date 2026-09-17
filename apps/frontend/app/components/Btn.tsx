import { ThemeContext } from "@/app/ThemeContext";
import { memo, useContext } from "react";
import { Button, type ButtonProps, type SxProps } from "@mui/material";

interface BtnProps extends ButtonProps {
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  sx?: SxProps;
  title?: string;
  variant: ButtonProps["variant"];
  children: React.ReactNode;
}

const DEFAULT_SX: SxProps = {
  // transition: "0.3s",
  // ":hover": {
  //   color: "#9c1a1a",
  // },
};

export default memo(function Btn({
  className,
  disabled = false,
  onClick,
  sx,
  title,
  variant,
  children,
  ...rest
}: BtnProps): React.ReactNode {
  const theme: string = useContext(ThemeContext);
  // const className: string = "btn-" + theme;
  const resultSx: SxProps =
    sx == null ? DEFAULT_SX : ([DEFAULT_SX, sx] as SxProps);

  return (
    <Button
      title={title}
      className={["btn", `btn-${theme}`, className].filter(Boolean).join(" ")}
      // className={`btn btn-${theme} ${className}`}
      disabled={disabled}
      onClick={onClick}
      sx={resultSx}
      variant={variant}
      // set to true to prevent the ripple effect and double rendering of the button
      disableRipple={false}
      {...rest}
    >
      {children}
    </Button>
  );
});
