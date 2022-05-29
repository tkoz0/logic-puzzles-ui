import CSS from "csstype";

interface BasicCellsHandle<ValueType> {
    getData:     () => ValueType[][],
    setData:     (r: number, c: number, v: ValueType) => void,
    getStyles:   () => CSS.Properties[][],
    setStyle:    (r: number, c: number, s: CSS.Properties) => void,
    getSelected: () => [number,number],
    setSelected: (r: number, c: number) => void
}

export type {BasicCellsHandle};
