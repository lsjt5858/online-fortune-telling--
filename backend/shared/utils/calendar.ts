/**
 * 农历/公历转换工具
 * 用于八字等需要农历计算的占卜方法
 */

// 农历数据 1900-2100
const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
  0x0d520,
]

// 天干
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

// 地支
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 生肖
const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

// 二十四节气
const SOLAR_TERMS = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至',
]

export interface LunarDate {
  lunarYear: number
  lunarMonth: number
  lunarDay: number
  isLeapMonth: boolean
}

export interface GzYear {
  stem: string
  branch: string
  zodiac: string
}

export interface GzMonth {
  stem: string
  branch: string
}

export interface GzDay {
  stem: string
  branch: string
}

export interface GzHour {
  stem: string
  branch: string
}

/**
 * 将公历日期转换为农历日期
 */
export function solarToLunar(year: number, month: number, day: number): LunarDate {
  // 计算与1900年1月31日(农历1900年正月初一)的天数差
  const baseDate = new Date(1900, 0, 31)
  const targetDate = new Date(year, month - 1, day)
  let offset = Math.floor((targetDate.getTime() - baseDate.getTime()) / 86400000)

  // 从1900年开始查找农历年
  let lunarYear = 1900
  let i = 0
  let lunarMonth = 1
  let isLeapMonth = false
  let daysInMonth = 0

  while (i < LUNAR_INFO.length && offset > 0) {
    daysInMonth = getLunarYearDays(lunarYear)
    if (offset < daysInMonth) {
      break
    }
    offset -= daysInMonth
    lunarYear++
    i++
  }

  // 查找农历月
  let leapMonth = getLeapMonth(lunarYear)
  let isLeap = false

  for (let m = 1; m <= 12; m++) {
    // 闰月
    if (leapMonth > 0 && m === leapMonth + 1 && !isLeap) {
      m--
      isLeap = true
      daysInMonth = getLeapMonthDays(lunarYear)
    } else {
      daysInMonth = getLunarMonthDays(lunarYear, m)
    }

    if (isLeap && m === leapMonth + 1) isLeap = false

    if (offset < daysInMonth) {
      lunarMonth = m
      isLeapMonth = isLeap
      break
    }

    offset -= daysInMonth
  }

  return {
    lunarYear,
    lunarMonth,
    lunarDay: offset + 1,
    isLeapMonth,
  }
}

/**
 * 获取农历年的总天数
 */
function getLunarYearDays(year: number): number {
  let sum = 348
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += LUNAR_INFO[year - 1900] & i ? 1 : 0
  }
  return sum + getLeapMonthDays(year)
}

/**
 * 获取农历月的天数
 */
function getLunarMonthDays(year: number, month: number): number {
  return LUNIAN_INFO[year - 1900] & (0x10000 >> month) ? 30 : 29
}

// 修复：使用正确的数组名
const LUNIAN_INFO = LUNAR_INFO

/**
 * 获取闰月的天数
 */
function getLeapMonthDays(year: number): number {
  if (getLeapMonth(year)) {
    return LUNAR_INFO[year - 1900] & 0x10000 ? 30 : 29
  }
  return 0
}

/**
 * 获取闰月月份，0表示无闰月
 */
function getLeapMonth(year: number): number {
  return LUNAR_INFO[year - 1900] & 0xf
}

/**
 * 计算年柱（以立春为界）
 */
export function getYearGanZhi(year: number, month: number, day: number): GzYear {
  // 立春日期大约在2月4日
  let yearIndex = year
  if (month < 2 || (month === 2 && day < 4)) {
    yearIndex--
  }

  // 以1900年(庚子年)为基准
  const baseYear = 1900
  const offset = yearIndex - baseYear

  const stemIndex = offset % 10
  const branchIndex = offset % 12

  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex],
    zodiac: ZODIAC_ANIMALS[branchIndex],
  }
}

/**
 * 计算月柱（以节气为界）
 */
