import {forwardRef, useImperativeHandle, useRef, useState} from "react";
import CSS from "csstype";
import PuzzleGridCellsAreas, {PuzzleGridCellsAreasHandle} from "./base/PuzzleGridCellsAreas";
import {in2DArray, range} from "../../utils/ArrayUtils";
import {BasicCellsHandle} from "../../utils/PuzzleComponentUtils";

type SudokuHandle = BasicCellsHandle<number>;

interface Props {
    blockR:    number,
    blockC:    number,
    data:      number[][],
    puzzle:    number[][],
    heightpx?: number,
    widthpx?:  number
}

const Sudoku = forwardRef<SudokuHandle,Props>((props, ref) => {

    // side length of the grid
    const N = props.blockR*props.blockC;

    console.assert(props.data.length === N && props.data[0].length === N,
        "SudokuStandard: blockR and blockC do not match data size");

    const iref = useRef<PuzzleGridCellsAreasHandle>(null);

    const [numData] = useState(props.data.map(row => row.map(n => n)));

    // gray background for fixed numbers, white elsewhere
    const [styles] = useState<CSS.Properties[][]>(props.puzzle.map(row =>
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

    const handleKeypress = (e: KeyboardEvent) => {
        const key = e.key;
        const [sr,sc] = iref.current!.getSelected();
        // modifiable cell selected
        if (in2DArray(sr,sc,N,N) && props.puzzle[sr][sc] === 0) {
            let n = -1;
            if (key === "Backspace" || key === "Delete") {
                n = 0;
            } else if ("0123456789".includes(key)) {
                // append digit and fit in [0,N]
                const keyNum = Number.parseInt(key);
                n = numData[sr][sc]*10+keyNum;
                if (n > N) n = keyNum;
                if (n > N) n = 0;
            } else return;
            numData[sr][sc] = n;
            iref.current!.updateData();
        }
    };

    useImperativeHandle(ref, () => ({
        setData: (r,c,n) => {
            numData[r][c] = n;
            iref.current!.updateData();
        },
        setStyle: (r,c,s) => {
            styles[r][c] = s;
            iref.current!.updateStyles();
        },
        getData: () => numData,
        getStyles: () => styles,
        getSelected: () => iref.current!.getSelected(),
        setSelected: (r,c) => iref.current!.setSelected(r,c)
    }));

    return (
        <PuzzleGridCellsAreas ref={iref}
            rows={N}
            cols={N}
            cellWrap={true}
            heightpx={props.heightpx}
            widthpx={props.widthpx}
            getData={(r,c) => {
                const n = numData[r][c];
                return <>{n === 0 ? "" : n.toString()}</>;
            }}
            areas={areas}
            getStyle={(r,c) => ({background:props.puzzle[r][c]!==0?"lightgray":"white"})}
            keyPress={handleKeypress}
            getSelectStyle={(r,c) => ({background:props.puzzle[r][c]===0?"yellow":"orange"})}
            leftClick={(r,c) => iref.current!.setSelected(r,c)}
        />
    );
});

export default Sudoku;
export type {SudokuHandle};
