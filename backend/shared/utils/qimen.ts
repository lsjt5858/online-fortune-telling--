/**
 * 奇门遁甲算法
 * 中国古代术数著作，也是奇门、六壬、太乙"三大秘宝"中的第一大秘术
 */

// 天干
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

// 地支
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 八门
const EIGHT_DOORS = ['开门', '休门', '生门', '伤门', '杜门', '景门', '死门', '惊门']

// 九星
const NINE_STARS = ['天蓬', '天任', '天冲', '天辅', '天英', '天芮', '天柱', '天心', '天禽']

// 八神
const EIGHT_SPIRITS = ['值符', '螣蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天']

// 九宫格位置
const NINE_PALACES = [
  '巽四', '离九', '坤二',
  '震三', '中五', '兑七',
  '艮八', '坎一', '乾六',
]

// 洛书九宫
const LUO_SHU = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
]

// 旬首
const XUN_SHOU = [
  '甲子', '甲戌', '甲申', '甲午', '甲辰', '甲寅',
]

// 六甲 (遁甲隐藏的甲)
const SIX_JIA = ['甲子', '甲戌', '甲申', '甲午', '甲辰', '甲寅']

// 六仪
const SIX_YI = ['戊', '己', '庚', '辛', '壬', '癸']

// 三奇
const THREE_QI = ['乙', '丙', '丁']

export interface QimenInput {
  name: string
  gender: 'male' | 'female'
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: number
  birthMinute: number
  isLunar: boolean
  question?: string
}

export interface QimenResult {
  // 基本信息
  name: string
  gender: string
  birthDate: string
  birthTime: string
  question?: string

  // 局数信息
  juShu: string
  juName: string

  // 旬首
  xunShou: string
  dunJia: string

  // 九宫排布
  jiuGong: {
    position: string
    number: number
    door: string
    star: string
    spirit: string
    stem: string
  }[]

  // 三奇得使
  sanQiDeShi: {
    has: boolean
    description: string
  }

  // 遁甲格局
  geJu: {
    name: string
    quality: string
    description: string
  }

  // 吉凶判断
  jiXiong: {
    level: string
    description: string
  }

  // 方位建议
  fangWei: {
    favorable: string[]
    unfavorable: string[]
  }

  // 时间建议
  shiJian: {
    favorable: string[]
    unfavorable: string[]
  }

  // 行动建议
  suggestions: string[]
}

/**
 * 奇门遁甲主函数
 */
export function calculateQimen(input: QimenInput): QimenResult {
  const { name, gender, birthYear, birthMonth, birthDay, birthHour, question } = input

  // 计算日柱和时柱
  const dayStemIndex = (birthYear * 5 + birthMonth * 30 + birthDay) % 10
  const dayBranchIndex = (birthYear + birthMonth + birthDay) % 12
  const dayStem = HEAVENLY_STEMS[dayStemIndex]
  const dayBranch = EARTHLY_BRANCHES[dayBranchIndex]

  const hourStemIndex = (dayStemIndex * 5 + Math.floor(birthHour / 2)) % 10
  const hourBranchIndex = Math.floor((birthHour + 1) / 2) % 12
  const hourStem = HEAVENLY_STEMS[hourStemIndex]
  const hourBranch = EARTHLY_BRANCHES[hourBranchIndex]

  // 计算旬首
  const xunShouIndex = Math.floor((dayStemIndex - dayBranchIndex + 12) % 12)
  const xunShou = XUN_SHOU[xunShouIndex % 6]

  // 计算局数（阴遁/阳遁）
  const dunType = calculateDunType(birthMonth, birthDay)
  const juShu = calculateJuShu(dayStem, dayBranch, dunType)
  const juName = `${dunType}遁${juShu}局`

  // 计算九宫排布
  const jiuGong = arrangeJiuGong(juShu, dunType, hourStem)

  // 判断三奇得使
  const sanQiDeShi = checkSanQiDeShi(jiuGong)

  // 判断格局
  const geJu = determineGeJu(dayStem, hourStem, jiuGong)

  // 吉凶判断
  const jiXiong = determineJiXiong(jiuGong, geJu)

  // 方位建议
  const fangWei = determineFangWei(jiuGong)

  // 时间建议
  const shiJian = determineShiJian(hourStem, hourBranch, jiuGong)

  // 行动建议
  const suggestions = generateQimenSuggestions(jiuGong, geJu, jiXiong)

  return {
    name,
    gender: gender === 'male' ? '男' : '女',
    birthDate: `${birthYear}年${birthMonth}月${birthDay}日`,
    birthTime: `${birthHour.toString().padStart(2, '0')}:${input.birthMinute.toString().padStart(2, '0')}`,
    question,
    juShu: juName,
    juName: getJuDescription(juShu, dunType),
    xunShou,
    dunJia: getDunJia(xunShou),
    jiuGong,
    sanQiDeShi,
    geJu,
    jiXiong,
    fangWei,
    shiJian,
    suggestions,
  }
}

