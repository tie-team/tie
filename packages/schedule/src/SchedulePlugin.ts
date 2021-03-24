import { Injectable, IPlugin, Container, InjectApp, Application } from '@tiejs/common'
import cron from 'node-cron'
import { methodStore } from './methodStore'
import { getClassMethodNames } from './utils/getClassMethodNames'
import { MethodStoreValue, CronJob, ScheduleConfig } from './types'

@Injectable()
export class SchedulePlugin implements IPlugin {
  constructor(@InjectApp() private app: Application) {
    const { config } = this.app
    if (!config.cronJobs) config.cronJobs = {}
  }

  cron(instance: any, value: MethodStoreValue) {
    const { config } = this.app
    const { cronTime, cronOptions, propertyKey } = value
    const job = cron.schedule(cronTime, () => instance[propertyKey](), {
      scheduled: !cronOptions.lazy,
    })

    const name = cronOptions.name || propertyKey
    config.cronJobs[name] = job
    config.cronJobs[name].running = job.getStatus() === 'scheduled'
  }

  timeout(instance: any, value: MethodStoreValue) {
    const { config } = this.app
    const { time, timerOptions, propertyKey } = value
    const name = timerOptions.name || propertyKey
    let id: any = null

    if (!timerOptions.lazy) {
      id = setTimeout(() => instance[propertyKey](), time)
    }

    config.cronJobs[name] = {
      running: false,
      start() {
        if (this.running) return
        id = setTimeout(() => instance[propertyKey](), time)
        this.running = true
        return this
      },
      stop() {
        if (!id) return
        clearTimeout(id)
        this.running = false
        return this
      },
    } as CronJob
  }

  interval(instance: any, value: MethodStoreValue) {
    const { config } = this.app
    const { time, timerOptions, propertyKey } = value
    const name = timerOptions.name || propertyKey
    let id: any = null

    if (!timerOptions.lazy) {
      id = setInterval(() => instance[propertyKey](), time)
    }

    config.cronJobs[name] = {
      running: false,
      start() {
        if (this.running) return
        id = setInterval(() => instance[propertyKey](), time)
        this.running = true
        return this
      },
      stop() {
        if (!id) return
        clearInterval(id)
        this.running = false
        return this
      },
    } as CronJob
  }

  async appDidReady(app: Application) {
    const scheduleConfig: ScheduleConfig = app.config.schedule || {}
    let { schedules = [], enable } = scheduleConfig

    if (!Reflect.has(scheduleConfig, 'enable')) {
      // 默认 enable 为 true
      // 这是全局的 enable 配置
      enable = true
    }

    for (const ScheduleClass of schedules) {
      let instance = Container.get<any>(ScheduleClass)
      const methodNames = getClassMethodNames(ScheduleClass)

      for (const methodName of methodNames) {
        const fn = instance[methodName]
        const value = methodStore.get(fn)
        const { cronOptions = {}, timerOptions = {} } = value

        // 如果方法内有 enable， 则用防范内的 enable 配置，它优先级最高，不管是 true or false

        if (value.taskType === 'cron') {
          if (Reflect.has(cronOptions, 'enable')) {
            if (cronOptions.enable) {
              this[value.taskType](instance, value)
            }
          } else {
            if (enable) {
              this[value.taskType](instance, value)
            }
          }
        } else {
          if (Reflect.has(timerOptions, 'enable')) {
            if (timerOptions.enable) {
              this[value.taskType](instance, value)
            }
          } else {
            if (enable) {
              this[value.taskType](instance, value)
            }
          }
        }
      }
    }
  }
}
