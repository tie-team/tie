import { Container } from 'typedi'
import { Application } from '../interfaces/Application'

export function InjectServer() {
  return function(object: any, propertyName: string, index?: number) {
    Container.registerHandler({
      object,
      propertyName,
      index,
      value: () => {
        return Container.get<Application>('TIE_SERVER')
      },
    })
  }
}
