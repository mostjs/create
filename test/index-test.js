import { describe, it } from 'mocha'
import assert from 'assert'
import { spy } from 'sinon'

import { create } from '../src/index'

import { observe, take } from 'most'

describe('create', () => {
  it('should return a compatible stream', () => {
    const { source } = create(() => {})
    assert.equal(typeof source.run, 'function')
  })

  it('should not call producer immediately', () => {
    create(() => { throw new Error('should not be called') })
  })

  it('should call producer after first subscriber', () => {
    return observe(() => {}, create((add, end) => end()))
  })

  it('should contain added items', () => {
    const expected = {}
    const producer = (add, end) => {
      add(expected)
      add(expected)
      end()
    }

    const observer = spy(x => assert.strictEqual(expected, x))

    return observe(observer, create(producer))
      .then(() => assert.strictEqual(2, observer.callCount))
  })

  it('should call disposer on end', () => {
    const expected = {}
    const unsubscribe = spy()
    const producer = (add, end) => {
      add(expected)
      end()
      add({})

      return unsubscribe()
    }

    const observer = spy(x => assert.strictEqual(expected, x))

    return observe(observer, create(producer))
      .then(() => {
        assert.strictEqual(1, observer.callCount)
        assert.strictEqual(1, unsubscribe.callCount)
      })
  })

  it('should prevent events after dispose', () => {
    const s = create(add => {
      add(1)
      add(2)
    })

    take(1, s).reduce((a, x) => a.concat(x), [])
      .then(events => {
        assert.strictEqual(events.length, 1)
        assert.strictEqual(events[0].value, 1)
      })
  })

  it('should propagate error thrown synchronously from publisher', () => {
    const error = new Error()
    const s1 = create(() => {
      throw error
    })

    return observe(x => { throw new Error('should not observe any events') }, s1)
      .then(assert.ifError, e => assert.strictEqual(error, e))
  })
})
