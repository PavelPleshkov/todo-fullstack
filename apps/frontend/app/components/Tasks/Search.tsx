import { ThemeContext } from "@/app/ThemeContext";
import Btn from "./Btn";
import { useContext } from "react";

interface SearchProps {
  disabled: boolean;
  searchValue: string;
  clearSearch: () => void;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Search({
  disabled,
  searchValue,
  clearSearch,
  handleSearch,
}: SearchProps) {
  const theme: string = useContext(ThemeContext);

  return (
    <>
      <input
        style={{
          backgroundColor: theme === "dark" ? "#363636" : "#ffffff",
          border: disabled ? "1px solid transparent" : "1px solid #1d1d1d",
          outlineColor: "#1d1d1d",
          borderRadius: "5px",
          flex: 1,
          width: "auto",
          minWidth: 0,
          display: "block",
          padding: "10px",
          boxSizing: "border-box",
          cursor: disabled ? "not-allowed" : "auto",
          opacity: disabled ? 0.7 : 1,
        }}
        disabled={disabled}
        aria-label="Search"
        name="search"
        id="search"
        value={searchValue}
        type="text"
        placeholder={disabled ? "Search forbidden" : "Search"}
        onChange={handleSearch}
      />
      <Btn
        disabled={disabled}
        variant="contained"
        sx={{
          textWrap: "nowrap",
        }}
        onClick={clearSearch}
      >
        Clear search
      </Btn>
    </>
  );
}
