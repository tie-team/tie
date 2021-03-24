import { Application, Container } from '@tiejs/common'

export function InjectEmitter() {
  return (object: any, propertyName: string, index?: number) => {
    Container.registerHandler({
      object,
      propertyName,
      index,
      value: () => {
        const app = Container.get<Application>('TIE_APP')
        const { config } = app
        return config.eventEmitter
      },
    })
  }
}
