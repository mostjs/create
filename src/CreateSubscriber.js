/** @license MIT License (c) copyright 2010-2016 original author or authors */

import { tryEvent, tryEnd } from './tryEvent'

export default class CreateSubscriber {
  constructor (sink, scheduler, subscribe) {
    this.sink = sink
    this.scheduler = scheduler
    this.active = true
    this._unsubscribe = this._init(subscribe)
  }

  _init (subscribe) {
    const add = x => this._add(x)
    const end = x => this._end(x)
    const error = e => this._error(e)

    try {
      return subscribe(add, end, error)
    } catch (e) {
      error(e)
    }
  }

  _add (x) {
    if (!this.active) {
      return
    }
    tryEvent(this.scheduler.now(), x, this.sink)
  }

  _end (x) {
    if (!this.active) {
      return
    }
    this.active = false
    tryEnd(this.scheduler.now(), x, this.sink)
  }

  _error (x) {
    this.active = false
    this.sink.error(this.scheduler.now(), x)
  }

  dispose () {
    this.active = false
    if (typeof this._unsubscribe === 'function') {
      return this._unsubscribe.call(void 0)
    }
  }
}