export function getMonthGanZhi(year: number, month: number, day: number): GzMonth {
  // 月柱地支固定：正月寅，二月卯...
  const monthBranchIndex = (month + 1) % 12

  // 年上起月法：甲己之年丙作首
  const yearGz = getYearGanZhi(year, month, day)
  let monthStemBase = 0

  switch (yearGz.stem) {
    case '甲':
    case '己':
      monthStemBase = 2 // 丙
      break
    case '乙':
    case '庚':
      monthStemBase = 4 // 戊
      break
    case '丙':
    case '辛':
      monthStemBase = 6 // 庚
      break
    case '丁':
    case '壬':
      monthStemBase = 8 // 壬
      break
    case '戊':
    case '癸':
      monthStemBase = 0 // 甲
      break
  }

  const stemIndex = (monthStemBase + month - 1) % 10

  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[monthBranchIndex],
  }
}

/**
 * 计算日柱（基准日：1900年1月1日为甲戌日）
 */
export function getDayGanZhi(year: number, month: number, day: number): GzDay {
  const baseDate = new Date(1900, 0, 1)
  const targetDate = new Date(year, month - 1, day)
  const offset = Math.floor((targetDate.getTime() - baseDate.getTime()) / 86400000)

  // 1900年1月1日是甲戌日，甲=0，戌=10
  const stemIndex = (offset + 0) % 10
  const branchIndex = (offset + 10) % 12

  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex],
  }
}

/**
 * 计算时柱
 */
export function getHourGanZhi(year: number, month: number, day: number, hour: number): GzHour {
  const dayGz = getDayGanZhi(year, month, day)

  // 时支计算
  let hourBranchIndex = Math.floor((hour + 1) / 2) % 12
  if (hour === 23) hourBranchIndex = 0

  // 日上起时法（五鼠遁）
  let hourStemBase = 0
  switch (dayGz.stem) {
    case '甲':
    case '己':
      hourStemBase = 0 // 甲
      break
    case '乙':
    case '庚':
      hourStemBase = 2 // 丙
      break
    case '丙':
    case '辛':
      hourStemBase = 4 // 戊
      break
    case '丁':
    case '壬':
      hourStemBase = 6 // 庚
      break
    case '戊':
    case '癸':
      hourStemBase = 8 // 壬
      break
  }

  const stemIndex = (hourStemBase + hourBranchIndex) % 10

  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[hourBranchIndex],
  }
}

/**
 * 获取时辰名称
 */
export function getShiChen(hour: number): string {
  if (hour === 23 || hour === 0) return '子时'
  if (hour === 1 || hour === 2) return '丑时'
  if (hour === 3 || hour === 4) return '寅时'
  if (hour === 5 || hour === 6) return '卯时'
  if (hour === 7 || hour === 8) return '辰时'
  if (hour === 9 || hour === 10) return '巳时'
  if (hour === 11 || hour === 12) return '午时'
  if (hour === 13 || hour === 14) return '未时'
  if (hour === 15 || hour === 16) return '申时'
  if (hour === 17 || hour === 18) return '酉时'
  if (hour === 19 || hour === 20) return '戌时'
  return '亥时'
}

/**
 * 五行判断
 */
export function getWuXing(ganZhi: string): string {
  const wuXingMap: Record<string, string> = {
    // 天干五行
    甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
    己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
    // 地支五行
    子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
    午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
  }

  // 单字符直接返回
  if (ganZhi.length === 1) {
    return wuXingMap[ganZhi] || ''
  }

  const [gan, zhi] = ganZhi.split('')
  const ganWuXing = wuXingMap[gan] || ''
  const zhiWuXing = wuXingMap[zhi] || ''

  if (!ganWuXing || !zhiWuXing) {
    return ganWuXing || zhiWuXing || ''
  }

  if (ganWuXing === zhiWuXing) {
    return ganWuXing // 天干地支同五行
  }

  return `${ganWuXing}${zhiWuXing}` // 如"木火"
}
