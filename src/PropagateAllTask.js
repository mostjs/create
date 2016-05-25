/** @license MIT License (c) copyright 2010-2016 original author or authors */

export default class PropagateAllTask {
  constructor (sink, events) {
    this.sink = sink
    this.events = events
  }

  run () {
    const events = this.events
    const sink = this.sink
    let event

    for (let i = 0, l = events.length; i < l; ++i) {
      event = events[i]
      sink.event(event.time, event.value)
    }

    events.length = 0
  }

  error (e) {
    this.sink.error(0, e)
  }
}
