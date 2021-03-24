import { Container } from '@tiejs/common'
import { Logger } from '@tsed/logger'
import { join } from 'path'

export function InjectLogger(type = '') {
  return function(object: any, propertyName: string, index?: number) {
    Container.registerHandler({
      object,
      propertyName,
      index,
      value: () => {
        const logger = new Logger(type)
        const cwd = process.cwd()
        const filename = join(cwd, 'logs', 'app.log')
        logger.appenders
          .set('std-log', {
            type: 'stdout',
            levels: ['debug', 'info', 'trace', 'warn', 'error'],
          })
          .set('all-log-file', {
            type: 'file',
            filename,
            layout: {
              type: 'json',
              separator: ',',
              maxLogSize: 10485760,
              backups: 3,
            },
          })

        return logger
      },
    })
  }
}
