/// <reference types="node" />
import { Transform } from 'stream';
import { Summary } from './results';
export declare class NodeTapParser extends Transform {
    private current;
    private toFinalize;
    private summary;
    private emittedSummary;
    private stack;
    private parser;
    private callback;
    constructor(cb?: (error: Error, summary: Summary) => void);
    private _attach(parser);
    _transform(chunk: Buffer, encoding: string, callback: (Error, Any) => void): void;
    _flush(cb: any): void;
    private _doFlush();
    private _pushFinalized();
    private _error(error);
    static _stripNewlines: RegExp;
    private _onExtra(extra);
    private _onChild(childParser);
    private _onComplete(results);
    private _onBailout(reason);
    private _onPlan(plan);
    private _onAssert(assert);
    private static _TestNameRegexp;
    private static _TestTimeRegexp;
    private _onComment(comment);
    private _onTestName(testName);
    private _onTestTime(testTime);
    private _onVersion(version);
}
export default NodeTapParser;
