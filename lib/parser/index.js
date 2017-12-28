"use strict";
const stream_1 = require("stream");
const results_1 = require("./results");
const debug = require('debug')('tapconvey:parser');
class NodeTapParser extends stream_1.Transform {
    constructor(cb) {
        super({
            readableObjectMode: true,
            writableObjectMode: false
        });
        this.stack = [];
        this.callback = cb;
        this.current = null;
        this.parser = require('tap-parser')();
        this._attach(this.parser);
    }
    _attach(parser) {
        parser.on('version', this._onVersion.bind(this));
        parser.on('comment', this._onComment.bind(this));
        parser.on('assert', this._onAssert.bind(this));
        parser.on('plan', this._onPlan.bind(this));
        parser.on('bailout', this._onBailout.bind(this));
        parser.on('child', this._onChild.bind(this));
        parser.on('extra', this._onExtra.bind(this));
        parser.on('complete', this._onComplete.bind(this));
    }
    _transform(chunk, encoding, callback) {
        var ret = this.parser.write(chunk, encoding, callback);
    }
    _flush(cb) {
        this._doFlush();
        cb();
    }
    _doFlush() {
        if (!this.emittedSummary) {
            if (this.summary) {
                this.push(this.summary);
                this.emit('summary', this.summary);
            }
            if (this.callback) {
                this.callback(null, this.summary);
                this.summary = null;
            }
            this.emittedSummary = true;
        }
    }
    _pushFinalized() {
        if (this.stack.length == 0 && this.current == null) {
            this.push(this.toFinalize);
        }
        this.toFinalize = null;
    }
    _error(error) {
        this.emit('error', error);
        this._doFlush();
    }
    _onExtra(extra) {
        extra = extra.replace(NodeTapParser._stripNewlines, '');
        if (!this.current) {
            if (this.summary) {
                this.summary.extra.lines.push(extra);
            }
        }
        else {
            var appended = false;
            if (this.current.items.length > 0) {
                const last = this.current.items[this.current.items.length - 1];
                if (last instanceof results_1.Log) {
                    last.lines.push(extra);
                    appended = true;
                }
            }
            if (!appended) {
                this.current.items.push(new results_1.Log(extra));
            }
        }
    }
    _onChild(childParser) {
        const self = this;
        if (this.toFinalize) {
            this._pushFinalized();
        }
        const path = [];
        if (self.current) {
            self.stack.push(self.current);
            path.push(...self.current.path, self.current.name);
        }
        self.current = new results_1.Test();
        self.current.path = path;
        this._attach(childParser);
    }
    _onComplete(results) {
        if (!this.current) {
            return;
        }
        this.current.success = results.ok;
        this.current.asserts = results.count;
        this.current.successfulAsserts = results.pass;
        if (results.bailout) {
            this.current.bailout = results.bailout;
        }
        this.toFinalize = this.current;
        if (this.stack.length == 0) {
            if (results.bailout) {
                this.summary.bailout = results.bailout;
                this.summary.tests.push(new results_1.Assert(false, -1, this.current.name));
            }
            this.current = null;
        }
        else {
            const prev = this.stack.pop();
            prev.items.push(this.current);
            if (results.bailout) {
                prev.items.push(new results_1.Assert(false, -1, this.current.name));
            }
            this.current = prev;
        }
    }
    _onBailout(reason) {
        if (this.toFinalize) {
            this._pushFinalized();
        }
        if (!this.current) {
            this._doFlush();
        }
    }
    _onPlan(plan) {
        if (this.current) {
            this.current.plan = new results_1.Plan(plan.start, plan.end);
        }
    }
    _onAssert(assert) {
        const toAdd = new results_1.Assert(assert.ok, assert.id, assert.name, assert.time);
        if (assert.diag) {
            toAdd.data = assert.diag;
        }
        if (this.toFinalize) {
            this.toFinalize.id = toAdd.id,
                this.toFinalize.name = toAdd.comment;
            if (toAdd.time) {
                this.toFinalize.time = toAdd.time.toString() + 'ms';
            }
            this._pushFinalized();
        }
        if (this.current) {
            this.current.items.push(toAdd);
        }
        else {
            this.summary.tests.push(toAdd);
        }
    }
    _onComment(comment) {
        const testName = NodeTapParser._TestNameRegexp.exec(comment);
        if (testName) {
            this._onTestName(testName[1]);
        }
        else {
            const testTime = NodeTapParser._TestTimeRegexp.exec(comment);
            if (testTime) {
                this._onTestTime(testTime[1]);
            }
            else {
                comment = comment.replace(NodeTapParser._stripNewlines, '');
                if (this.current) {
                    this.current.items.push(new results_1.Comment(comment));
                }
                else {
                    this.summary.extra.lines.push(comment);
                }
            }
        }
    }
    _onTestName(testName) {
        this.current.name = testName;
    }
    _onTestTime(testTime) {
        if (this.current) {
            this.current.time = testTime;
        }
        else if (!this.emittedSummary) {
            this.summary.time = testTime;
            this._doFlush();
        }
    }
    _onVersion(version) {
        this.summary = new results_1.Summary();
        this.emittedSummary = false;
        this.summary.version = version;
        this.emit('start', version);
        this.push(version);
    }
}
NodeTapParser._stripNewlines = /^\s+|\s+$/g;
NodeTapParser._TestNameRegexp = /^# Subtest\:\s+(.*)$/im;
NodeTapParser._TestTimeRegexp = /^# time=(.*)$/im;
exports.NodeTapParser = NodeTapParser;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NodeTapParser;
