/** @license MIT License (c) copyright 2010-2016 original author or authors */

import DeferredSink from './DeferredSink'
import CreateSubscriber from './CreateSubscriber'

export default class Create {
  constructor (subscribe) {
    this._subscribe = subscribe
  }

  run (sink, scheduler) {
    return new CreateSubscriber(new DeferredSink(sink), scheduler, this._subscribe)
  }
}
