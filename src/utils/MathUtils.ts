
/**
 * If only providing the first number, generate a random number in the range
 * [0,a). If providing both, generate a random integer in the range [a,b]. This
 * function is only meant for integer arguments.
 * @param a first integer
 * @param b second integer
 * @returns random integer in range described
 */
const randint = (a: number, b?: number): number => {
    if (b === undefined)
        return Math.floor(Math.random()*a);
    else
        return a+Math.floor(Math.random()*(b-a+1));
}

const rand2Dindex = (r: number, c: number): [number,number] => {
    return [randint(r),randint(c)];
}

export {randint, rand2Dindex};
