import {IClientItemList} from "./client";
import {IProduct} from "./product";
import {ITare, nullTare} from "./tare";
import {IEmployeeListItem, nullEmployeeItem} from "./employee";

export interface IContractListItemSimple {
    id: number;
    num: string;
    date: string;
    client: string;
}

export const nullContractListItemSimple: IContractListItemSimple = {
    id: 0,
    num: '',
    date: '',
    client: ''
}

export interface IContractListItem {
    id: number;
    num: string;
    clientName: string;
    contractDate: string;
    estDelivery: string;
    status: number;
    sum: number;
}

export interface IPaymentContractItem {
    id: number;
    created: string;
    date: string;
    num: string;
    type: string;
    value: number;
}

export const nullContractItem: IContract = {
    id: 0,
    num: '',
    client: {id: 0, clientName: '', clientAddr: '', clientAgent: '', clientEmployee: ''},
    contractDate: '',
    delivered: '',
    contractState: 0,
    comment: '',
    created: '',
    discount: 0,
    contractId: '',
    estDelivery: '',
    agent: nullEmployeeItem,
    specs: [],
    payments: []
};

export const nullContractSpecItem : IContractSpecItem = {
    id: 0,
    product: {id: 0, name: ''},
    tare: nullTare,
    itemCount: 0,
    itemPrice: 0,
    itemTotal: 0,
    itemDiscount: 0,
    delivered: '',
    delivery: ''
}

export interface IContractSpecItem {
    id: number;
    product: IProduct;
    tare: ITare;
    itemCount: number;
    itemPrice: number;
    itemTotal: number;
    itemDiscount: number;
    delivery: string;
    delivered: string;
}

export interface IContract {
    id: number;
    created: string;
    client: IClientItemList;
    num: string;
    contractDate: string;
    contractState: number;
    estDelivery: string;
    delivered: string;
    discount: number;
    comment: string;
    contractId: string;
    agent: IEmployeeListItem;
    specs: IContractSpecItem[];
    payments: IPaymentContractItem[];
}

export const ContractStateString = [
    '',
    'Черновик',
    'Действующий',
    'Исполненный'
];