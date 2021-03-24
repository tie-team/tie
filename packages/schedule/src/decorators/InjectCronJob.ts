import { Application, Container } from '@tiejs/common'

export function InjectCronJob(name: string) {
  return (object: any, propertyName: string, index?: number) => {
    Container.registerHandler({
      object,
      propertyName,
      index,
      value: () => {
        const app = Container.get<Application>('TIE_APP')
        const { config } = app
        if (!name) throw new Error()
        if (config.cronJobs && config.cronJobs[name]) {
          return config.cronJobs[name]
        }
        return null
      },
    })
  }
}
