export declare type Address = string;
export declare type AddressTo<T> = Record<Address, T>;
export declare type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};
export declare type Nullable<T> = T | null;
export declare type Nullish<T> = Nullable<T> | undefined;
export declare type Primitive = number | string | boolean | bigint | symbol | null | undefined;
