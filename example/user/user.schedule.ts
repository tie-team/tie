import { Schedule, Cron, Interval, Timeout } from '@tiejs/schedule'
import { InjectLogger, Logger } from '@tiejs/logger'
@Schedule()
export class CacheSchedule {
  constructor(@InjectLogger() private logger: Logger) {}
  // 每隔 1 分钟执行任务 */1 * * * *
  // 每隔 5 秒执行 */5 * * * * *
  @Cron('*/5 * * * * *', { enable: true })
  async updateArticleCache() {
    // await sleep(2000)
    this.logger.debug('Article cache updated')
  }
  // 每隔 10 秒执行任务
  @Interval(10000, { enable: false })
  updateUserCache() {
    this.logger.debug('User cache updated')
  }
  // 延迟 10 秒执行任务
  @Timeout(10000)
  updateCommentCache() {
    this.logger.debug('Comment cache updated')
  }
}
