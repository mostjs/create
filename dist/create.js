(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('most'), require('@most/multicast')) :
  typeof define === 'function' && define.amd ? define(['most', '@most/multicast'], factory) :
  (global.mostCreate = factory(global.most,global.mostMulticast));
}(this, function (most,_most_multicast) { 'use strict';

  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  function defer (task) { return Promise.resolve(task).then(runTask); }

  function runTask (task) {
    try {
      return task.run()
    } catch (e) {
      return task.error(e)
    }
  }

  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  var PropagateAllTask = function PropagateAllTask (sink, time, events) {
    this.sink = sink
    this.time = time
    this.events = events
  };

  PropagateAllTask.prototype.run = function run () {
      var this$1 = this;

    var events = this.events
    var sink = this.sink
    var event

    for (var i = 0, l = events.length; i < l; ++i) {
      event = events[i]
      this$1.time = event.time
      sink.event(event.time, event.value)
    }

    events.length = 0
  };

  PropagateAllTask.prototype.error = function error (e) {
    this.sink.error(this.time, e)
  };

  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  var EndTask = function EndTask (t, x, sink) {
    this.time = t
    this.value = x
    this.sink = sink
  };

  EndTask.prototype.run = function run () {
    this.sink.end(this.time, this.value)
  };

  EndTask.prototype.error = function error (e) {
    this.sink.error(this.time, e)
  };

  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  var ErrorTask = function ErrorTask (t, e, sink) {
    this.time = t
    this.value = e
    this.sink = sink
  };

  ErrorTask.prototype.run = function run () {
    this.sink.error(this.time, this.value)
  };

  ErrorTask.prototype.error = function error (e) {
    throw e
  };

  var DeferredSink = function DeferredSink (sink) {
    this.sink = sink
    this.events = []
    this.active = true
  };

  DeferredSink.prototype.event = function event (t, x) {
    if (!this.active) {
      return
    }

    if (this.events.length === 0) {
      defer(new PropagateAllTask(this.sink, t, this.events))
    }

    this.events.push({ time: t, value: x })
  };

  DeferredSink.prototype.end = function end (t, x) {
    if (!this.active) {
      return
    }

    this._end(new EndTask(t, x, this.sink))
  };

  DeferredSink.prototype.error = function error (t, e) {
    this._end(new ErrorTask(t, e, this.sink))
  };

  DeferredSink.prototype._end = function _end (task) {
    this.active = false
    defer(task)
  };

  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  var CreateSubscriber = function CreateSubscriber (sink, scheduler, subscribe) {
    this.sink = sink
    this.scheduler = scheduler
    this._unsubscribe = this._init(subscribe)
  };

  CreateSubscriber.prototype._init = function _init (subscribe) {
      var this$1 = this;

    var add = function (x) { return this$1.sink.event(this$1.scheduler.now(), x); }
    var end = function (x) { return this$1.sink.end(this$1.scheduler.now(), x); }
    var error = function (e) { return this$1.sink.error(this$1.scheduler.now(), e); }

    try {
      return subscribe(add, end, error)
    } catch (e) {
      error(e)
    }
  };

  CreateSubscriber.prototype.dispose = function dispose () {
    if (typeof this._unsubscribe === 'function') {
      return this._unsubscribe.call(void 0)
    }
  };

  var Create = function Create (subscribe) {
    this._subscribe = subscribe
  };

  Create.prototype.run = function run (sink, scheduler) {
    return new CreateSubscriber(new DeferredSink(sink), scheduler, this._subscribe)
  };

  function index (run) { return new most.Stream(new _most_multicast.MulticastSource(new Create(run))); }

  return index;

}));