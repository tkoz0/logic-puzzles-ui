import {forwardRef, useImperativeHandle, useRef, useState} from "react";
import CSS from "csstype";
import PuzzleCellGridAreas, {PuzzleCellGridAreasHandle} from "../PuzzleCellGridAreas";
import {in2DArray, range} from "../../utils/ArrayUtils";

interface SudokuStandardHandle {
    setData: (r: number, c: number, n: number) => void,
    setStyle: (r: number, c: number, s: CSS.Properties) => void,
    getSelected: () => [number,number],
    setSelected: (r: number, c: number) => void
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

    const gridRef = useRef<PuzzleCellGridAreasHandle>(null);

    const [numData,_setNumData] = useState(props.data.map(row => row.map(n => n)));

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

    const handleKeypress = (key: string) => {
        const [sr,sc] = gridRef.current!.getSelected();
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
            gridRef.current!.updateData();
        }
    };

    useImperativeHandle(ref, () => ({
        setData: (r,c,n) => {
            numData[r][c] = n;
            gridRef.current!.updateData();
        },
        setStyle: (r,c,s) => {
            styles[r][c] = s;
            gridRef.current!.updateStyles();
        },
        getSelected: () => gridRef.current!.getSelected(),
        setSelected: (r,c) => gridRef.current!.setSelected(r,c)
    }));

    return (
        <PuzzleCellGridAreas ref={gridRef}
            cellWrap={true}
            heightpx={props.heightpx}
            widthpx={props.widthpx}
            data={numData}
            display={(_r,_c,v) => <>{v === 0 ? "" : v.toString()}</>}
            areas={areas}
            styles={styles}
            keyPress={handleKeypress}
            getSelectStyle={(r: number, c: number) => props.puzzle[r][c] === 0 ?
                {background:"yellow"} : {background:"orange"}}
        />
    );
});

export default SudokuStandard;
export type {SudokuStandardHandle};
