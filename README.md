# @most/create

Imperatively push events into a Stream.

## Install

```
npm install --save most @most/create
```

## API

#### create :: (Error e) &rArr; Publisher a b e &rarr; Stream

Publisher :: (Error e) &rArr; ((a &rarr; void) &rarr; (b &rarr; void) &rarr; (e &rarr; void)) &rarr; (void &rarr; void)

Create a push-stream for imperatively pushing events, primarily for situations where declarative sources can't be used.

The publisher function receives 3 functions as arguments, which it can use to publish events, end the stream, or signal an error.  It may return a *dispose* function.  The dispose function will be called once all consumers have lost interest in the stream, and should free any resources held by the publisher.

Note that the publisher will not be called until there is *demand* for the stream's events.  Specifically, the publisher will be called when the number of observers goes from zero to one.  Likewise, the *dispose* function will be called when the number of observers again returns to zero.  The publisher would then be called again if the number of observers subsequently goes from zero to one, and so on.

#### add, end, and error
The publisher function can use `add`, `end`, and `error`:

* `add(x)` - Add `x` to the stream
* `end()` - End the stream. Any later calls to `add`, `end`, or `error` will be no-ops.
* `error(e)` - Signal that the stream has failed and cannot produce more events.

**Important**

* If you never call `end` or `error`, the stream will never end, and consumers will wait forever for additional events.

* Pulling the `add`, `end`, and/or `error` functions out of the publisher closure is *not supported*.

<!-- skip-example -->
```js
// Unsupported:
let emitEvent, emitEnd, emitError

const stream = most.create((add, end, error) => {
  emitEvent = add
  emitEnd = end
  emitError = error
})

emitEvent(123)
emitEnd()
```

#### dispose

If the publisher returns a dispose function, it will be called when the stream ends or errors--for example, when the publisher explicitly calls `end` or `error`, or when all consumers lose interest.

* `dispose` - free resources held by the publisher

Note that if the stream neither ends nor fails, the dispose function will never be called.

#### Examples

Using `add` and `end` to push events and then end the stream.

```js
import create from '@most/create'

// Add events and then end
const stream = create((add, end, error) => {
	setTimeout(add, 1000, 'event 1')
	setTimeout(add, 3000, 'event 2')
	setTimeout(() => {
		add('event 3')
		end()
	}, 10000)

	// OPTIONAL: Return a dispose function to clean up
	// resources when the stream ends
	return () => console.log('dispose')
})

// Logs
// 'event 1' after 1 second
// 'event 2' after 3 seconds
// 'event 3' after 10 seconds
// 'dispose' after 10 seconds
stream.forEach(x => console.log(x));
```

Using `error` to fail the stream and propagate an Error:

```js
import create from '@most/create'

// Add events and then fail
const stream = create((add, end, error) => {
	setTimeout(add, 1000, 'event 1');
	setTimeout(() => error(new Error('oops!')), 3000)
});

// Logs
// 'event 1' after 1 second
// '[Error: oops!]' after 3 seconds
stream
	.forEach(x => console.log(x))
	.catch(e => console.error(e)); // Catch the error as a promise
```
