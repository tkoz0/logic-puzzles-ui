import {forwardRef, ReactElement, useEffect, useImperativeHandle, useState} from "react";
import CSS from "csstype";
import GridTable from "./GridTable";
import {in2DArray, range} from "../utils/ArrayUtils";

interface PuzzleCellGridHandle {
    // main data and styles
    getData: () => ReactElement[][],
    setData: (newData: ReactElement[][]) => void,
    getStyles: () => CSS.Properties[][],
    setStyles: (newStyles: CSS.Properties[][]) => void,
    // main internal representation
    getFullData: () => ReactElement[][],
    getFullStyles: () => CSS.Properties[][],
    // selected cell
    getSelection: () => [number,number],
    setSelection: (r: number, c: number) => void,
    // labels data
    getLabelsLdata: () => ReactElement[][],
    getLabelsRdata: () => ReactElement[][],
    getLabelsTdata: () => ReactElement[][],
    getLabelsBdata: () => ReactElement[][],
    setLabelsLdata: (newLabels: ReactElement[][]) => void,
    setLabelsRdata: (newLabels: ReactElement[][]) => void,
    setLabelsTdata: (newLabels: ReactElement[][]) => void,
    setLabelsBdata: (newLabels: ReactElement[][]) => void,
    // labels styles
    getLabelsLstyles: () => CSS.Properties[][],
    getLabelsRstyles: () => CSS.Properties[][],
    getLabelsTstyles: () => CSS.Properties[][],
    getLabelsBstyles: () => CSS.Properties[][],
    setLabelsLstyles: (newStyles: CSS.Properties[][]) => void,
    setLabelsRstyles: (newStyles: CSS.Properties[][]) => void,
    setLabelsTstyles: (newStyles: CSS.Properties[][]) => void,
    setLabelsBstyles: (newStyles: CSS.Properties[][]) => void
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
    // arrays passed from parent to allow changing
    const [puzzleData,setPuzzleData] = useState(props.data);
    const [puzzleStyles,setPuzzleStyles] = useState(props.styles);
    const [labelsLdata, setLabelsLdata] = useState(props.labelsLdata ?? []);
    const [labelsRdata, setLabelsRdata] = useState(props.labelsRdata ?? []);
    const [labelsTdata, setLabelsTdata] = useState(props.labelsTdata ?? []);
    const [labelsBdata, setLabelsBdata] = useState(props.labelsBdata ?? []);
    const [labelsLstyles, setLabelsLstyles] = useState(props.labelsLstyles ?? []);
    const [labelsRstyles, setLabelsRstyles] = useState(props.labelsRstyles ?? []);
    const [labelsTstyles, setLabelsTstyles] = useState(props.labelsTstyles ?? []);
    const [labelsBstyles, setLabelsBstyles] = useState(props.labelsBstyles ?? []);

    /**
     * @returns 2d array of elements for the table cells
     */
    const buildData = (): ReactElement[][] => range(fR).map(r => range(fC).map(c => {
        const [gr,gc] = [r-lT,c-lL];
        if (in2DArray(gr,gc,R,C))
            return puzzleData[gr][gc];
        else if (r < lT) {
            if (c < lL) return <></>; // top left corner
            else if (gc >= C) return <></> // top right corner
            else return labelsTdata?.[r][gc] ?? <></>; // top labels
        } else if (gr >= R) {
            if (c < lL) return <></>; // bottom left corner
            else if (gc >= C) return <></>; // top right corner
            else return labelsBdata?.[gr-R][gc] ?? <></>; // bottom labels
        } else { // middle section
            if (c < lL) return labelsLdata?.[c][gr] ?? <></>; // left labels
            else return labelsRdata?.[gc-C][gr] ?? <></>; // right labels
        }
    }));

    /**
     * @returns 2d array of styles for the table cells
     */
    const buildStyles = (): CSS.Properties[][] => range(fR).map(r => range(fC).map(c => {
        const [gr,gc] = [r-lT,c-lL]; // coordinates in the puzzle grid
        let baseStyle = {
            height: (props.heightpx ?? 50)+"px",
            width:  (props.widthpx  ?? 50)+"px"
        }
        if (in2DArray(gr,gc,R,C))
            return {
                ...baseStyle,
                ...puzzleStyles[gr][gc]
            };
        else if (r < lT) {
            if (c < lL) return baseStyle;
            else if (gc >= C) return baseStyle;
            else return labelsTstyles?.[r][gc] ?? baseStyle;
        } else if (gr >= R) {
            if (c < lL) return baseStyle;
            else if (gc >= C) return baseStyle;
            else return labelsBstyles?.[gr-R][gc] ?? baseStyle;
        } else {
            if (c < lL) return labelsLstyles?.[c][gr] ?? baseStyle;
            else return labelsRstyles?.[gc-C][gr] ?? baseStyle;
        }
    }));

    // state for the GridTable component
    const [selected,setSelected] = useState<[number,number]>([-1,-1]);
    const [data,setData] = useState<ReactElement[][]>(buildData());
    const [styles,setStyles] = useState<CSS.Properties[][]>(buildStyles());

