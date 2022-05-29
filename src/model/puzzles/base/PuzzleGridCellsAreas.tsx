import {ForwardedRef, forwardRef, useImperativeHandle, useRef} from "react";
import CSS from "csstype";
import {DEFAULT_BORDER_THICK, DEFAULT_BORDER_THIN} from "../../../utils/Constants";
import PuzzleGridCells, {PuzzleGridCellsHandle, PuzzleGridCellsProps} from "./PuzzleGridCells";

interface Handle extends PuzzleGridCellsHandle {
}

interface Props extends PuzzleGridCellsProps {
    areas: number[][],
    areaStyles?: Map<number,CSS.Properties>,
    borderThick?: string,
    borderThin?: string
}

/**
 * Extends PuzzleGrid by supporting areas and handling drawing the borders.
 */
const PuzzleCellGridAreas = (props: Props, ref: ForwardedRef<Handle>) => {

    const R = props.rows;
    const C = props.cols;
    const iref = useRef<PuzzleGridCellsHandle>(null);
    const bthick = props.borderThick ?? DEFAULT_BORDER_THICK+"px solid black";
    const bthin  = props.borderThin  ?? DEFAULT_BORDER_THIN +"px solid black";
    const A = props.areas;

    useImperativeHandle(ref, () => ({
        getFullData: () => iref.current!.getFullData(),
        getFullStyles: () => iref.current!.getFullStyles(),
        updateData: () => iref.current!.updateData(),
        updateStyles: () => iref.current!.updateStyles(),
        getSelected: () => iref.current!.getSelected(),
        setSelected: (r: number, c: number) => iref.current!.setSelected(r,c)
    }));

    return (
        <PuzzleGridCells ref={iref}
            {...props}
            getStyle={(r,c) => {
                const as = props.areaStyles?.get(A[r][c]);
                const bl = (c === 0   || A[r][c] !== A[r][c-1]) ? bthick : bthin;
                const br = (c+1 === C || A[r][c] !== A[r][c+1]) ? bthick : bthin;
                const bt = (r === 0   || A[r][c] !== A[r-1][c]) ? bthick : bthin;
                const bb = (r+1 === R || A[r][c] !== A[r+1][c]) ? bthick : bthin;
                return {
                    borderLeft:   bl,
                    borderRight:  br,
                    borderTop:    bt,
                    borderBottom: bb,
                    ...as,
                    ...props.getStyle(r,c)
                };
            }}
        />
    );
};

// https://fettblog.eu/typescript-react-generic-forward-refs/
declare module "react" {
    function forwardRef<T, P = {}>(
      render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
    ): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}

export default forwardRef(PuzzleCellGridAreas);
export type {Handle as PuzzleGridCellsAreasHandle, Props as PuzzleGridCellsAreasProps};
