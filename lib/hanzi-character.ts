export type HanziCharacterSource = "Unihan" | "CC-CEDICT"

export interface HanziRadicalStroke {
  radicalNumber: number
  radical: string
  radicalSymbol?: string
  additionalStrokes: number
  /** 0 = Kangxi form; 1-3 identify alternate simplified radical forms from kRSUnicode. */
  simplifiedForm: number
}

export interface HanziRadicalForm {
  radicalNumber: number
  radical: string
  radicalSymbol?: string
  simplifiedForm: number
}

export interface HanziRadical {
  radicalNumber: number
  radical: string
  radicalSymbol?: string
  components: string[]
  forms: HanziRadicalForm[]
}

export interface HanziCharacter {
  character: string
  unicode: string
  pinyin: string[]
  pinyinNumeric?: string[]
  meanings: string[]
  radical?: string
  radicalSymbol?: string
  radicalNumber?: number
  radicalStrokes?: HanziRadicalStroke[]
  strokeCount?: number
  strokeCounts?: number[]
  simplified?: string[]
  traditional?: string[]
  sources?: {
    pinyin?: HanziCharacterSource[]
    meanings?: HanziCharacterSource[]
  }
}

export interface HanziCharacterDataset {
  metadata: {
    schemaVersion: number
    sources: Record<string, {
      name: string
      version: string
      date: string
      url: string
      license: string
      licenseUrl: string
      sha256: string
      fields: string[]
      snapshot?: string
    }>
  }
  statistics: HanziCharacterStatistics
  radicals: HanziRadical[]
  characters: HanziCharacter[]
}

export interface HanziCharacterStatistics {
  total: number
  withPinyin: number
  withMeanings: number
  withRadical: number
  withStrokeCount: number
  withSimplifiedVariant: number
  withTraditionalVariant: number
}

export interface HanziCharacterSearchOptions {
  query?: string
  radicalNumber?: number
  strokeCount?: number
  limit?: number
}
