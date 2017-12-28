"use strict";
class Summary {
    constructor() {
        this.tests = [];
        this.extra = new Log();
    }
    static deserialize(input) {
        const ret = new Summary();
        ret.version = input.version;
        ret.time = input.time;
        if (input.bailout) {
            ret.bailout = input.bailout;
        }
        ret.tests = input.tests.map(Assert.deserialize);
        ret.extra = Log.deserialize(input.extra);
        return ret;
    }
}
exports.Summary = Summary;
var ResultItemType;
(function (ResultItemType) {
    ResultItemType[ResultItemType["Assert"] = 0] = "Assert";
    ResultItemType[ResultItemType["Comment"] = 1] = "Comment";
    ResultItemType[ResultItemType["Log"] = 2] = "Log";
    ResultItemType[ResultItemType["Test"] = 3] = "Test";
})(ResultItemType = exports.ResultItemType || (exports.ResultItemType = {}));
class ResultItem {
    constructor(type) {
        this.type = type;
        this.__type__ = type;
    }
    static deserialize(input) {
        switch (input.__type__) {
            case ResultItemType.Assert:
                return Assert.deserialize(input);
            case ResultItemType.Comment:
                return Comment.deserialize(input);
            case ResultItemType.Log:
                return Log.deserialize(input);
            case ResultItemType.Test:
                return Test.deserialize(input);
            default:
                throw new Error('cannot deserialize input, missing __type__: ' + input);
        }
    }
}
exports.ResultItem = ResultItem;
class Test extends ResultItem {
    constructor(id, name, succes, asserts, successfulAsserts, time, plan, path, ...items) {
        super(ResultItemType.Test);
        this.id = id;
        this.name = name;
        this.success = succes;
        this.asserts = asserts;
        this.successfulAsserts = successfulAsserts;
        this.time = time;
        this.plan = plan;
        this.path = path || [];
        this.items = items || [];
    }
    static deserialize(input) {
        const ret = new Test(input.id, input.name, input.success, input.asserts, input.successfulAsserts, input.time);
        if (input.plan) {
            ret.plan = new Plan(input.plan.start, input.plan.end);
        }
        if (input.bailout) {
            ret.bailout = input.bailout;
        }
        if (input.items) {
            ret.items = input.items.map(ResultItem.deserialize);
        }
        if (input.path) {
            ret.path.push(...input.path);
        }
        return ret;
    }
}
exports.Test = Test;
class Plan {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
}
exports.Plan = Plan;
class Assert extends ResultItem {
    constructor(success, id, comment, time) {
        super(ResultItemType.Assert);
        this.success = success;
        this.comment = comment;
        this.id = id;
        this.time = time;
    }
    static deserialize(input) {
        var ret = new Assert(input.success, input.id, input.comment, input.time);
        if (input.data) {
            ret.data = input.data;
        }
        return ret;
    }
}
exports.Assert = Assert;
class Comment extends ResultItem {
    constructor(comment) {
        super(ResultItemType.Comment);
        this.comment = comment;
    }
    static deserialize(input) {
        return new Comment(input.comment);
    }
}
exports.Comment = Comment;
class Log extends ResultItem {
    constructor(...lines) {
        super(ResultItemType.Log);
        this.lines = lines || [];
    }
    static deserialize(input) {
        return new Log(...input.lines);
    }
}
exports.Log = Log;
