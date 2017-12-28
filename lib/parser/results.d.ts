export declare class Summary {
    version: number;
    time: string;
    bailout: string;
    tests: Assert[];
    extra: Log;
    static deserialize(input: any): Summary;
}
export declare enum ResultItemType {
    Assert = 0,
    Comment = 1,
    Log = 2,
    Test = 3,
}
export declare abstract class ResultItem {
    protected type: ResultItemType;
    readonly __type__: ResultItemType;
    constructor(type: ResultItemType);
    static deserialize(input: any): ResultItem;
}
export declare class Test extends ResultItem {
    id: number;
    name: string;
    path: string[];
    plan: Plan;
    success: boolean;
    successfulAsserts: number;
    asserts: number;
    time: string;
    bailout: string;
    items: Array<ResultItem>;
    constructor(id?: number, name?: string, succes?: boolean, asserts?: number, successfulAsserts?: number, time?: string, plan?: Plan, path?: string[], ...items: Array<ResultItem>);
    static deserialize(input: any): Test;
}
export declare class Plan {
    start: number;
    end: number;
    constructor(start: number, end: number);
}
export declare class Assert extends ResultItem {
    id: number;
    comment: string;
    success: boolean;
    time: number;
    data: any;
    constructor(success: boolean, id: number, comment: string, time?: number);
    static deserialize(input: any): Assert;
}
export declare class Comment extends ResultItem {
    comment: string;
    constructor(comment: string);
    static deserialize(input: any): Comment;
}
export declare class Log extends ResultItem {
    lines: string[];
    constructor(...lines: string[]);
    static deserialize(input: any): Log;
}
