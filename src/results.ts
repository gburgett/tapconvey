export class Results {
  version: string = ''
  items: Array<ResultItem>
}

export interface ResultItem {
  id: number
}

export class Test implements ResultItem {
  id: number
  name: string
  success: boolean
  asserts: number
  items: Array<ResultItem>
}

export class Assert implements ResultItem {
  id: number
  comment: string
  success: boolean
}

export class Comment implements ResultItem {
  id: number
  comment: string
}

export class Log implements ResultItem {
  id: number
  lines: string[]
}