/**
 * 计算遁甲类型（阴遁或阳遁）
 */
function calculateDunType(month: number, day: number): string {
  // 冬至后到夏至前为阳遁，夏至后到冬至前为阴遁
  // 简化计算：3-8月为阳遁，9-2月为阴遁
  if (month >= 3 && month <= 8) {
    return '阳'
  }
  return '阴'
}

/**
 * 计算局数
 */
function calculateJuShu(dayStem: string, dayBranch: string, dunType: string): number {
  // 根据日支确定局数
  const branchIndex = EARTHLY_BRANCHES.indexOf(dayBranch)
  const baseJu = (branchIndex % 9) + 1

  // 根据天干调整
  const stemIndex = HEAVENLY_STEMS.indexOf(dayStem)
  const adjustment = Math.floor(stemIndex / 2)

  let ju = baseJu + adjustment
  if (ju > 9) ju = ju - 9
  if (ju < 1) ju = ju + 9

  return ju
}

/**
 * 安排九宫
 */
function arrangeJiuGong(juShu: number, dunType: string, hourStem: string): {
  position: string
  number: number
  door: string
  star: string
  spirit: string
  stem: string
}[] {
  const result: {
    position: string
    number: number
    door: string
    star: string
    spirit: string
    stem: string
  }[] = []

  // 根据局数确定值符和值使
  const zhiFuIndex = juShu - 1
  const zhiFu = NINE_STARS[zhiFuIndex]
  const zhiShi = EIGHT_DOORS[zhiFuIndex % 8]

  // 根据遁甲类型确定排布方向
  const direction = dunType === '阳' ? 1 : -1

  // 安排九星
  const starArrangement = arrangeStars(juShu, direction)

  // 安排八门
  const doorArrangement = arrangeDoors(juShu, direction)

  // 安排八神
  const spiritArrangement = arrangeSpirits(direction)

  // 安排天干
  const stemArrangement = arrangeStems(hourStem, juShu)

  for (let i = 0; i < 9; i++) {
    result.push({
      position: NINE_PALACES[i],
      number: LUO_SHU[Math.floor(i / 3)][i % 3],
      door: doorArrangement[i] || '',
      star: starArrangement[i] || '',
      spirit: spiritArrangement[i] || '',
      stem: stemArrangement[i] || '',
    })
  }

  return result
}

/**
 * 安排九星
 */
function arrangeStars(juShu: number, direction: number): string[] {
  const stars = [...NINE_STARS]
  const result = new Array(9).fill('')

  // 值符位置
  const zhiFuPosition = juShu - 1

  // 根据阳遁或阴遁顺逆排列
  for (let i = 0; i < 9; i++) {
    const index = (zhiFuPosition + i * direction + 9) % 9
    result[i] = stars[index]
  }

  return result
}

/**
 * 安排八门
 */
function arrangeDoors(juShu: number, direction: number): string[] {
  const doors = [...EIGHT_DOORS]
  const result = new Array(9).fill('')

  // 值使位置
  const zhiShiPosition = juShu - 1

  // 根据阳遁或阴遁顺逆排列
  for (let i = 0; i < 8; i++) {
    const index = (zhiShiPosition + i * direction + 8) % 8
    result[i] = doors[index]
  }

  return result
}

/**
 * 安排八神
 */
function arrangeSpirits(direction: number): string[] {
  const spirits = [...EIGHT_SPIRITS]
  const result = new Array(9).fill('')

  // 八神从值符开始，阳遁顺排，阴遁逆排
  for (let i = 0; i < 8; i++) {
    const index = (i * direction + 8) % 8
    result[i] = spirits[index]
  }

  return result
}

/**
 * 安排天干
 */
function arrangeStems(hourStem: string, juShu: number): string[] {
  const result = new Array(9).fill('')
  const stemIndex = HEAVENLY_STEMS.indexOf(hourStem)

  // 六仪三奇排布
  const yiQi = [...SIX_YI, ...THREE_QI]

  for (let i = 0; i < 9; i++) {
    result[i] = yiQi[(stemIndex + i) % 9]
  }

  return result
}

