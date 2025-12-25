/**
 * 八字算命算法
 * 根据出生日期时间计算八字、五行、十神等信息
 */

import {
  solarToLunar,
  getYearGanZhi,
  getMonthGanZhi,
  getDayGanZhi,
  getHourGanZhi,
  getShiChen,
  getWuXing,
  type LunarDate,
  type GzYear,
  type GzMonth,
  type GzDay,
  type GzHour,
} from './calendar'

// 天干十神
const SHI_SHEN_MAP: Record<string, Record<string, string>> = {
  甲: { 甲: '比肩', 乙: '劫财', 丙: '食神', 丁: '伤官', 戊: '偏财', 己: '正财', 庚: '七杀', 辛: '正官', 壬: '偏印', 癸: '正印' },
  乙: { 甲: '劫财', 乙: '比肩', 丙: '伤官', 丁: '食神', 戊: '正财', 己: '偏财', 庚: '正官', 辛: '七杀', 壬: '正印', 癸: '偏印' },
  丙: { 甲: '偏印', 乙: '正印', 丙: '比肩', 丁: '劫财', 戊: '食神', 己: '伤官', 庚: '偏财', 辛: '正财', 壬: '七杀', 癸: '正官' },
  丁: { 甲: '正印', 乙: '偏印', 丙: '劫财', 丁: '比肩', 戊: '伤官', 己: '食神', 庚: '正财', 辛: '偏财', 壬: '正官', 癸: '七杀' },
  戊: { 甲: '七杀', 乙: '正官', 丙: '偏印', 丁: '正印', 戊: '比肩', 己: '劫财', 庚: '食神', 辛: '伤官', 壬: '偏财', 癸: '正财' },
  己: { 甲: '正官', 乙: '七杀', 丙: '正印', 丁: '偏印', 戊: '劫财', 己: '比肩', 庚: '伤官', 辛: '食神', 壬: '正财', 癸: '偏财' },
  庚: { 甲: '偏财', 乙: '正财', 丙: '七杀', 丁: '正官', 戊: '偏印', 己: '正印', 庚: '比肩', 辛: '劫财', 壬: '食神', 癸: '伤官' },
  辛: { 甲: '正财', 乙: '偏财', 丙: '正官', 丁: '七杀', 戊: '正印', 己: '偏印', 庚: '劫财', 辛: '比肩', 壬: '伤官', 癸: '食神' },
  壬: { 甲: '食神', 乙: '伤官', 丙: '偏财', 丁: '正财', 戊: '七杀', 己: '正官', 庚: '偏印', 辛: '正印', 壬: '比肩', 癸: '劫财' },
  癸: { 甲: '伤官', 乙: '食神', 丙: '正财', 丁: '偏财', 戊: '正官', 己: '七杀', 庚: '正印', 辛: '偏印', 壬: '劫财', 癸: '比肩' },
}

// 五行强弱分析
const WU_XING_STRENGTH = {
  旺: '最强',
  相: '次强',
  休: '中和偏弱',
  囚: '偏弱',
  死: '最弱',
}

export interface BaziInput {
  name: string
  gender: 'male' | 'female'
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: number
  birthMinute: number
  isLunar: boolean
}

export interface BaziResult {
  // 基本信息
  name: string
  gender: string
  birthDate: string
  birthTime: string
  lunarDate: string

  // 八字四柱
  yearPillar: string
  monthPillar: string
  dayPillar: string
  hourPillar: string

  // 八字详情
  yearGan: string
  yearZhi: string
  yearZodiac: string
  monthGan: string
  monthZhi: string
  dayGan: string
  dayZhi: string
  hourGan: string
  hourZhi: string
  shiChen: string

  // 日主分析
  dayMaster: string
  dayMasterWuXing: string

  // 十神分析
  shiShen: {
    year: string
    month: string
    hour: string
  }

  // 五行分析
  wuXing: {
    year: string
    month: string
    day: string
    hour: string
  }

  // 五行统计
  wuXingCount: {
    wood: number
    fire: number
    earth: number
    metal: number
    water: number
  }

