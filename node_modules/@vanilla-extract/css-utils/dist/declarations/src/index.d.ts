declare type Operand = string | number | CalcChain;
declare const add: (...operands: Array<Operand>) => string;
declare const subtract: (...operands: Array<Operand>) => string;
declare const multiply: (...operands: Array<Operand>) => string;
declare const divide: (...operands: Array<Operand>) => string;
declare const negate: (x: Operand) => string;
declare type CalcChain = {
    add: (...operands: Array<Operand>) => CalcChain;
    subtract: (...operands: Array<Operand>) => CalcChain;
    multiply: (...operands: Array<Operand>) => CalcChain;
    divide: (...operands: Array<Operand>) => CalcChain;
    negate: () => CalcChain;
    toString: () => string;
};
interface Calc {
    (x: Operand): CalcChain;
    add: typeof add;
    subtract: typeof subtract;
    multiply: typeof multiply;
    divide: typeof divide;
    negate: typeof negate;
}
export declare const calc: Calc;
export {};
