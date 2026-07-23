import { ThemeContext } from "@/app/ThemeContext";
import Btn from "./Btn";
import { useContext } from "react";

interface SearchProps {
  searchValue: string;
  clearSearch: () => void;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Search({
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
          border: "1px solid #1d1d1d",
          outlineColor: "#1d1d1d",
          borderRadius: "5px",
          flex: 1,
          width: "auto",
          minWidth: 0,
          display: "block",
          padding: "10px",
          boxSizing: "border-box",
        }}
        aria-label="Search"
        name="search"
        id="search"
        value={searchValue}
        type="text"
        placeholder="Search"
        onChange={handleSearch}
      />
      <Btn
        variant="contained"
        sx={{ textWrap: "nowrap" }}
        onClick={clearSearch}
      >
        Clear search
      </Btn>
    </>
  );
}
