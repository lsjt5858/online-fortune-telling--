import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { DivinationRepository, UserRepository } from '@shared/repositories'
import { DivinationType, DivinationInput, DivinationResult, PaginationParams, PaginationResponse } from '@shared/types'
import { calculateBazi, BaziInput, BaziResult } from '@shared/utils/bazi'
import { calculateQimen, QimenInput, QimenResult } from '@shared/utils/qimen'

// 每日免费次数限制
const DAILY_FREE_LIMIT: Record<DivinationType, number> = {
  [DivinationType.BAZI]: 3,
  [DivinationType.QIMEN]: 1,
  [DivinationType.BAGUA]: 3,
  [DivinationType.MEIHUA]: 2,
}

// VIP 专属类型
const VIP_ONLY_TYPES = [DivinationType.QIMEN]

@Injectable()
export class DivinationService {
  constructor(
    private readonly divinationRepo: DivinationRepository,
    private readonly userRepo: UserRepository,
  ) {}

  /**
   * 获取占卜类型列表
   */
  getTypes() {
    return [
      {
        type: DivinationType.BAZI,
        name: '八字排盘',
        description: '基于生辰八字，解析命运走势',
        icon: 'calendar-star',
        isVip: false,
        dailyFreeLimit: DAILY_FREE_LIMIT[DivinationType.BAZI],
      },
      {
        type: DivinationType.QIMEN,
        name: '奇门遁甲',
        description: '中国古代最高预测学',
        icon: 'compass',
        isVip: true,
        dailyFreeLimit: DAILY_FREE_LIMIT[DivinationType.QIMEN],
      },
      {
        type: DivinationType.BAGUA,
        name: '八卦测算',
        description: '易经八卦，洞察天地玄机',
        icon: 'hexagon',
        isVip: false,
        dailyFreeLimit: DAILY_FREE_LIMIT[DivinationType.BAGUA],
      },
      {
        type: DivinationType.MEIHUA,
        name: '梅花易数',
        description: '宋代邵雍所传，占卜灵验',
        icon: 'flower',
        isVip: false,
        dailyFreeLimit: DAILY_FREE_LIMIT[DivinationType.MEIHUA],
      },
    ]
  }

  /**
   * 执行占卜计算
   */
  async calculate(userId: string, input: DivinationInput): Promise<DivinationResult> {
    // 检查用户 VIP 状态
    const isVip = await this.userRepo.isVip(userId)

    // VIP 专属类型检查
    if (VIP_ONLY_TYPES.includes(input.type) && !isVip) {
      throw new ForbiddenException('该占卜类型仅限 VIP 会员使用')
    }

    // 检查每日免费次数
    if (!isVip) {
      const usedCount = await this.divinationRepo.getUserFreeCount(userId, input.type)
      const limit = DAILY_FREE_LIMIT[input.type] || 1
      if (usedCount >= limit) {
        throw new ForbiddenException(`今日免费次数已用完（${limit}次/天），请开通 VIP 继续使用`)
      }
    }

    // 执行占卜计算
    let resultData: Record<string, unknown>

    switch (input.type) {
      case DivinationType.BAZI:
        resultData = this.calculateBazi(input) as unknown as Record<string, unknown>
        break
      case DivinationType.QIMEN:
        resultData = this.calculateQimen(input) as unknown as Record<string, unknown>
        break
      case DivinationType.BAGUA:
        resultData = this.calculateBagua(input)
        break
      case DivinationType.MEIHUA:
        resultData = this.calculateMeihua(input)
        break
      default:
        throw new ForbiddenException('不支持的占卜类型')
    }

    // 保存记录
    const record = await this.divinationRepo.create(
      userId,
      input.type,
      input,
      resultData,
      isVip,
    )

    return record
  }

