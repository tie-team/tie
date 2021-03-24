import { Container } from 'typedi'
import get from 'lodash.get'
import { Application } from '../interfaces/Application'

export function InjectConfig(key?: string) {
  return function(object: any, propertyName: string, index?: number) {
    Container.registerHandler({
      object,
      propertyName,
      index,
      value: () => {
        const app = Container.get<Application>('TIE_APP')
        const config = app.config
        if (!key) return config
        // TODO: should check key
        return get(config, key)
      },
    })
  }
}
