/// <reference types="node" />
import { Readable } from 'stream';
export declare function stringToStream(str: string, highWaterMark?: number): Readable;