    /**
     * Change selected cell. Uses coordinates of the puzzle (ignoring labels).
     * Passing the currently selected coordinates will unselect it.
     * @param pr row
     * @param pc column
     */
    const changeSelection = (pr: number, pc: number) => {
        let r = pr;
        let c = pc;
        const [sr,sc] = selected;
        if (r === sr && c === sc) {
            r = -1;
            c = -1;
        }
        // function to make empty styles for when label selection styles are not defined
        const noStyle = (_r: number, _c: number) =>
            range(Math.max(lL,lR,lT,lB)).map(_n => ({}));
        const newStyles = buildStyles();
        if (in2DArray(r,c,R,C)) {
            newStyles[lT+r][lL+c] = {
                ...newStyles[lT+r][lL+c],
                ...props.getSelectStyle(r,c)
            }
            const sL = (props.getSelectStylesL ?? noStyle)(r,c);
            const sR = (props.getSelectStylesR ?? noStyle)(r,c);
            const sT = (props.getSelectStylesT ?? noStyle)(r,c);
            const sB = (props.getSelectStylesB ?? noStyle)(r,c);
            for (let i = 0; i < lL; ++i)
                newStyles[lT+r][i] = {
                    ...newStyles[lT+r][i],
                    ...sL[i]
                }
            for (let i = 0; i < lR; ++i)
                newStyles[lT+r][lL+C+i] = {
                    ...newStyles[lT+r][lL+C+i],
                    ...sR[i]
                }
            for (let i = 0; i < lT; ++i)
                newStyles[i][lL+c] = {
                    ...newStyles[i][lL+c],
                    ...sT[i]
                }
            for (let i = 0; i < lB; ++i)
                newStyles[lT+R+i][lL+c] = {
                    ...newStyles[lT+R+i][lL+c],
                    ...sB[i]
                }
        }
        setSelected([r,c]);
        setStyles(newStyles);
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
        return () =>  document.removeEventListener("keydown",keyEvent);
    });

    useImperativeHandle(ref, () => ({
        getData: () => puzzleData,
        setData: (newData: ReactElement[][]) => {
            console.assert(newData.length === R && newData[0].length === C,
                "PuzzleCellGrid.setData(): incorrect data size");
            setPuzzleData(newData);
            setData(buildData());
        },
        getStyles: () => puzzleStyles,
        setStyles: (newStyles: CSS.Properties[][]) => {
            console.assert(newStyles.length === R && newStyles[0].length === C,
                "PuzzleCellGrid.setStyles(): incorrect styles size");
            setPuzzleStyles(newStyles);
            setStyles(buildStyles());
        },
        getFullData: () => data,
        getFullStyles: () => styles,
        getSelection: () => selected,
        setSelection: (r: number, c: number) => changeSelection(r,c),
        getLabelsLdata: () => labelsLdata,
        getLabelsRdata: () => labelsRdata,
        getLabelsTdata: () => labelsTdata,
        getLabelsBdata: () => labelsBdata,
        setLabelsLdata: (newLabels: ReactElement[][]) => {
            console.assert(newLabels.length === lL && newLabels[0].length === R,
                "PuzzleCellGrid.setLabelsLdata(): incorrect labels size");
            setLabelsLdata(newLabels);
            setData(buildData());
        },
        setLabelsRdata: (newLabels: ReactElement[][]) => {
            console.assert(newLabels.length === lR && newLabels[0].length === R,
                "PuzzleCellGrid.setLabelsRdata(): incorrect labels size");
            setLabelsRdata(newLabels);
            setData(buildData());
        },
        setLabelsTdata: (newLabels: ReactElement[][]) => {
            console.assert(newLabels.length === lT && newLabels[0].length === C,
                "PuzzleCellGrid.setLabelsTdata(): incorrect labels size");
            setLabelsTdata(newLabels);
            setData(buildData());
        },
        setLabelsBdata: (newLabels: ReactElement[][]) => {
            console.assert(newLabels.length === lB && newLabels[0].length === C,
                "PuzzleCellGrid.setLabelsBdata(): incorrect labels size");
            setLabelsBdata(newLabels);
            setData(buildData());
        },
        getLabelsLstyles: () => labelsLstyles,
        getLabelsRstyles: () => labelsRstyles,
        getLabelsTstyles: () => labelsTstyles,
        getLabelsBstyles: () => labelsBstyles,
        setLabelsLstyles: (newStyles: CSS.Properties[][]) => {
            console.assert(newStyles.length === lL && newStyles[0].length === R,
                "PuzzleCellGrid.setLabelsLdata(): incorrect labels size");
            setLabelsLstyles(newStyles);
            setStyles(buildStyles());
        },
        setLabelsRstyles: (newStyles: CSS.Properties[][]) => {
            console.assert(newStyles.length === lR && newStyles[0].length === R,
                "PuzzleCellGrid.setLabelsRdata(): incorrect labels size");
            setLabelsRstyles(newStyles);
            setStyles(buildStyles());
        },
        setLabelsTstyles: (newStyles: CSS.Properties[][]) => {
            console.assert(newStyles.length === lT && newStyles[0].length === C,
                "PuzzleCellGrid.setLabelsTdata(): incorrect labels size");
            setLabelsTstyles(newStyles);
            setStyles(buildStyles());
        },
        setLabelsBstyles: (newStyles: CSS.Properties[][]) => {
            console.assert(newStyles.length === lB && newStyles[0].length === C,
                "PuzzleCellGrid.setLabelsBdata(): incorrect labels size");
            setLabelsBstyles(newStyles);
            setStyles(buildStyles());
        }
    }));

    return (
        <GridTable
            data={data}
            cellClick={props.cellClick ?? ((r,c) => {
                if (in2DArray(r-lT,c-lL,R,C)) // only respond to clicks in the puzzle area
                    changeSelection(r-lT,c-lL);
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
export type {PuzzleCellGridHandle};