/**
 * 检查三奇得使
 */
function checkSanQiDeShi(jiuGong: QimenResult['jiuGong']): {
  has: boolean
  description: string
} {
  // 检查乙、丙、丁三奇是否加临开、休、生三吉门
  const sanQi = THREE_QI
  const jiMen = ['开门', '休门', '生门']

  let count = 0
  const matches: string[] = []

  for (const gong of jiuGong) {
    if (sanQi.includes(gong.stem) && jiMen.includes(gong.door)) {
      count++
      matches.push(`${gong.position}宫${gong.stem}加${gong.door}`)
    }
  }

  return {
    has: count > 0,
    description: count > 0 ? `三奇得使：${matches.join('、')}` : '无三奇得使',
  }
}

/**
 * 判断格局
 */
function determineGeJu(dayStem: string, hourStem: string, jiuGong: QimenResult['jiuGong']): {
  name: string
  quality: string
  description: string
} {
  // 常见格局判断
  const geJuList = [
    { name: '青龙回首', quality: '上吉', condition: (d: string, h: string) => d === '辛' && h === '乙' },
    { name: '飞鸟跌穴', quality: '上吉', condition: (d: string, h: string) => d === '乙' && h === '辛' },
    { name: '天遁', quality: '上吉', condition: (d: string, h: string) => d === '丙' && ['生门', '休门'].includes(h) },
    { name: '地遁', quality: '上吉', condition: (d: string, h: string) => d === '乙' && ['开门'].includes(h) },
    { name: '人遁', quality: '上吉', condition: (d: string, h: string) => d === '丁' && ['休门'].includes(h) },
    { name: '龙虎相争', quality: '中平', condition: (d: string, h: string) => d === '辛' && h === '庚' },
    { name: '奇仪相合', quality: '吉', condition: (d: string, h: string) => ['乙庚', '丙辛', '丁壬', '戊癸'].some(p => d === p[1] && h === p[0]) },
  ]

  // 检查日干时干组合
  for (const geju of geJuList) {
    if (geju.condition(dayStem, hourStem)) {
      return {
        name: geju.name,
        quality: geju.quality,
        description: getGeJuDescription(geju.name),
      }
    }
  }

  return {
    name: '普通格局',
    quality: '平',
    description: '无特殊格局，需综合分析其他因素',
  }
}

/**
 * 获取格局描述
 */
function getGeJuDescription(geJuName: string): string {
  const descriptions: Record<string, string> = {
    '青龙回首': '大吉之象，百事皆宜，利于求财、婚姻、出行等',
    '飞鸟跌穴': '大吉之象，利于求官、考试、经营等',
    '天遁': '大吉之象，利于求仙问道、修学、求医等',
    '地遁': '大吉之象，利于建筑、动土、埋藏等',
    '人遁': '大吉之象，利于求人、结交贵人、婚姻等',
    '龙虎相争': '中平之象，主争执竞争，需谨慎行事',
    '奇仪相合': '吉象，主合作、和谐、贵人相助',
    '普通格局': '需根据具体事项分析吉凶',
  }

  return descriptions[geJuName] || '格局一般'
}

/**
 * 判断吉凶
 */
function determineJiXiong(
  jiuGong: QimenResult['jiuGong'],
  geJu: { name: string; quality: string }
): {
  level: string
  description: string
} {
  const jiDoors = ['开门', '休门', '生门']
  const xiongDoors = ['死门', '惊门']

  let jiCount = 0
  let xiongCount = 0

  for (const gong of jiuGong) {
    if (jiDoors.includes(gong.door)) jiCount++
    if (xiongDoors.includes(gong.door)) xiongCount++
  }

  if (geJu.quality === '上吉' || jiCount >= 3) {
    return {
      level: '大吉',
      description: '吉利之象，百事顺遂，可积极进取',
    }
  } else if (geJu.quality === '吉' || jiCount >= 2) {
    return {
      level: '吉',
      description: '吉利之象，可以行动，但需谨慎',
    }
  } else if (geJu.quality === '中平' || (jiCount === 1 && xiongCount <= 1)) {
    return {
      level: '中平',
      description: '吉凶参半，需根据具体情况判断',
    }
  } else {
    return {
      level: '凶',
      description: '不利之象，宜静不宜动，宜守不宜攻',
    }
  }
}

/**
 * 确定方位
 */