  // 五行强弱
  wuXingStrength: {
    strongest: string[]
    strong: string[]
    weak: string[]
    weakest: string[]
  }

  // 用神喜忌
  favorableElements: string[]
  unfavorableElements: string[]

  // 性格特点
  personality: string[]

  // 事业财运
  career: string[]
  wealth: string[]

  // 婚姻感情
  marriage: string[]

  // 健康
  health: string[]

  // 五行建议
  suggestions: string[]
}

/**
 * 八字算命主函数
 */
export function calculateBazi(input: BaziInput): BaziResult {
  const { name, gender, birthYear, birthMonth, birthDay, birthHour, isLunar } = input

  // 转换为农历（如果输入是公历）
  let lunar: LunarDate
  if (isLunar) {
    lunar = {
      lunarYear: birthYear,
      lunarMonth: birthMonth,
      lunarDay: birthDay,
      isLeapMonth: false,
    }
  } else {
    lunar = solarToLunar(birthYear, birthMonth, birthDay)
  }

  // 计算四柱
  const yearGz = getYearGanZhi(birthYear, birthMonth, birthDay)
  const monthGz = getMonthGanZhi(birthYear, birthMonth, birthDay)
  const dayGz = getDayGanZhi(birthYear, birthMonth, birthDay)
  const hourGz = getHourGanZhi(birthYear, birthMonth, birthDay, birthHour)

  // 日主（日干）
  const dayMaster = dayGz.stem

  // 五行统计
  const wuXingCount = countWuXing(yearGz, monthGz, dayGz, hourGz)

  // 五行强弱分析
  const wuXingStrength = analyzeWuXingStrength(wuXingCount)

  // 用神喜忌
  const { favorableElements, unfavorableElements } = determineYongShen(
    dayMaster,
    wuXingCount,
    wuXingStrength
  )

  // 性格分析
  const personality = analyzePersonality(dayMaster, yearGz, monthGz, hourGz)

  // 事业财运
  const career = analyzeCareer(dayMaster, favorableElements)
  const wealth = analyzeWealth(dayMaster, favorableElements)

  // 婚姻分析
  const marriage = analyzeMarriage(gender, dayMaster, yearGz, monthGz, hourGz)

  // 健康分析
  const health = analyzeHealth(wuXingCount)

  // 五行建议
  const suggestions = generateSuggestions(wuXingCount, favorableElements)

  return {
    name,
    gender: gender === 'male' ? '男' : '女',
    birthDate: `${birthYear}年${birthMonth}月${birthDay}日`,
    birthTime: `${birthHour.toString().padStart(2, '0')}:${input.birthMinute.toString().padStart(2, '0')}`,
    lunarDate: `${lunar.lunarYear}年${lunar.lunarMonth}月${lunar.lunarDay}日${lunar.isLeapMonth ? '(闰)' : ''}`,

    yearPillar: `${yearGz.stem}${yearGz.branch}`,
    monthPillar: `${monthGz.stem}${monthGz.branch}`,
    dayPillar: `${dayGz.stem}${dayGz.branch}`,
    hourPillar: `${hourGz.stem}${hourGz.branch}`,

    yearGan: yearGz.stem,
    yearZhi: yearGz.branch,
    yearZodiac: yearGz.zodiac,
    monthGan: monthGz.stem,
    monthZhi: monthGz.branch,
    dayGan: dayGz.stem,
    dayZhi: dayGz.branch,
    hourGan: hourGz.stem,
    hourZhi: hourGz.branch,
    shiChen: getShiChen(birthHour),

    dayMaster,
    dayMasterWuXing: getWuXing(dayGz.stem),

    shiShen: {
      year: getShiShen(dayMaster, yearGz.stem),
      month: getShiShen(dayMaster, monthGz.stem),
      hour: getShiShen(dayMaster, hourGz.stem),
    },

    wuXing: {
      year: getWuXing(`${yearGz.stem}${yearGz.branch}`),
      month: getWuXing(`${monthGz.stem}${monthGz.branch}`),
      day: getWuXing(`${dayGz.stem}${dayGz.branch}`),
      hour: getWuXing(`${hourGz.stem}${hourGz.branch}`),
    },

    wuXingCount,
    wuXingStrength,
    favorableElements,
    unfavorableElements,
    personality,
    career,
    wealth,
    marriage,
    health,
    suggestions,
  }
}

