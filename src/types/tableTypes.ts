export interface columnsType {
    name: string;
    title: string;
    sortable?: boolean;
    action?: any;
    showDelete?: boolean;
    showEdit?: boolean;
    sort?:string;
}

export interface OrderProps {
    name: string;
    sort: string;
}