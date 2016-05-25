/** @license MIT License (c) copyright 2010-2016 original author or authors */

export default class ErrorTask {
  constructor (t, e, sink) {
    this.time = t
    this.value = e
    this.sink = sink
  }

  run () {
    this.sink.error(this.time, this.value)
  }

  error (e) {
    throw e
  }
}
