/** @license MIT License (c) copyright 2010-2016 original author or authors */

export default class CreateSubscriber {
  constructor (sink, scheduler, subscribe) {
    this.sink = sink
    this.scheduler = scheduler
    this._unsubscribe = this._init(subscribe)
  }

  _init (subscribe) {
    const add = x => this.sink.event(this.scheduler.currentTime(), x)
    const end = x => this.sink.end(this.scheduler.currentTime(), x)
    const error = e => this.sink.error(this.scheduler.currentTime(), e)

    try {
      return subscribe(add, end, error)
    } catch (e) {
      error(e)
    }
  }

  dispose () {
    if (typeof this._unsubscribe === 'function') {
      return this._unsubscribe.call(void 0)
    }
  }
}
