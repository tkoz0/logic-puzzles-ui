import {ForwardedRef, forwardRef, Ref, useImperativeHandle, useRef, useState} from "react";
import PuzzleCellGrid, {PuzzleCellGridHandle, PuzzleCellGridProps} from "./PuzzleCellGrid";

// border widths
const B_THIN = 1;
const B_THICK = 3;

interface Handle extends PuzzleCellGridHandle {
}

interface Props extends PuzzleCellGridProps {
    // extension to PuzzleCellGrid
    areas: number[][],
    borderThick?: string,
    borderThin?: string
}

/**
 * Extends PuzzleGrid by supporting areas and handling drawing the borders.
 */
const PuzzleCellGridAreas = (props: Props, ref: ForwardedRef<Handle>) => {
    const R = props.rows;
    const C = props.cols;
    const iref = useRef<PuzzleCellGridHandle>(null);
    const [areas,_setAreas] = useState(props.areas);

    useImperativeHandle(ref, () => ({
        // inherited
        getFullData: () => iref.current!.getFullData(),
        getFullStyles: () => iref.current!.getFullStyles(),
        updateData: () => iref.current!.updateData(),
        updateStyles: () => iref.current!.updateStyles(),
        getSelected: () => iref.current!.getSelected(),
        setSelected: (r,c) => iref.current!.setSelected(r,c),
        // extension
    }));

    return (
        <PuzzleCellGrid ref={iref}
            {...props}
            getStyle={(r,c) => {
                const bthick = props.borderThick ?? B_THICK+"px solid black";
                const bthin  = props.borderThin  ?? B_THIN +"px solid black";
                const bl = (c === 0   || areas[r][c] !== areas[r][c-1]) ? bthick : bthin;
                const br = (c+1 === C || areas[r][c] !== areas[r][c+1]) ? bthick : bthin;
                const bt = (r === 0   || areas[r][c] !== areas[r-1][c]) ? bthick : bthin;
                const bb = (r+1 === R || areas[r][c] !== areas[r+1][c]) ? bthick : bthin;
                return {
                    borderLeft:   bl,
                    borderRight:  br,
                    borderTop:    bt,
                    borderBottom: bb,
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
export type {Handle as PuzzleCellGridAreasHandle, Props as PuzzleCellGridAreasProps};
