/** @license MIT License (c) copyright 2010-2016 original author or authors */

export default class PropagateAllTask {
  constructor (sink, time, events) {
    this.sink = sink
    this.time = time
    this.events = events
  }

  run () {
    const events = this.events
    const sink = this.sink
    let event

    for (let i = 0, l = events.length; i < l; ++i) {
      event = events[i]
      this.time = event.time
      sink.event(event.time, event.value)
    }

    events.length = 0
  }

  error (e) {
    this.sink.error(this.time, e)
  }
}
