import { Controller, Post, Get, Body, Param, Query, Request } from '@nestjs/common'
import { IsString, IsNotEmpty, IsEnum, IsNumber, IsBoolean, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'
import { Public } from '../decorators/public.decorator'
import { DivinationService } from '../services/divination.service'
import { DivinationType } from '@shared/types'

export class DivinationInputDto {
  @IsEnum(DivinationType)
  type: DivinationType

  @IsString()
  @IsNotEmpty()
  name: string

  @IsEnum(['male', 'female'])
  gender: 'male' | 'female'

  @IsNumber()
  @Min(1900)
  @Max(2100)
  birthYear: number

  @IsNumber()
  @Min(1)
  @Max(12)
  birthMonth: number

  @IsNumber()
  @Min(1)
  @Max(31)
  birthDay: number

  @IsNumber()
  @Min(0)
  @Max(23)
  birthHour: number

  @IsNumber()
  @Min(0)
  @Max(59)
  birthMinute: number

  @IsBoolean()
  isLunar: boolean
}

export class PaginationDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  pageSize: number = 10
}

@Controller('v1/divination')
export class DivinationController {
  constructor(private readonly divinationService: DivinationService) {}

  /**
   * 获取占卜类型列表（公开接口）
   */
  @Public()
  @Get('types')
  getTypes() {
    return this.divinationService.getTypes()
  }

  /**
   * 执行占卜计算
   */
  @Post('calculate')
  async calculate(@Request() req, @Body() dto: DivinationInputDto) {
    return this.divinationService.calculate(req.user.userId, dto)
  }

  /**
   * 获取占卜结果详情
   */
  @Get('result/:id')
  async getResult(@Request() req, @Param('id') id: string) {
    return this.divinationService.getResult(req.user.userId, id)
  }

  /**
   * 获取历史记录
   */
  @Get('history')
  async getHistory(@Request() req, @Query() pagination: PaginationDto) {
    return this.divinationService.getHistory(req.user.userId, pagination)
  }

  /**
   * 获取每日免费次数
   */
  @Get('daily/free')
  async getDailyFreeCount(
    @Request() req,
    @Query('type') type: DivinationType = DivinationType.BAZI,
  ) {
    return this.divinationService.getDailyFreeCount(req.user.userId, type)
  }
}
