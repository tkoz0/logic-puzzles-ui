
/**
 * Integer range, starting at start number, ending at end number, incrementing
 * by step size. Step size defaults to 1. If only the first argument is
 * provided, it returns the range [0,start) with step size 1.
 * @param start first number
 * @param end second number
 * @param step step size
 * @returns an array of the numbers in the range
 */
const range = (start: number, end?: number, step?: number): number[] => {
    const start_ = end === undefined ? 0 : start;
    const end_ = end ?? start;
    const step_ = step ?? 1;
    const result: number[] = [];
    for (let i = start_; i < end_; i += step_)
        result.push(i);
    return result;
}

/**
 * Tests validity of an index given array size.
 * @param index array index
 * @param size array size
 * @returns true if index is valid in the array
 */
const inArray = (index: number, size: number): boolean => 0 <= index && index < size;

/**
 * Tests validity of an index in a 2D array.
 * @param r row index
 * @param c col index
 * @param rows number of rows
 * @param cols number of cols
 * @returns true if r,c form a valid index in the 2d array
 */
const in2DArray = (r: number, c: number, rows: number, cols: number) =>
    inArray(r,rows) && inArray(c,cols);

/**
 * Tests if 2 arrays are equal with the same length and elements.
 * @param a first array
 * @param b second array
 * @returns true if they are equal (using ===)
 */
const arraysEqual = <T extends unknown>(a: T[], b: T[]): boolean => {
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; ++i)
        if (a[i] !== b[i])
            return false;
    return true;
}

/**
 * Tests if 2 2D arrays have the same shape and elements.
 * @param a first array
 * @param b second array
 * @returns true if they are equal (using ===)
 */
const arrays2DEqual = <T extends unknown>(a: T[][], b: T[][]): boolean => {
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; ++i)
        if (!arraysEqual(a[i],b[i]))
            return false;
    return true;
};

export {range, inArray, in2DArray, arraysEqual, arrays2DEqual};
