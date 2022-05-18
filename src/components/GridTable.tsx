import {FC, ReactElement} from "react";
import CSS from "csstype";

interface Props {
    cellClick: (r: number, c: number) => void, // click action given coordinates
    data: ReactElement[][], // m*n, elements to go in the table cells
    styles: CSS.Properties[][], // m*n, style of individual cells
    tableStyle?: CSS.Properties // styles to apply to the table element
}

/**
 * Component to render an HTML table of size R*C with styles given to the cells
 * and grid, along with a click action for cells based on the coordinate.
 */
const GridTable: FC<Props> = props => {
    console.assert(props.data.length > 0 && props.data[0].length > 0,
        "GridTable: empty data");
    console.assert(props.styles.length === props.data.length
        && props.styles[0].length === props.data[0].length,
        "GridTable: mismatched data and styles sizes");
    return (
        <table style={props.tableStyle}><tbody>
            {props.data.map((row,r) =>
                <tr key={r}>
                    {row.map((cell,c) =>
                        <td key={c} style={props.styles[r][c]} onClick={() => {
                                props.cellClick(r,c);
                        }}>
                            {cell}
                        </td>
                    )}
                </tr>
            )}
        </tbody></table>
    );
};

export default GridTable;
