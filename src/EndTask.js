/** @license MIT License (c) copyright 2010-2016 original author or authors */

export default class EndTask {
  constructor (t, x, sink) {
    this.time = t
    this.value = x
    this.sink = sink
  }

  run () {
    this.sink.end(this.time, this.value)
  }

  error (e) {
    this.sink.error(this.time, e)
  }
}
