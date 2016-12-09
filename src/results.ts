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
  success: boolean
  successfulAsserts: number
  asserts: number
  time: string
  bailout: string
  items: Array<ResultItem> = []
}

export class Assert implements ResultItem {
  id: number
  comment: string
  success: boolean
  time: number

  constructor(success: boolean, id: number, comment: string, time?: number) {
    this.success = success
    this.comment = comment
    this.id = id
    this.time = time
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
