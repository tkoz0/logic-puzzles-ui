import React, {ForwardedRef, forwardRef, ReactElement, useImperativeHandle, useState} from "react";
import CSS from "csstype";
import BaseTable from "./BaseTable";
import {in2DArray, range} from "../../../utils/ArrayUtils";
import {DEFAULT_CELL_HEIGHT, DEFAULT_CELL_WIDTH, DEFAULT_TABLE_STYLE} from "../../../utils/Constants";

interface Handle {
    // main internal representation
    getFullData:   () => ReactElement[][],
    getFullStyles: () => CSS.Properties[][],
    // update data when passed properties change
    updateData:    () => void,
    updateStyles:  () => void
}

interface Props {
    rows: number, // R
    cols: number, // C
    heightpx?: number, // cell height
    widthpx?:  number, // cell width
    getData:  (r: number, c: number) => ReactElement,
    getStyle: (r: number, c: number) => CSS.Properties,
    tableStyle?: CSS.Properties,
    // click actions
    leftClick?:   (r: number, c: number) => void,
    rightClick?:  (r: number, c: number) => void,
    middleClick?: (r: number, c: number) => void,
    doubleClick?: (r: number, c: number) => void,
    allowContextMenu?: boolean,
    // label data/styles for left (L), right (R), top (T), bottom (B)
    // example: lL >= 0 labels per row, indexed by [0,lL) x [0,R)
    // label number (l) is ordered from left to right or top to bottom
    // the row or column specified is the row or column it is a label for
    labelsL?:   number, // lL*R
    getLData?:  (l: number, r: number) => ReactElement,
    getLStyle?: (l: number, r: number) => CSS.Properties,
    labelsR?:   number, // lR*R
    getRData?:  (l: number, r: number) => ReactElement,
    getRStyle?: (l: number, r: number) => CSS.Properties,
    labelsT?:   number, // lT*C
    getTData?:  (l: number, c: number) => ReactElement,
    getTStyle?: (l: number, c: number) => CSS.Properties,
    labelsB?:   number, // lB*C
    getBData?:  (l: number, c: number) => ReactElement,
    getBStyle?: (l: number, c: number) => CSS.Properties,
    // corner data/styles for up left (UL), up right (UR), low left (LL), low right (LR)
    // these are ordered in standard 2d grid orientation
    // example: [0,lL) x [0,lT) for upper left
    getULData?:  (r: number, c: number) => ReactElement, // lL*lT
    getULStyle?: (r: number, c: number) => CSS.Properties,
    getURData?:  (r: number, c: number) => ReactElement, // lR*lT
    getURStyle?: (r: number, c: number) => CSS.Properties,
    getLLData?:  (r: number, c: number) => ReactElement, // lL*lB
    getLLStyle?: (r: number, c: number) => CSS.Properties,
    getLRData?:  (r: number, c: number) => ReactElement, // lR*lB
    getLRStyle?: (r: number, c: number) => CSS.Properties
    // TODO (R+1)*(C+1) grid for corner points
    // (R+1)*C for horizontal middle points
    // R*(C+1) for vertical middle points
    // more details inside the individual cells
}

/**
 * Extends BaseTable with puzzle functionality to manage the grid and optional
 * labels on the sides.
 */
const PuzzleGrid = (props: Props, ref: ForwardedRef<Handle>) => {
    // convenient array dimensions
    const R  = props.rows; // rows
    const C  = props.cols; // cols
    const lL = props.labelsL ?? 0; // number of labels
    const lR = props.labelsR ?? 0;
    const lT = props.labelsT ?? 0;
    const lB = props.labelsB ?? 0;
    const fR = R+lT+lB; // full size of table with labels included
    const fC = C+lL+lR;

    /**
     * @returns 2d array of elements for the table cells made from the props
     */
    const buildData = (): ReactElement[][] => range(fR).map(r => range(fC).map(c => {
        const [gr,gc] = [r-lT,c-lL];
        if (in2DArray(gr,gc,R,C))
            return props.getData(gr,gc);
        else if (r < lT) {
            if (c < lL)       return props.getULData?.(r,c) ?? <></>;       // top left corner
            else if (gc >= C) return props.getURData?.(r,gc-C) ?? <></>     // top right corner
            else              return props.getTData?.(r,gc) ?? <></>;       // top labels
        } else if (gr >= R) {
            if (c < lL)       return props.getLLData?.(gr-R,c) ?? <></>;    // bottom left corner
            else if (gc >= C) return props.getLRData?.(gr-R,gc-C) ?? <></>; // bottom right corner
            else              return props.getBData?.(gr-R,gc) ?? <></>;    // bottom labels
        } else { // middle section
            if (c < lL)       return props.getLData?.(c,gr) ?? <></>;       // left labels
            else              return props.getRData?.(gc-C,gr) ?? <></>;    // right labels
        }
    }));

    /**
     * @returns 2d array of styles for the table cells made from the props
     */
    const buildStyles = (): CSS.Properties[][] => range(fR).map(r => range(fC).map(c => {
        const [gr,gc] = [r-lT,c-lL]; // coordinates in the puzzle grid
        let style: CSS.Properties = {
            height: (props.heightpx ?? DEFAULT_CELL_HEIGHT)+"px",
            width:  (props.widthpx  ?? DEFAULT_CELL_WIDTH )+"px"
        }
        if (in2DArray(gr,gc,R,C)) style = { ...style, ...props.getStyle(gr,gc) };
        else if (r < lT) {
            if (c < lL)       style = { ...style, ...props.getULStyle?.(r,c) };       // top left
            else if (gc >= C) style = { ...style, ...props.getURStyle?.(r,gc-C) };    // top right
            else              style = { ...style, ...props.getTStyle?.(r,gc) };       // top
        } else if (gr >= R) {
            if (c < lL)       style = { ...style, ...props.getLLStyle?.(gr-R,c) };    // bottom left
            else if (gc >= C) style = { ...style, ...props.getLRStyle?.(gr-R,gc-C) }; // bottom right
            else              style = { ...style, ...props.getBStyle?.(gr-R,gc) };    // bottom
        } else {
            if (c < lL)       style = { ...style, ...props.getLStyle?.(c,gr) };       // left
            else              style = { ...style, ...props.getRStyle?.(gc-C,gr) };    // right
        }
        return style;
    }));

    // state for the GridTable component
    const [data,setData]     = useState<ReactElement[][]>(buildData());
    const [styles,setStyles] = useState<CSS.Properties[][]>(buildStyles());

    // functions client may use
    useImperativeHandle(ref, () => ({
        getFullData:   () => data,
        getFullStyles: () => styles,
        updateData:    () => setData(buildData()),
        updateStyles:  () => setStyles(buildStyles())
    }));

    return (
        <BaseTable
            {...props}
            data        = { data   }
            styles      = { styles }
            tableStyle  = { props.tableStyle ?? DEFAULT_TABLE_STYLE }
        />
    );
};

// https://fettblog.eu/typescript-react-generic-forward-refs/
declare module "react" {
    function forwardRef<T, P = {}>(
      render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
    ): (props: P & React.RefAttributes<T>)  => React.ReactElement | null;
}

export default forwardRef(PuzzleGrid);
export type {Handle as PuzzleGridHandle, Props as PuzzleGridProps};