  /**
   * 获取占卜结果详情
   */
  async getResult(userId: string, id: string): Promise<DivinationResult> {
    const result = await this.divinationRepo.findById(id)

    if (!result) {
      throw new NotFoundException('占卜记录不存在')
    }

    // 检查权限
    if (result.userId !== userId) {
      throw new ForbiddenException('无权查看此记录')
    }

    return result
  }

  /**
   * 获取历史记录
   */
  async getHistory(userId: string, pagination: PaginationParams): Promise<PaginationResponse<DivinationResult>> {
    return this.divinationRepo.findByUserId(userId, pagination)
  }

  /**
   * 获取每日免费次数
   */
  async getDailyFreeCount(userId: string, type: DivinationType): Promise<{ used: number; limit: number }> {
    const used = await this.divinationRepo.getUserFreeCount(userId, type)
    const limit = DAILY_FREE_LIMIT[type] || 1

    return { used, limit }
  }

  /**
   * 八字排盘计算
   */
  private calculateBazi(input: DivinationInput): BaziResult {
    const baziInput: BaziInput = {
      name: input.name,
      gender: input.gender,
      birthYear: input.birthYear,
      birthMonth: input.birthMonth,
      birthDay: input.birthDay,
      birthHour: input.birthHour,
      birthMinute: input.birthMinute,
      isLunar: input.isLunar,
    }

    return calculateBazi(baziInput)
  }

  /**
   * 奇门遁甲计算
   */
  private calculateQimen(input: DivinationInput): QimenResult {
    const qimenInput: QimenInput = {
      name: input.name,
      gender: input.gender,
      birthYear: input.birthYear,
      birthMonth: input.birthMonth,
      birthDay: input.birthDay,
      birthHour: input.birthHour,
      birthMinute: input.birthMinute,
      isLunar: input.isLunar,
    }

    return calculateQimen(qimenInput)
  }

  /**
   * 八卦测算（简化版）
   */
  private calculateBagua(input: DivinationInput): Record<string, unknown> {
    // 根据出生时间计算本命卦
    const { birthYear, birthMonth, birthDay, gender } = input

    // 计算卦数
    const yearSum = birthYear.toString().split('').reduce((a, b) => a + parseInt(b), 0)
    const monthSum = birthMonth
    const daySum = birthDay

    // 上卦和下卦
    const upperGua = (yearSum + monthSum) % 8 || 8
    const lowerGua = (monthSum + daySum) % 8 || 8

    // 八卦名称
    const guaNames = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤']
    const guaElements = ['金', '金', '火', '木', '木', '水', '土', '土']

    const upperGuaName = guaNames[upperGua - 1]
    const lowerGuaName = guaNames[lowerGua - 1]

    // 本命卦
    const benMingGua = gender === 'male'
      ? guaNames[(11 - (birthYear % 9)) % 8]
      : guaNames[(birthYear % 9 + 3) % 8]

    return {
      name: input.name,
      gender: gender === 'male' ? '男' : '女',
      birthDate: `${birthYear}年${birthMonth}月${birthDay}日`,
      upperGua: upperGuaName,
      lowerGua: lowerGuaName,
      hexagram: `${upperGuaName}${lowerGuaName}卦`,
      benMingGua,
      benMingElement: guaElements[guaNames.indexOf(benMingGua)],
      interpretation: this.getBaguaInterpretation(upperGuaName, lowerGuaName),
      suggestions: this.getBaguaSuggestions(benMingGua),
    }
  }

