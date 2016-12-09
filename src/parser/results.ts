export class Summary {
  version: number
  time: string
  bailout: string
  tests: Assert[] = []
  extra: Log = new Log()
}

export interface ResultItem {
}

export class Test implements ResultItem {
  id: number
  name: string
  plan: Plan
  success: boolean
  successfulAsserts: number
  asserts: number
  time: string
  bailout: string
  items: Array<ResultItem> = []
}

export class Plan {
  start: number
  end: number
  constructor(start: number, end: number) {
    this.start = start
    this.end = end
  }
}

export class Assert implements ResultItem {
  id: number
  comment: string
  success: boolean
  time: number
  data: any

  constructor(success: boolean, id: number, comment: string, time?: number) {
    this.success = success
    this.comment = comment
    this.id = id
    this.time = time
    this.data = undefined
  }
}

export class Comment implements ResultItem {
  comment: string
  constructor(comment: string) {
    this.comment = comment
  }
}

export class Log implements ResultItem {
  lines: string[]
  constructor(...lines: string[]) {
    this.lines = lines || []
  }
}
