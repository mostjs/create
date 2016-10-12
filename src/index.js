/** @license MIT License (c) copyright 2016 original author or authors */

import { Stream } from 'most'
import { MulticastSource } from '@most/multicast'
import Create from './Create'

export function create (run) {
  return new Stream(new MulticastSource(new Create(run)))
}
