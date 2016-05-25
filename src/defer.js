/** @license MIT License (c) copyright 2010-2016 original author or authors */

export default task => Promise.resolve(task).then(runTask)

export function runTask (task) {
  try {
    return task.run()
  } catch (e) {
    return task.error(e)
  }
}
