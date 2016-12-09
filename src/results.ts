export class Results {
  version: string = ''
  items: Array<ResultItem>
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
  items: Array<ResultItem> = []
}

export class Assert implements ResultItem {
  id: number
  comment: string
  success: boolean

  constructor(success: boolean, id: number, comment: string): Assert {
    this.success = success
    this.comment = comment
    this.id = id
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
}