function determineFangWei(jiuGong: QimenResult['jiuGong']): {
  favorable: string[]
  unfavorable: string[]
} {
  const favorable: string[] = []
  const unfavorable: string[] = []

  const jiDoors = ['开门', '休门', '生门']
  const xiongDoors = ['死门', '惊门', '伤门']

  for (const gong of jiuGong) {
    const position = getPositionName(gong.position)
    if (jiDoors.includes(gong.door)) {
      favorable.push(position)
    }
    if (xiongDoors.includes(gong.door)) {
      unfavorable.push(position)
    }
  }

  return { favorable, unfavorable }
}

/**
 * 获取方位名称
 */
function getPositionName(position: string): string {
  const map: Record<string, string> = {
    '坎一': '正北',
    '坤二': '西南',
    '震三': '正东',
    '巽四': '东南',
    '中五': '中央',
    '乾六': '西北',
    '兑七': '正西',
    '艮八': '东北',
    '离九': '正南',
  }
  return map[position] || position
}

/**
 * 确定时间
 */
function determineShiJian(hourStem: string, hourBranch: string, jiuGong: QimenResult['jiuGong']): {
  favorable: string[]
  unfavorable: string[]
} {
  const favorable: string[] = []
  const unfavorable: string[] = []

  // 根据时干判断
  const favorableStems = ['甲', '乙', '丙', '丁', '戊']
  const unfavorableStems = ['庚', '辛', '壬', '癸']

  if (favorableStems.includes(hourStem)) {
    favorable.push('当前时辰吉利')
  }

  if (unfavorableStems.includes(hourStem)) {
    unfavorable.push('当前时辰不利')
  }

  // 根据时支判断
  const favorableBranches = ['子', '寅', '卯', '午']
  const unfavorableBranches = ['丑', '申', '酉']

  if (favorableBranches.includes(hourBranch)) {
    favorable.push(`${hourBranch}时较为吉利`)
  }

  if (unfavorableBranches.includes(hourBranch)) {
    unfavorable.push(`${hourBranch}时需要谨慎`)
  }

  return { favorable, unfavorable }
}

/**
 * 生成奇门建议
 */
function generateQimenSuggestions(
  jiuGong: QimenResult['jiuGong'],
  geJu: { name: string; quality: string },
  jiXiong: { level: string }
): string[] {
  const suggestions: string[] = []

  // 根据格局给建议
  if (geJu.quality === '上吉') {
    suggestions.push('当前格局大吉，可以大胆行动')
    suggestions.push('宜积极进取，把握良机')
  } else if (geJu.quality === '吉') {
    suggestions.push('当前格局吉利，可以行动')
    suggestions.push('宜稳中求进，谨慎而为')
  } else if (geJu.quality === '中平') {
    suggestions.push('当前格局一般，需谨慎决策')
    suggestions.push('宜观察时机，不宜冒进')
  } else {
    suggestions.push('当前格局不利，宜静待时机')
    suggestions.push('宜守不宜攻，不宜做重大决策')
  }

  // 根据吉凶给建议
  if (jiXiong.level === '大吉' || jiXiong.level === '吉') {
    suggestions.push('此为吉利之象，可以进行重要活动')
  } else if (jiXiong.level === '中平') {
    suggestions.push('吉凶参半，需根据具体情况判断')
  } else {
    suggestions.push('此为不利之象，宜低调行事')
  }

  // 根据门给建议
  const jiGongs = jiuGong.filter(g => ['开门', '休门', '生门'].includes(g.door))
  if (jiGongs.length > 0) {
    suggestions.push(`吉门在：${jiGongs.map(g => getPositionName(g.position)).join('、')}`)
  }

  return suggestions
}

/**
 * 获取局数描述
 */
function getJuDescription(juShu: number, dunType: string): string {
  const descriptions: Record<string, string> = {
    '1': '一局主水，利于流动、变化之事',
    '2': '二局主土，利于稳定、奠基之事',
    '3': '三局主木，利于生长、发展之事',
    '4': '四局主木，利于文职、协商之事',
    '5': '五局主土，居于中央，诸事皆需平衡',
    '6': '六局主金，利于决断、执法之事',
    '7': '七局主金，利于交际、合作之事',
    '8': '八局主土，利于守成、积蓄之事',
    '9': '九局主火，利于展示、推广之事',
  }

  return `${dunType}遁${juShu}局：${descriptions[juShu.toString()] || ''}`
}

/**
 * 获取遁甲
 */
function getDunJia(xunShou: string): string {
  // 找出旬首对应的六甲
  const jiaIndex = SIX_JIA.indexOf(xunShou)
  return SIX_JIA[jiaIndex] + '遁'
}
