import { Container } from '@tiejs/common'
import { Logger } from '@tsed/logger'
import { join } from 'path'

const file = 'common.log'

export function InjectCommonLogger(type = '') {
  return function(object: any, propertyName: string, index?: number) {
    Container.registerHandler({
      object,
      propertyName,
      index,
      value: () => {
        const logger = new Logger(type)
        const cwd = process.cwd()
        const filename = join(cwd, 'logs', file)

        logger.appenders.set('common.log', {
          type: 'file',
          filename,
          layout: {
            type: 'json',
            separator: ',',
          },
          pattern: '.yyyy-MM-dd',
        })

        return logger
      },
    })
  }
}
