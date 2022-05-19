import {forwardRef, ReactElement, useEffect, useImperativeHandle, useState} from "react";
import CSS from "csstype";
import GridTable from "./GridTable";
import {in2DArray, range} from "../utils/ArrayUtils";

interface PuzzleCellGridHandle {
    // main internal representation
    getFullData: () => ReactElement[][],
    getFullStyles: () => CSS.Properties[][],
    // update data when passed properties change
    updateData: () => void,
    updateStyles: () => void,
    // selected cell
    getSelected: () => [number,number],
    setSelected: (r: number, c: number) => void,
}

interface Props {
    data: ReactElement[][], // cell contents (R*C)
    styles: CSS.Properties[][], // cell styles (R*C)
    getSelectStyle: (r: number, c: number) => CSS.Properties,
    cellWrap?: boolean, // do controls wrap around edges of the grid
    cellClick?: (r: number, c: number) => void, // cell click action
    heightpx?: number, // cell height
    widthpx?: number, // cell width
    tableStyle?: CSS.Properties,
    // label data/styles, number of rows is how many labels (any integers lL,lR,lT,lB)
    // rows and row contents are ordered left to right or top to bottom
    labelsLdata?: ReactElement[][], // lL*R
    labelsLstyles?: CSS.Properties[][],
    getSelectStylesL?: (r: number, c: number) => CSS.Properties[], // lL
    labelsRdata?: ReactElement[][], // lR*R
    labelsRstyles?: CSS.Properties[][],
    getSelectStylesR?: (r: number, c: number) => CSS.Properties[], // lR
    labelsTdata?: ReactElement[][], // lT*C
    labelsTstyles?: CSS.Properties[][],
    getSelectStylesT?: (r: number, c: number) => CSS.Properties[], // lT
    labelsBdata?: ReactElement[][], // lB*C
    labelsBstyles?: CSS.Properties[][],
    getSelectStylesB?: (r: number, c: number) => CSS.Properties[] // lB
    // TODO (R+1)*(C+1) grid for corner points
    // (R+1)*C for horizontal middle points
    // R*(C+1) for vertical middle points
    // more details inside the individual cells
}

/**
 * Extends GridTable with cell sizes and uses strings for data in the cells.
 * Represents a grid logic puzzle with values in the cells. Provides
 * functionality for selecting a cell and entering values. Puzzles can
 * optionally have labels on the sides.
 */
