import {forwardRef, useImperativeHandle, useRef, useState} from "react";
import PuzzleCellGrid, {PuzzleCellGridHandle, PuzzleCellGridProps} from "./PuzzleCellGrid";

// border widths
const B_THIN = 1;
const B_THICK = 3;

interface PuzzleCellGridAreasHandle extends PuzzleCellGridHandle {
    getAreas: () => number[][],
    setAreas: (newAreas: number[][]) => void
}

interface Props extends PuzzleCellGridProps {
    // extension to PuzzleCellGrid
    areas: number[][],
}

/**
 * Extends PuzzleGrid by supporting areas and handling drawing the borders.
 */
const PuzzleCellGridAreas = forwardRef<PuzzleCellGridAreasHandle,Props>((props,ref) => {
    console.assert(props.areas.length === props.data.length
        && props.areas[0].length === props.data[0].length,
        "PuzzleCellGridAreas: mismatched areas and data sizes");
    const R = props.data.length;
    const C = props.data[0].length;
    const gridRef = useRef<PuzzleCellGridHandle>(null);
    const [areas,setAreas] = useState(props.areas);

    useImperativeHandle(ref, () => ({
        // inherited
        getFullData: () => gridRef.current!.getFullData(),
        getFullStyles: () => gridRef.current!.getFullStyles(),
        updateData: () => gridRef.current!.updateData(),
        updateStyles: () => gridRef.current!.updateStyles(),
        getSelected: () => gridRef.current!.getSelected(),
        setSelected: (r,c) => gridRef.current!.setSelected(r,c),
        // extension
        getAreas: () => areas,
        setAreas: newAreas => {
            console.assert(newAreas.length === areas.length
                && newAreas[0].length === areas[0].length,
                "PuzzleCellGridAreas.setAreas(): incorrect areas size");
            setAreas(newAreas);
        }
    }));

    return (
        <PuzzleCellGrid ref={gridRef}
            {...props}
            styles={areas.map((row,r) => row.map((area,c) => {
                // thick border around edges and where area number changes
                const bl = (c === 0 || area !== areas[r][c-1]) ? B_THICK : B_THIN;
                const br = (c+1 === C || area !== areas[r][c+1]) ? B_THICK : B_THIN;
                const bt = (r === 0 || area !== areas[r-1][c]) ? B_THICK : B_THIN;
                const bb = (r+1 === R || area !== areas[r+1][c]) ? B_THICK : B_THIN;
                return {
                    borderLeft: bl+"px solid black",
                    borderRight: br+"px solid black",
                    borderTop: bt+"px solid black",
                    borderBottom: bb+"px solid black",
                    ...props.styles[r][c]
                }
            }))}
        />
    );
});

export default PuzzleCellGridAreas;
export type {PuzzleCellGridAreasHandle, Props as PuzzleCellGridAreasProps};