/**
 * 统计五行数量
 */
function countWuXing(yearGz: GzYear, monthGz: GzMonth, dayGz: GzDay, hourGz: GzHour): {
  wood: number
  fire: number
  earth: number
  metal: number
  water: number
} {
  const count = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }

  const allGanZhi = [
    `${yearGz.stem}${yearGz.branch}`,
    `${monthGz.stem}${monthGz.branch}`,
    `${dayGz.stem}${dayGz.branch}`,
    `${hourGz.stem}${hourGz.branch}`,
  ]

  const wuXingMap: Record<string, string> = {
    甲: 'wood', 乙: 'wood', 丙: 'fire', 丁: 'fire', 戊: 'earth',
    己: 'earth', 庚: 'metal', 辛: 'metal', 壬: 'water', 癸: 'water',
    寅: 'wood', 卯: 'wood', 巳: 'fire', 午: 'fire',
    辰: 'earth', 戌: 'earth', 丑: 'earth', 未: 'earth',
    申: 'metal', 酉: 'metal', 子: 'water', 亥: 'water',
  }

  for (const gz of allGanZhi) {
    for (const char of gz) {
      const wuXing = wuXingMap[char]
      if (wuXing) count[wuXing]++
    }
  }

  return count
}

/**
 * 分析五行强弱
 */
function analyzeWuXingStrength(count: {
  wood: number
  fire: number
  earth: number
  metal: number
  water: number
}): {
  strongest: string[]
  strong: string[]
  weak: string[]
  weakest: string[]
} {
  const entries = Object.entries(count).sort((a, b) => b[1] - a[1])
  const max = entries[0][1]

  const strongest: string[] = []
  const strong: string[] = []
  const weak: string[] = []
  const weakest: string[] = []

  for (const [element, num] of entries) {
    const nameMap: Record<string, string> = {
      wood: '木',
      fire: '火',
      earth: '土',
      metal: '金',
      water: '水',
    }
    const name = nameMap[element]

    if (num === max && num >= 3) {
      strongest.push(name)
    } else if (num >= 2) {
      strong.push(name)
    } else if (num === 1) {
      weak.push(name)
    } else {
      weakest.push(name)
    }
  }

  return { strongest, strong, weak, weakest }
}

/**
 * 确定用神喜忌
 */
function determineYongShen(
  dayMaster: string,
  count: { wood: number; fire: number; earth: number; metal: number; water: number },
  strength: { strongest: string[]; strong: string[]; weak: string[]; weakest: string[] }
): {
  favorableElements: string[]
  unfavorableElements: string[]
} {
  const dayMasterWuXing = getWuXing(dayMaster)
  const favorableElements: string[] = []
  const unfavorableElements: string[] = []

  // 根据日主强弱判断用神
  const isStrong = strength.strongest.includes(dayMasterWuXing) || strength.strong.includes(dayMasterWuXing)

  if (isStrong) {
    // 日主强，需要泄耗（食伤、财星）
    const keMap: Record<string, string[]> = {
      木: ['火', '金', '土'], // 木生火（泄），金克木（耗），木克土（耗）
      火: ['土', '水', '金'],
      土: ['金', '木', '水'],
      金: ['水', '火', '木'],
      水: ['木', '土', '火'],
    }
    favorableElements.push(...(keMap[dayMasterWuXing] || []))
    unfavorableElements.push(dayMasterWuXing, ...getShengWuXing(dayMasterWuXing))
  } else {
    // 日主弱，需要生扶（印星、比劫）
    favorableElements.push(dayMasterWuXing, ...getShengWuXing(dayMasterWuXing))
    const keMap: Record<string, string[]> = {
      木: ['金'],
      火: ['水'],
      土: ['木'],
      金: ['火'],
      水: ['土'],
    }
    unfavorableElements.push(...(keMap[dayMasterWuXing] || []))
  }

  return {
    favorableElements: [...new Set(favorableElements)],
    unfavorableElements: [...new Set(unfavorableElements)],
  }
}

