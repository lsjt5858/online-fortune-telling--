import { Injectable, LoggerService, Scope } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  private context: string
  private logDir = path.join(process.cwd(), 'logs')

  constructor() {
    // 确保日志目录存在
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  setContext(context: string) {
    this.context = context
  }

  log(message: any, context?: string) {
    this.printMessage(message, 'LOG', context)
  }

  error(message: any, trace?: string, context?: string) {
    this.printMessage(message, 'ERROR', context)
    if (trace) {
      this.printMessage(trace, 'ERROR', context)
    }
  }

  warn(message: any, context?: string) {
    this.printMessage(message, 'WARN', context)
  }

  debug(message: any, context?: string) {
    this.printMessage(message, 'DEBUG', context)
  }

  verbose(message: any, context?: string) {
    this.printMessage(message, 'VERBOSE', context)
  }

  private printMessage(message: any, level: string, context?: string) {
    const timestamp = new Date().toISOString()
    const ctx = context || this.context || 'Application'
    const logMessage = `[${timestamp}] [${level}] [${ctx}] ${this.formatMessage(message)}`

    // 控制台输出
    console.log(logMessage)

    // 写入文件
    this.writeToFile(logMessage, level)
  }

  private formatMessage(message: any): string {
    if (typeof message === 'string') {
      return message
    }
    return JSON.stringify(message)
  }

  private writeToFile(message: string, level: string) {
    const date = new Date().toISOString().split('T')[0]
    const fileName = path.join(this.logDir, `${date}.log`)

    try {
      fs.appendFileSync(fileName, message + '\n', 'utf8')
    } catch (error) {
      console.error('Failed to write log to file:', error)
    }
  }
}
