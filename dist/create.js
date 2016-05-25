(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('@most/create', ['exports', 'most', '@most/multicast'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('most'), require('@most/multicast'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.most, global.multicast);
    global.mostCreate = mod.exports;
  }
})(this, function (exports, _most, _multicast) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  var defer = function defer(task) {
    return Promise.resolve(task).then(runTask);
  };

  function runTask(task) {
    try {
      return task.run();
    } catch (e) {
      return task.error(e);
    }
  }

  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  var PropagateAllTask = function () {
    function PropagateAllTask(sink, events) {
      _classCallCheck(this, PropagateAllTask);

      this.sink = sink;
      this.events = events;
    }

    _createClass(PropagateAllTask, [{
      key: 'run',
      value: function run() {
        var events = this.events;
        var sink = this.sink;
        var event = void 0;

        for (var i = 0, l = events.length; i < l; ++i) {
          event = events[i];
          sink.event(event.time, event.value);
        }

        events.length = 0;
      }
    }, {
      key: 'error',
      value: function error(e) {
        this.sink.error(0, e);
      }
    }]);

    return PropagateAllTask;
  }();

  var EndTask = function () {
    function EndTask(t, x, sink) {
      _classCallCheck(this, EndTask);

      this.time = t;
      this.value = x;
      this.sink = sink;
    }

    _createClass(EndTask, [{
      key: 'run',
      value: function run() {
        this.sink.end(this.time, this.value);
      }
    }, {
      key: 'error',
      value: function error(e) {
        this.sink.error(this.time, e);
      }
    }]);

    return EndTask;
  }();

  var ErrorTask = function () {
    function ErrorTask(t, e, sink) {
      _classCallCheck(this, ErrorTask);

      this.time = t;
      this.value = e;
      this.sink = sink;
    }

    _createClass(ErrorTask, [{
      key: 'run',
      value: function run() {
        this.sink.error(this.time, this.value);
      }
    }, {
      key: 'error',
      value: function error(e) {
        throw e;
      }
    }]);

    return ErrorTask;
  }();

  var DeferredSink = function () {
    function DeferredSink(sink) {
      _classCallCheck(this, DeferredSink);

      this.sink = sink;
      this.events = [];
      this.active = true;
    }

    _createClass(DeferredSink, [{
      key: 'event',
      value: function event(t, x) {
        if (!this.active) {
          return;
        }

        if (this.events.length === 0) {
          defer(new PropagateAllTask(this.sink, this.events));
        }

        this.events.push({ time: t, value: x });
      }
    }, {
      key: 'error',
      value: function error(t, e) {
        this._end(new ErrorTask(t, e, this.sink));
      }
    }, {
      key: 'end',
      value: function end(t, x) {
        this._end(new EndTask(t, x, this.sink));
      }
    }, {
      key: '_end',
      value: function _end(task) {
        this.active = false;
        defer(task);
      }
    }]);

    return DeferredSink;
  }();

  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  function tryEvent(t, x, sink) {
    try {
      sink.event(t, x);
    } catch (e) {
      sink.error(t, e);
    }
  }

  function tryEnd(t, x, sink) {
    try {
      sink.end(t, x);
    } catch (e) {
      sink.error(t, e);
    }
  }

  var CreateSubscriber = function () {
    function CreateSubscriber(sink, scheduler, subscribe) {
      _classCallCheck(this, CreateSubscriber);

      this.sink = sink;
      this.scheduler = scheduler;
      this.active = true;
      this._unsubscribe = this._init(subscribe);
    }

    _createClass(CreateSubscriber, [{
      key: '_init',
      value: function _init(subscribe) {
        var _this = this;

        var add = function add(x) {
          return _this._add(x);
        };
        var end = function end(x) {
          return _this._end(x);
        };
        var error = function error(e) {
          return _this._error(e);
        };

        try {
          return subscribe(add, end, error);
        } catch (e) {
          error(e);
        }
      }
    }, {
      key: '_add',
      value: function _add(x) {
        if (!this.active) {
          return;
        }
        tryEvent(this.scheduler.now(), x, this.sink);
      }
    }, {
      key: '_end',
      value: function _end(x) {
        if (!this.active) {
          return;
        }
        this.active = false;
        tryEnd(this.scheduler.now(), x, this.sink);
      }
    }, {
      key: '_error',
      value: function _error(x) {
        this.active = false;
        this.sink.error(this.scheduler.now(), x);
      }
    }, {
      key: 'dispose',
      value: function dispose() {
        this.active = false;
        if (typeof this._unsubscribe === 'function') {
          return this._unsubscribe.call(void 0);
        }
      }
    }]);

    return CreateSubscriber;
  }();

  var Create = function () {
    function Create(subscribe) {
      _classCallCheck(this, Create);

      this._subscribe = subscribe;
    }

    _createClass(Create, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return new CreateSubscriber(new DeferredSink(sink), scheduler, this._subscribe);
      }
    }]);

    return Create;
  }();

  var index = function index(run) {
    return new _most.Stream(new _multicast.MulticastSource(new Create(run)));
  };

  exports.default = index;
});
