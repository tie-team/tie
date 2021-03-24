export interface ScheduleConfig {
  enable?: boolean
  schedules?: any[]
  patterns?: string | string[]
}

export interface ClassType<T = any> {
  new (...args: any[]): T
}

export interface CronJob {
  running: boolean
  start: () => this
  stop: () => this
}

export interface CronOptions {
  /**
   * The unique name for CronJob, you can `InjectCronJob(<name>)` to somewhere.
   */
  name?: string

  timeZone?: string

  /**
   * 为 true 时，定时任务不会被启动，默认为false
   */
  lazy?: boolean

  /**
   * delay to start task
   */
  // delay?: number

  /**
   * NODE_ENV
   */
  env?: string

  /**
   * 是否开启，也就是开启的条件
   */
  enable?: boolean | (() => boolean)
}

export interface MethodStoreValue {
  taskType: 'cron' | 'interval' | 'timeout'
  cronTime: string
  time: number
  cronOptions: CronOptions
  timerOptions: TimerOptions
  fn: any
  target: Object
  propertyKey: any
}

export interface TimerOptions {
  /**
   * The unique name for CronJob, you can `InjectCronJob(<name>)` to somewhere.
   */
  name?: string

  /**
   * 是否自动启动任务，为 true 时，定时任务不会被启动，默认为false
   */
  lazy?: boolean

  /**
   * delay to start task
   */
  delay?: number

  /**
   * NODE_ENV
   */
  env?: string

  /**
   * 是否开启，也就是开启的条件
   */
  enable?: boolean | (() => boolean)
}
