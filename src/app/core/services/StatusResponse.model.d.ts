export interface MessageStatusResponse {
    code: string;
    message: string;
    type: string;
}
export interface StatusResponseBase {
    success: boolean;
    code: string;
    message: string;
    status:number;
    validations?: MessageStatusResponse[];
}
export interface StatusResponse<T> extends StatusResponseBase {
    data: T;
}
export declare const EmptyArrayResponse: StatusResponse<any[]>;
export declare const EmptyStringResponse: StatusResponse<string>;
export declare const EmptyNullResponse: StatusResponse<any>;
