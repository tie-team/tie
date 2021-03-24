import { ClassType } from '../types'
export function getClassMethodNames(TargetClass: ClassType) {
  const instance = new TargetClass()
  const prototype = Object.getPrototypeOf(instance)
  const propertyNames = Object.getOwnPropertyNames(prototype)
  const methodNames = propertyNames.filter(item => {
    return item !== 'constructor'
  })
  return methodNames
}
