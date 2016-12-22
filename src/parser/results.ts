
export class Summary {
  version: number
  time: string
  bailout: string
  tests: Assert[] = []
  extra: Log = new Log()

  public static deserialize(input: any): Summary {
    const ret = new Summary()
    ret.version = input.version
    ret.time = input.time
    if (input.bailout) {
      ret.bailout = input.bailout
    }
    ret.tests = input.tests.map(Assert.deserialize)
    ret.extra = Log.deserialize(input.extra)
    return ret
  }
}

export enum ResultItemType {
  Assert,
  Comment,
  Log,
  Test
}

export abstract class ResultItem {
  public readonly __type__: ResultItemType
  constructor(protected type: ResultItemType) {
    this.__type__ = type
  }

  public static deserialize(input: any): ResultItem {
    switch (input.__type__) {
      case ResultItemType.Assert:
        return Assert.deserialize(input)
      case ResultItemType.Comment:
        return Comment.deserialize(input)
      case ResultItemType.Log:
        return Log.deserialize(input)
      case ResultItemType.Test:
        return Test.deserialize(input)
      default:
        throw new Error('cannot deserialize input, missing __type__: ' + input)
    }
  }
}

export class Test extends ResultItem {
  id: number
  name: string
  plan: Plan
  success: boolean
  successfulAsserts: number
  asserts: number
  time: string
  bailout: string
  items: Array<ResultItem>

  constructor(id?: number, name?: string, succes?: boolean, asserts?: number,
    successfulAsserts?: number, time?: string, plan?: Plan,
    ...items: Array<ResultItem>) {
    super(ResultItemType.Test)
    this.id = id
    this.name = name
    this.success = succes
    this.asserts = asserts
    this.successfulAsserts = successfulAsserts
    this.time = time
    this.plan = plan
    this.items = items || []
  }

  public static deserialize(input: any): Test {
    const ret = new Test(
      input.id,
      input.name,
      input.success,
      input.asserts,
      input.successfulAsserts,
      input.time
    )
    if (input.plan) {
      ret.plan = new Plan(input.plan.start, input.plan.end)
    }
    if (input.bailout) {
      ret.bailout = input.bailout
    }
    if (input.items) {
      ret.items = input.items.map(ResultItem.deserialize)
    }
    return ret
  }
}


export class Plan {
  start: number
  end: number
  constructor(start: number, end: number) {
    this.start = start
    this.end = end
  }
}

export class Assert extends ResultItem {
  id: number
  comment: string
  success: boolean
  time: number
  data: any

  constructor(success: boolean, id: number, comment: string, time?: number) {
    super(ResultItemType.Assert)
    this.success = success
    this.comment = comment
    this.id = id
    this.time = time
  }

  public static deserialize(input: any): Assert {
    var ret = new Assert(
      input.success,
      input.id,
      input.comment,
      input.time
    )
    if (input.data) {
      ret.data = input.data
    }
    return ret
  }
}

export class Comment extends ResultItem {
  comment: string
  constructor(comment: string) {
    super(ResultItemType.Comment)
    this.comment = comment
  }

  public static deserialize(input: any): Comment {
    return new Comment(input.comment)
  }
}

export class Log extends ResultItem {
  lines: string[]
  constructor(...lines: string[]) {
    super(ResultItemType.Log)
    this.lines = lines || []
  }

  public static deserialize(input: any): Log {
    return new Log(...input.lines)
  }
}
