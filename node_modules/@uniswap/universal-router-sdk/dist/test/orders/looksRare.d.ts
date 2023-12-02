import { MakerOrder, TakerOrder } from '../../src/entities/protocols/looksRare';
import { BigNumber } from 'ethers';
export declare type APIOrder = Omit<MakerOrder, 'collection' | 'currency'> & {
    collectionAddress: string;
    currencyAddress: string;
};
export declare function createLooksRareOrders(apiOrder: APIOrder, taker: string): {
    makerOrder: MakerOrder;
    takerOrder: TakerOrder;
    value: BigNumber;
};
export declare const looksRareOrders: APIOrder[];
