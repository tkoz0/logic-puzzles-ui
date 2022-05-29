import {FC, ReactElement} from "react";
import CSS from "csstype";

interface Props {
    // contents and style
    data: ReactElement[][], // m*n, elements to go in the table cells
    styles: CSS.Properties[][], // m*n, style of individual cells
    tableStyle?: CSS.Properties, // styles to apply to the table element
    // click actions given cell coordinate
    leftClick?:   (r: number, c: number, e: React.MouseEvent) => void,
    rightClick?:  (r: number, c: number, e: React.MouseEvent) => void,
    doubleClick?: (r: number, c: number, e: React.MouseEvent) => void,
    middleClick?: (r: number, c: number, e: React.MouseEvent) => void,
    allowContextMenu?: boolean // context menu from right click
}

/**
 * Component to render an HTML table of size R*C with styles given to the cells
 * and grid, along with click actions for cells based on the coordinate.
 */
const BaseTable: FC<Props> = props => {
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
                        <td key={c} style={props.styles[r][c]}
                            onClick={e => props.leftClick?.(r,c,e)}
                            onContextMenu={e => {
                                console.log(props.allowContextMenu);
                                if (!props.allowContextMenu)
                                    e.preventDefault();
                                props.rightClick?.(r,c,e);
                            }}
                            onDoubleClick={e => props.doubleClick?.(r,c,e)}
                            onAuxClick={e => {
                                if (e.button === 1)
                                    props.middleClick?.(r,c,e);
                            }}
                        >
                            {cell}
                        </td>
                    )}
                </tr>
            )}
        </tbody></table>
    );
};

export default BaseTable;
