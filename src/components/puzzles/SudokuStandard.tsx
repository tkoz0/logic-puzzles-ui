import {forwardRef, useImperativeHandle, useState} from "react";
import CSS from "csstype";
import PuzzleCellGridAreas from "../PuzzleCellGridAreas";
import {range} from "../../utils/ArrayUtils";

interface SudokuStandardHandle {
    getGrid: () => number[][],
    setGrid: (newGrid: number[][]) => void,
    getStyles: () => CSS.Properties[][],
    setStyles: (newStyles: CSS.Properties[][]) => void
}

interface Props {
    blockR: number,
    blockC: number,
    data: number[][],
    heightpx: number,
    puzzle: number[][],
    widthpx: number
}

const SudokuStandard = forwardRef<SudokuStandardHandle,Props>((props, ref) => {

    // side length of the grid
    const N = props.blockR*props.blockC;

    console.assert(props.data.length === N && props.data[0].length === N,
        "SudokuStandard: blockR and blockC do not match data size");

    // numbers on the grid
    const [grid,setGrid] = useState(props.data.map(row => row.map(n => n)));

    // gray background for fixed numbers, white elsewhere
    const [styles,setStyles] = useState<CSS.Properties[][]>(props.puzzle.map(row =>
        row.map(n => ({background: n !== 0 ? "lightgray" : "white"}))
    ));

    // assign a unique number to each block
    const areas = range(N).map(r =>
        range(N).map(c => {
            const br = Math.floor(r/props.blockR); // block coordinate
            const bc = Math.floor(c/props.blockC);
            return br*props.blockR+bc;
        })
    );

    useImperativeHandle(ref, () => ({
        getGrid: () => grid,
        setGrid: newGrid => {
            console.assert(newGrid.length === N && newGrid[0].length === N,
                "SudokuStandard.setGrid(): incorrect grid size");
            setGrid(newGrid);
        },
        getStyles: () => styles,
        setStyles: newStyles => {
            console.assert(newStyles.length === N && newStyles[0].length === N,
                "SudokuStandard.setStyles(): incorrect styles size");
            setStyles(newStyles);
        }
    }));

    return (
        <PuzzleCellGridAreas
            cellWrap={true}
            heightpx={props.heightpx}
            widthpx={props.widthpx}
            data={grid.map(row => row.map(n => <>{n !== 0 ? n.toString(): ""}</>))}
            areas={areas}
            styles={styles}
            getSelectStyle={(r: number, c: number) => props.puzzle[r][c] === 0 ?
                {background:"yellow"} : {background:"orange"}}
        />
    );
});

export default SudokuStandard;
export type {SudokuStandardHandle};
