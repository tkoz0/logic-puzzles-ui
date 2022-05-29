import CSS from "csstype";

const DEFAULT_CELL_HEIGHT = 50;
const DEFAULT_CELL_WIDTH  = 50;
const DEFAULT_TABLE_STYLE: CSS.Properties = {
    border: "5px solid green",
    borderCollapse: "collapse",
    fontSize: "2em",
    fontFamily: "sans-serif",
    margin: "50px",
    textAlign: "center"
};

const DEFAULT_BORDER_THIN  = 1;
const DEFAULT_BORDER_THICK = 5;

export {DEFAULT_CELL_HEIGHT, DEFAULT_CELL_WIDTH, DEFAULT_TABLE_STYLE,
        DEFAULT_BORDER_THIN, DEFAULT_BORDER_THICK};
