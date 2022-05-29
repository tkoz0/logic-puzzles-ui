import {forwardRef, useImperativeHandle, useRef, useState} from "react";
import CSS from "csstype";
import PuzzleGridCellsAreas, {PuzzleGridCellsAreasHandle} from "./base/PuzzleGridCellsAreas";
import {in2DArray} from "../../utils/ArrayUtils";
import {BasicCellsHandle} from "../../utils/PuzzleComponentUtils";

type HakyuuHandle = BasicCellsHandle<number>;

interface Props {
    rows:      number,
    cols:      number,
    data:      number[][],
    areas:     number[][],
    puzzle:    number[][],
    heightpx?: number,
    widthpx?:  number
}

const Hakyuu = forwardRef<HakyuuHandle,Props>((props,ref) => {

    const R = props.rows;
    const C = props.cols;
    const iref = useRef<PuzzleGridCellsAreasHandle>(null);
    const [numData] = useState(props.data.map(row => row.map(n => n)));
    const [styles] = useState<CSS.Properties[][]>(props.puzzle.map(row =>
        row.map(n => ({background: n !== 0 ? "lightgray" : "white"}))
    ));

    const handleKeypress = (e: KeyboardEvent) => {
        const key = e.key;
        const [sr,sc] = iref.current!.getSelected();
        // modifiable cell selected
        if (in2DArray(sr,sc,R,C) && props.puzzle[sr][sc] === 0) {
            let N = 0;
            props.areas.forEach((row) => row.forEach(a => {
                if (a === props.areas[sr][sc]) ++N;
            }));
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
            rows={R}
            cols={C}
            cellWrap={true}
            heightpx={props.heightpx}
            widthpx={props.widthpx}
            getData={(r,c) => {
                const n = numData[r][c];
                return <>{n === 0 ? "" : n.toString()}</>;
            }}
            getStyle={(r,c) => ({background:props.puzzle[r][c]!==0?"lightgray":"white"})}
            areas={props.areas}
            keyPress={handleKeypress}
            getSelectStyle={(r,c) => ({background:props.puzzle[r][c]===0?"yellow":"orange"})}
            leftClick={(r,c) => iref.current!.setSelected(r,c)}
        />
    );
});

export default Hakyuu;
export type {HakyuuHandle};