const PuzzleCellGrid = forwardRef<PuzzleCellGridHandle,Props>((props,ref) => {
    console.assert(props.data.length > 0 && props.data[0].length > 0,
        "PuzzleCellGrid: empty data");
    console.assert(props.styles.length === props.data.length
        && props.styles[0].length === props.data[0].length,
        "PuzzleCellGrid: mismatched data and styles sizes");
    // array dimensions
    const R = props.data.length; // rows
    const C = props.data[0].length; // cols
    const lL = props.labelsLdata?.length ?? 0; // number of labels
    const lR = props.labelsRdata?.length ?? 0;
    const lT = props.labelsTdata?.length ?? 0;
    const lB = props.labelsBdata?.length ?? 0;
    const fR = R+lT+lB; // full size of table with labels included
    const fC = C+lL+lR;
    // selected cell
    const [selected,_setSelected] = useState<[number,number]>([-1,-1]);

    /**
     * @returns 2d array of elements for the table cells made from the props
     */
    const buildData = (): ReactElement[][] => range(fR).map(r => range(fC).map(c => {
        const [gr,gc] = [r-lT,c-lL];
        if (in2DArray(gr,gc,R,C))
            return props.data[gr][gc];
        else if (r < lT) {
            if (c < lL) return <></>; // top left corner
            else if (gc >= C) return <></> // top right corner
            else return props.labelsTdata?.[r][gc] ?? <></>; // top labels
        } else if (gr >= R) {
            if (c < lL) return <></>; // bottom left corner
            else if (gc >= C) return <></>; // top right corner
            else return props.labelsBdata?.[gr-R][gc] ?? <></>; // bottom labels
        } else { // middle section
            if (c < lL) return props.labelsLdata?.[c][gr] ?? <></>; // left labels
            else return props.labelsRdata?.[gc-C][gr] ?? <></>; // right labels
        }
    }));

    /**
     * @returns 2d array of styles for the table cells made from the props
     */
    const buildStyles = (): CSS.Properties[][] => range(fR).map(r => range(fC).map(c => {
        const [gr,gc] = [r-lT,c-lL]; // coordinates in the puzzle grid
        let style: CSS.Properties = {
            height: (props.heightpx ?? 50)+"px",
            width:  (props.widthpx  ?? 50)+"px"
        }
        const noStyle = (_r: number, _c: number) =>
            range(Math.max(lL,lR,lT,lB)).map(_n => ({}));
        if (in2DArray(gr,gc,R,C)) {
            style = { // add cell style
                ...style,
                ...props.styles[gr][gc]
            };
            if (gr === selected[0] && gc === selected[1]) // add select style
                return {
                    ...style,
                    ...props.getSelectStyle(gr,gc)
                }
            else
                return style;
        } else if (r < lT) {
            if (c < lL) {} // top left
            else if (gc >= C) {} // top right
            else { // top
                style = { ...style, ...props.labelsTstyles?.[r][gc] }
                if (gc === selected[1]) {
                    let sT = (props.getSelectStylesL ?? noStyle)(gr,gc);
                    style = { ...style, ...sT[r] };
                }
            };
        } else if (gr >= R) {
            if (c < lL) {} // bottom left
            else if (gc >= C) {} // bottom right
            else { // bottom
                style = { ...style, ...props.labelsBstyles?.[gr-R][gc] };
                if (gc === selected[1]) {
                    let sB = (props.getSelectStylesB ?? noStyle)(gr,gc);
                    style = { ...style, ...sB[gr-R] };
                }
            }
        } else {
            if (c < lL) { // left
                style = { ...style, ...props.labelsLstyles?.[c][gr] };
                if (gr === selected[0]) {
                    let sL = (props.getSelectStylesL ?? noStyle)(gr,gc);
                    style = { ...style, ...sL[c] };
                }
            }
            else { // right
                style = { ...style, ...props.labelsRstyles?.[gc-C][gr] };
                if (gr === selected[0]) {
                    let sR = (props.getSelectStylesR ?? noStyle)(gr,gc);
                    style = { ...style, ...sR[gc-C] };
                }
            }
        }
        return style;
    }));

    // state for the GridTable component
    const [data,setData] = useState<ReactElement[][]>(buildData());
    const [styles,setStyles] = useState<CSS.Properties[][]>(buildStyles());

    /**
     * Change selected cell. Uses coordinates of the puzzle (ignoring labels).
     * Passing the currently selected coordinates will unselect it.
     * @param pr row
     * @param pc column
     */
    const changeSelection = (pr: number, pc: number, click?: boolean) => {
        let r = pr;
        let c = pc;
        const [sr,sc] = selected;
        if (click && r === sr && c === sc) { // unselect if same coordinates on click
            r = -1;
            c = -1;
        }
        selected[0] = r;
        selected[1] = c;
        setStyles(buildStyles());
    };

    useEffect(() => {
        /**
         * Respond to arrow keys for navigation in the puzzle. For other keys,
         * use behavior defined specifically for the puzzle.
         * @param e key down event
         */
        const keyEvent = (e: KeyboardEvent) => {
            const [sr,sc] = selected;
            let dr = 0; // position change
            let dc = 0;
            switch (e.key) {
                case "ArrowUp":    dr = -1; break;
                case "ArrowDown":  dr = +1; break;
                case "ArrowLeft":  dc = -1; break;
                case "ArrowRight": dc = +1; break;
                default:
                    console.log('TODO: response to other keys not implemented',e.key)
                    return;
            }
            // arrow key was pressed, update position
            if (!in2DArray(sr,sc,R,C))
                changeSelection(0,0);
            else {
                let nr = sr+dr; // new coordinate
                let nc = sc+dc;
                if (props.cellWrap) {
                    nr = (nr+R)%R;
                    nc = (nc+C)%C;
                }
                // update if position changes
                if (in2DArray(nr,nc,R,C) && (nr !== sr || nc !== sc))
                    changeSelection(((sr+dr+R)%R),(sc+dc+C)%C);
            }
        }
        document.addEventListener("keydown",keyEvent);
        return () => document.removeEventListener("keydown",keyEvent);
    });

    useImperativeHandle(ref, () => ({
        getFullData: () => data,
        getFullStyles: () => styles,
        getSelected: () => selected,
        setSelected: (r,c) => changeSelection(r,c),
        updateData: () => setData(buildData()),
        updateStyles: () => setStyles(buildStyles())
    }));

    return (
        <GridTable
            data={data}
            cellClick={props.cellClick ?? ((r,c) => {
                if (in2DArray(r-lT,c-lL,R,C)) // only respond to clicks in the puzzle area
                    changeSelection(r-lT,c-lL,true);
            })}
            tableStyle={props.tableStyle ?? {
                borderCollapse: "collapse",
                fontSize: "2em",
                fontFamily: "sans-serif",
                textAlign: "center"
            }}
            styles={styles}
        />
    );
});

export default PuzzleCellGrid;
export type {PuzzleCellGridHandle, Props as PuzzleCellGridProps};