/**
 * 获取生助的五行
 */
function getShengWuXing(wuXing: string): string[] {
  const shengMap: Record<string, string> = {
    木: '水',
    火: '木',
    土: '火',
    金: '土',
    水: '金',
  }
  return [shengMap[wuXing] || ''].filter(Boolean)
}

/**
 * 获取十神
 */
function getShiShen(dayMaster: string, gan: string): string {
  return SHI_SHEN_MAP[dayMaster]?.[gan] || '未知'
}

/**
 * 性格分析
 */
function analyzePersonality(dayMaster: string, yearGz: GzYear, monthGz: GzMonth, hourGz: GzHour): string[] {
  const traits: string[] = []

  const dayMasterTraits: Record<string, string[]> = {
    甲: ['正直刚毅', '进取心强', '有领导力', '有时过于固执'],
    乙: ['温和谦逊', '善于适应', '心思细腻', '有时优柔寡断'],
    丙: ['热情开朗', '乐于助人', '有创造力', '有时冲动急躁'],
    丁: ['文雅有礼', '细心周到', '善于表达', '有时敏感多疑'],
    戊: ['稳重踏实', '值得信赖', '有责任感', '有时固执保守'],
    己: ['包容温和', '善于协调', '脚踏实地', '有时优柔寡断'],
    庚: ['果断坚毅', '有正义感', '讲义气', '有时过于强硬'],
    辛: ['优雅精致', '有审美观', '善解人意', '有时过于敏感'],
    壬: ['聪明灵活', '适应力强', '有谋略', '有时变化无常'],
    癸: ['内敛深沉', '洞察力强', '富有同情心', '有时过于消极'],
  }

  traits.push(...(dayMasterTraits[dayMaster] || []))

  // 根据年柱补充
  if (yearGz.zodiac === '虎' || yearGz.zodiac === '马') {
    traits.push('热情奔放，行动力强')
  } else if (yearGz.zodiac === '牛' || yearGz.zodiac === '龟') {
    traits.push('沉稳踏实，做事有恒心')
  }

  return traits
}

/**
 * 事业分析
 */
function analyzeCareer(dayMaster: string, favorableElements: string[]): string[] {
  const career: string[] = []

  const careerMap: Record<string, string[]> = {
    甲: ['企业管理', '政治', '林业', '教育'],
    乙: ['艺术', '设计', '文化', '教育'],
    丙: ['传媒', '演艺', '能源', '科技'],
    丁: ['文化', '艺术', '教育', '服务'],
    戊: ['金融', '房地产', '建筑', '农业'],
    己: ['服务', '协调', '人力资源', '行政'],
    庚: ['军警', '法律', '机械', '金融'],
    辛: ['珠宝', '时尚', '美容', '艺术'],
    壬: ['贸易', '航运', '旅游', '物流'],
    癸: ['研究', '咨询', '医疗', '服务'],
  }

  career.push(...(careerMap[dayMaster] || []))
  career.push(`适合五行属${favorableElements.join('、')}的行业`)

  return career
}

/**
 * 财运分析
 */
function analyzeWealth(dayMaster: string, favorableElements: string[]): string[] {
  const wealth: string[] = []

  // 日主身强财旺
  const caiGanMap: Record<string, string> = {
    甲: '戊',
    乙: '己',
    丙: '庚',
    丁: '辛',
    戊: '壬',
    己: '癸',
    庚: '甲',
    辛: '乙',
    壬: '丙',
    癸: '丁',
  }

  const caiGan = caiGanMap[dayMaster]
  const caiWuXing = getWuXing(caiGan)

  if (favorableElements.includes(caiWuXing)) {
    wealth.push('财运较好，善于理财')
    wealth.push('正财偏财皆有')
  } else {
    wealth.push('财运平稳，需要稳健理财')
    wealth.push('不宜投机冒险')
  }

  return wealth
}

