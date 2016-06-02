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
    function PropagateAllTask(sink, time, events) {
      _classCallCheck(this, PropagateAllTask);

      this.sink = sink;
      this.time = time;
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
          this.time = event.time;
          sink.event(event.time, event.value);
        }

        events.length = 0;
      }
    }, {
      key: 'error',
      value: function error(e) {
        this.sink.error(this.time, e);
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
          defer(new PropagateAllTask(this.sink, t, this.events));
        }

        this.events.push({ time: t, value: x });
      }
    }, {
      key: 'end',
      value: function end(t, x) {
        if (!this.active) {
          return;
        }

        this._end(new EndTask(t, x, this.sink));
      }
    }, {
      key: 'error',
      value: function error(t, e) {
        this._end(new ErrorTask(t, e, this.sink));
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

  var CreateSubscriber = function () {
    function CreateSubscriber(sink, scheduler, subscribe) {
      _classCallCheck(this, CreateSubscriber);

      this.sink = sink;
      this.scheduler = scheduler;
      this._unsubscribe = this._init(subscribe);
    }

    _createClass(CreateSubscriber, [{
      key: '_init',
      value: function _init(subscribe) {
        var _this = this;

        var add = function add(x) {
          return _this.sink.event(_this.scheduler.now(), x);
        };
        var end = function end(x) {
          return _this.sink.end(_this.scheduler.now(), x);
        };
        var error = function error(e) {
          return _this.sink.error(_this.scheduler.now(), e);
        };

        try {
          return subscribe(add, end, error);
        } catch (e) {
          error(e);
        }
      }
    }, {
      key: 'dispose',
      value: function dispose() {
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
