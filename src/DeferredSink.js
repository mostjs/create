/** @license MIT License (c) copyright 2010-2016 original author or authors */

import defer from './defer'
import PropagateAllTask from './PropagateAllTask'
import EndTask from './EndTask'
import ErrorTask from './ErrorTask'

export default class DeferredSink {
  constructor (sink) {
    this.sink = sink
    this.events = []
    this.active = true
  }

  event (t, x) {
    if (!this.active) {
      return
    }

    if (this.events.length === 0) {
      defer(new PropagateAllTask(this.sink, t, this.events))
    }

    this.events.push({ time: t, value: x })
  }

  end (t, x) {
    if (!this.active) {
      return
    }

    this._end(new EndTask(t, x, this.sink))
  }

  error (t, e) {
    this._end(new ErrorTask(t, e, this.sink))
  }

  _end (task) {
    this.active = false
    defer(task)
  }
}