  /**
   * 梅花易数计算（简化版）
   */
  private calculateMeihua(input: DivinationInput): Record<string, unknown> {
    const { birthYear, birthMonth, birthDay, birthHour, birthMinute } = input

    // 梅花易数起卦
    const upperNum = (birthYear + birthMonth + birthDay) % 8 || 8
    const lowerNum = (birthYear + birthMonth + birthDay + birthHour) % 8 || 8
    const changingLine = (birthYear + birthMonth + birthDay + birthHour + birthMinute) % 6 || 6

    const guaNames = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤']

    const upperGua = guaNames[upperNum - 1]
    const lowerGua = guaNames[lowerNum - 1]

    // 体用关系
    const tiGua = changingLine <= 3 ? lowerGua : upperGua
    const yongGua = changingLine <= 3 ? upperGua : lowerGua

    return {
      name: input.name,
      birthDate: `${birthYear}年${birthMonth}月${birthDay}日`,
      birthTime: `${birthHour}:${birthMinute.toString().padStart(2, '0')}`,
      upperGua,
      lowerGua,
      hexagram: `${upperGua}${lowerGua}卦`,
      changingLine: `第${changingLine}爻`,
      tiGua,
      yongGua,
      tiYongRelation: this.getTiYongRelation(tiGua, yongGua),
      interpretation: this.getMeihuaInterpretation(upperGua, lowerGua, changingLine),
      suggestions: this.getMeihuaSuggestions(tiGua, yongGua),
    }
  }

  private getBaguaInterpretation(upper: string, lower: string): string {
    const interpretations: Record<string, string> = {
      '乾乾': '乾为天，刚健中正，自强不息',
      '坤坤': '坤为地，厚德载物，顺势而为',
      '乾坤': '天地否，闭塞不通，宜守不宜进',
      '坤乾': '地天泰，通泰亨通，万事顺遂',
    }
    return interpretations[`${upper}${lower}`] || `${upper}${lower}卦，需综合分析`
  }

  private getBaguaSuggestions(benMingGua: string): string[] {
    const suggestions: Record<string, string[]> = {
      '乾': ['适合领导岗位', '宜向西北方发展', '幸运颜色：白色、金色'],
      '坤': ['适合辅助工作', '宜向西南方发展', '幸运颜色：黄色、棕色'],
      '震': ['适合开创事业', '宜向东方发展', '幸运颜色：绿色、青色'],
      '巽': ['适合文职工作', '宜向东南方发展', '幸运颜色：绿色'],
      '坎': ['适合智慧型工作', '宜向北方发展', '幸运颜色：黑色、蓝色'],
      '离': ['适合表现型工作', '宜向南方发展', '幸运颜色：红色、紫色'],
      '艮': ['适合稳定型工作', '宜向东北方发展', '幸运颜色：黄色'],
      '兑': ['适合交际型工作', '宜向西方发展', '幸运颜色：白色'],
    }
    return suggestions[benMingGua] || ['需根据具体情况分析']
  }

  private getTiYongRelation(ti: string, yong: string): string {
    const elements: Record<string, string> = {
      '乾': '金', '兑': '金', '离': '火', '震': '木',
      '巽': '木', '坎': '水', '艮': '土', '坤': '土',
    }

    const tiElement = elements[ti]
    const yongElement = elements[yong]

    const shengKe: Record<string, string> = {
      '木火': '体生用，耗泄之象',
      '火土': '体生用，耗泄之象',
      '土金': '体生用，耗泄之象',
      '金水': '体生用，耗泄之象',
      '水木': '体生用，耗泄之象',
      '火木': '用生体，得助之象',
      '土火': '用生体，得助之象',
      '金土': '用生体，得助之象',
      '水金': '用生体，得助之象',
      '木水': '用生体，得助之象',
    }

    if (tiElement === yongElement) {
      return '体用比和，平稳之象'
    }

    return shengKe[`${tiElement}${yongElement}`] || '需详细分析'
  }

  private getMeihuaInterpretation(upper: string, lower: string, line: number): string {
    return `${upper}${lower}卦，动爻在第${line}爻，主变化在${line <= 3 ? '下' : '上'}卦`
  }

  private getMeihuaSuggestions(ti: string, yong: string): string[] {
    return [
      `体卦为${ti}，代表自身`,
      `用卦为${yong}，代表所问之事`,
      '宜顺势而为，不宜强求',
    ]
  }
}
