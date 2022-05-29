import {ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import CSS from "csstype";
import PuzzleGrid, {PuzzleGridHandle, PuzzleGridProps} from "./PuzzleGrid";
import {in2DArray} from "../../../utils/ArrayUtils";

interface Handle extends PuzzleGridHandle {
    getSelected: () => [number,number],
    setSelected: (r: number, c: number) => void
}

interface Props extends PuzzleGridProps {
    getSelectStyle?:  (r: number, c: number) => CSS.Properties,
    // label number (left->right or top->bottom) and the row/col
    getLSelectStyle?: (l: number, r: number) => CSS.Properties,
    getRSelectStyle?: (l: number, r: number) => CSS.Properties,
    getTSelectStyle?: (l: number, c: number) => CSS.Properties,
    getBSelectStyle?: (l: number, c: number) => CSS.Properties,
    cellWrap?: boolean // wrap controls around
    keyPress?: (e: KeyboardEvent) => void
}

const PuzzleGridCells = (props: Props, ref: ForwardedRef<Handle>) => {

    const R = props.rows;
    const C = props.cols;
    const iref = useRef<PuzzleGridHandle>(null);
    const [selected] = useState<[number,number]>([-1,-1]);

    useImperativeHandle(ref, () => ({
        getFullData: () => iref.current!.getFullData(),
        getFullStyles: () => iref.current!.getFullStyles(),
        updateData: () => {
            iref.current!.updateData();
        },
        updateStyles: () => {
            iref.current!.updateStyles();
        },
        getSelected: () => selected,
        setSelected: (r: number, c: number) => {
            selected[0] = r;
            selected[1] = c;
            iref.current!.updateStyles();
        }
    }));

    useEffect(() => {
        const keyEvent = (e: KeyboardEvent) => {
            const [sr,sc] = selected;
            let dr = 0;
            let dc = 0;
            switch (e.key) { // let position change
                case "ArrowUp":    dr = -1; break;
                case "ArrowDown":  dr = +1; break;
                case "ArrowLeft":  dc = -1; break;
                case "ArrowRight": dc = +1; break;
                default:
                    props.keyPress?.(e);
                    return;
            }
            if (dr !== 0 || dc !== 0)
                e.preventDefault();
            let nr = -1;
            let nc = -1;
            if (!in2DArray(sr,sc,R,C)) { // move to 0,0 if no selection
                nr = 0;
                nc = 0;
            } else { // add position change, consider cell wrap
                nr = sr+dr;
                nc = sc+dc;
                if (props.cellWrap) {
                    nr = (nr+R)%R;
                    nc = (nc+C)%C;
                } // bound inside grid dimensions
                nr = Math.max(Math.min(R-1,nr),0);
                nc = Math.max(Math.min(C-1,nc),0);
            }
            selected[0] = nr;
            selected[1] = nc;
            iref.current!.updateStyles();
        };
        document.addEventListener("keydown",keyEvent);
        return () => document.removeEventListener("keydown",keyEvent);
    });

    return (
        <PuzzleGrid ref={iref}
            {...props}
            // interecpt the style functions to add select style
            getStyle={(r,c) => {
                let style = props.getStyle(r,c);
                if (r === selected[0] && c === selected[1])
                    style = { ...style, ...props.getSelectStyle?.(r,c) };
                return style;
            }}
            getLStyle={(l,r) => {
                let style = props.getLStyle?.(l,r) ?? {};
                if (r === selected[0])
                    style = { ...style, ...props.getLSelectStyle?.(l,r) };
                return style;
            }}
            getRStyle={(l,r) => {
                let style = props.getRStyle?.(l,r) ?? {};
                if (r === selected[0])
                    style = { ...style, ...props.getRSelectStyle?.(l,r) };
                return style;
            }}
            getTStyle={(l,c) => {
                let style = props.getTStyle?.(l,c) ?? {};
                if (c === selected[1])
                    style = { ...style, ...props.getTSelectStyle?.(l,c) };
                return style;
            }}
            getBStyle={(l,c) => {
                let style = props.getBStyle?.(l,c) ?? {};
                if (c === selected[1])
                    style = { ...style, ...props.getBSelectStyle?.(l,c) };
                return style;
            }}
        />
    );
};

// https://fettblog.eu/typescript-react-generic-forward-refs/
declare module "react" {
    function forwardRef<T, P = {}>(
      render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
    ): (props: P & React.RefAttributes<T>)  => React.ReactElement | null;
}

export default forwardRef(PuzzleGridCells);
export type {Handle as PuzzleGridCellsHandle, Props as PuzzleGridCellsProps};