/**
 * 婚姻分析
 */
function analyzeMarriage(
  gender: 'male' | 'female',
  dayMaster: string,
  yearGz: GzYear,
  monthGz: GzMonth,
  hourGz: GzHour
): string[] {
  const marriage: string[] = []

  // 夫妻星判断
  if (gender === 'male') {
    // 男命以财为妻
    const caiGanMap: Record<string, string> = { 甲: '戊', 乙: '己', 丙: '庚', 丁: '辛', 戊: '壬', 己: '癸', 庚: '甲', 辛: '乙', 壬: '丙', 癸: '丁' }
    const caiGan = caiGanMap[dayMaster]
    marriage.push(`妻星为${caiGan}，宜找五行属${getWuXing(caiGan)}的伴侣`)
  } else {
    // 女命以官为夫
    const guanGanMap: Record<string, string> = { 甲: '辛', 乙: '庚', 丙: '癸', 丁: '壬', 戊: '乙', 己: '甲', 庚: '丁', 辛: '丙', 壬: '己', 癸: '戊' }
    const guanGan = guanGanMap[dayMaster]
    marriage.push(`夫星为${guanGan}，宜找五行属${getWuXing(guanGan)}的伴侣`)
  }

  marriage.push('宜晚婚，婚姻更稳定')
  marriage.push('夫妻之间需要相互包容理解')

  return marriage
}

/**
 * 健康分析
 */
function analyzeHealth(count: {
  wood: number
  fire: number
  earth: number
  metal: number
  water: number
}): string[] {
  const health: string[] = []

  const wuXingOrganMap: Record<string, string[]> = {
    木: ['肝', '胆', '眼睛', '筋'],
    火: ['心', '小肠', '舌头', '血脉'],
    土: ['脾', '胃', '唇', '肌肉'],
    金: ['肺', '大肠', '鼻', '皮毛'],
    水: ['肾', '膀胱', '耳', '骨'],
  }

  for (const [element, organs] of Object.entries(wuXingOrganMap)) {
    const key = element as keyof typeof count
    if (count[key] === 0) {
      health.push(`注意${organs.join('、')}方面的健康`)
    } else if (count[key] >= 3) {
      health.push(`${organs.join('、')}功能较强，但不要过度消耗`)
    }
  }

  return health
}

/**
 * 生成五行建议
 */
function generateSuggestions(
  count: { wood: number; fire: number; earth: number; metal: number; water: number },
  favorableElements: string[]
): string[] {
  const suggestions: string[] = []

  // 颜色建议
  const colorMap: Record<string, string[]> = {
    木: ['绿色', '青色'],
    火: ['红色', '紫色', '粉色'],
    土: ['黄色', '棕色'],
    金: ['白色', '金色', '银色'],
    水: ['黑色', '蓝色'],
  }

  const luckyColors = favorableElements.flatMap(e => colorMap[e] || [])
  if (luckyColors.length > 0) {
    suggestions.push(`幸运颜色：${luckyColors.join('、')}`)
  }

  // 数字建议
  const numberMap: Record<string, number[]> = {
    木: [3, 8],
    火: [2, 7],
    土: [5, 10],
    金: [4, 9],
    水: [1, 6],
  }

  const luckyNumbers = favorableElements.flatMap(e => numberMap[e] || [])
  if (luckyNumbers.length > 0) {
    suggestions.push(`幸运数字：${luckyNumbers.join('、')}`)
  }

  // 方位建议
  const directionMap: Record<string, string[]> = {
    木: ['东方', '东南'],
    火: ['南方'],
    土: ['中央', '西南', '东北'],
    金: ['西方', '西北'],
    水: ['北方'],
  }

  const luckyDirections = favorableElements.flatMap(e => directionMap[e] || [])
  if (luckyDirections.length > 0) {
    suggestions.push(`吉利方位：${luckyDirections.join('、')}`)
  }

  return suggestions
}
