import "server-only"

import { readFile } from "node:fs/promises"

import type {
  HanziCharacter,
  HanziCharacterDataset,
  HanziCharacterSearchOptions,
} from "@/lib/hanzi-character"

const datasetUrl = new URL("../data/generated/hanzi-characters.json", import.meta.url)

let datasetPromise: Promise<HanziCharacterDataset> | undefined
let characterIndexPromise: Promise<Map<string, HanziCharacter>> | undefined

type RankedEntry = {
  entry: HanziCharacter
  pinyin: string[]
  meanings: string[]
}

let searchIndexPromise: Promise<RankedEntry[]> | undefined
let exactCharacterIndex: Map<string, HanziCharacter> | undefined
let exactUnicodeIndex: Map<string, HanziCharacter> | undefined
let firstCharacterSearchIndex: Map<string, RankedEntry[]> | undefined

function normalizeSearchValue(value: string): string {
  return value.toLocaleLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[1-5]/g, "").trim()
}

function normalizeUnicode(value: string): string {
  const normalized = value.trim().toUpperCase().replace(/^U\+?/, "")
  return /^[0-9A-F]{4,6}$/.test(normalized) ? `U+${normalized}` : value.trim().toUpperCase()
}

export function loadHanziCharacterDataset(): Promise<HanziCharacterDataset> {
  datasetPromise ??= readFile(datasetUrl, "utf8").then((contents) => JSON.parse(contents) as HanziCharacterDataset)
  return datasetPromise
}

async function loadCharacterIndex(): Promise<Map<string, HanziCharacter>> {
  characterIndexPromise ??= loadHanziCharacterDataset().then(
    ({ characters }) => new Map(characters.map((entry) => [entry.character, entry])),
  )
  return characterIndexPromise
}

async function loadSearchIndex(): Promise<RankedEntry[]> {
  searchIndexPromise ??= loadHanziCharacterDataset().then(({ characters }) => {
    const characterIndex = new Map<string, HanziCharacter>()
    const unicodeIndex = new Map<string, HanziCharacter>()
    const firstCharacterIndex = new Map<string, RankedEntry[]>()
    const searchableEntries = characters.map((entry) => ({
      entry,
      pinyin: [...new Set([...entry.pinyin, ...(entry.pinyinNumeric ?? [])].map(normalizeSearchValue))],
      meanings: entry.meanings.map(normalizeSearchValue),
    }))

    for (const searchable of searchableEntries) {
      characterIndex.set(searchable.entry.character, searchable.entry)
      unicodeIndex.set(searchable.entry.unicode, searchable.entry)
      const initialCharacters = new Set(
        [...searchable.pinyin, ...searchable.meanings].map((value) => Array.from(value)[0]).filter(Boolean),
      )
      for (const initialCharacter of initialCharacters) {
        const entries = firstCharacterIndex.get(initialCharacter) ?? []
        entries.push(searchable)
        firstCharacterIndex.set(initialCharacter, entries)
      }
    }

    exactCharacterIndex = characterIndex
    exactUnicodeIndex = unicodeIndex
    firstCharacterSearchIndex = firstCharacterIndex
    return searchableEntries
  })
  return searchIndexPromise
}

function getSearchRank(searchable: RankedEntry, query: string, unicode: string): number | undefined {
  const { entry } = searchable
  if (entry.character === query) return 0
  if (entry.unicode === unicode) return 1
  if (searchable.pinyin.includes(query)) return 2
  if (searchable.pinyin.some((value) => value.startsWith(query))) return 3
  if (searchable.meanings.includes(query)) return 4
  if (searchable.meanings.some((value) => value.startsWith(query))) return 5
  if (
    searchable.pinyin.some((value) => value.includes(query)) ||
    searchable.meanings.some((value) => value.includes(query))
  ) return 6
  return undefined
}

function collectRankedPage(buckets: HanziCharacter[][], bucketLimit: number, offset: number, limit: number): HanziCharacter[] {
  const results: HanziCharacter[] = []
  for (const bucket of buckets) {
    const remaining = bucketLimit - results.length
    if (remaining <= 0) break
    results.push(...bucket.slice(0, remaining))
  }
  return results.slice(offset, offset + limit)
}

export async function getHanziCharacter(character: string): Promise<HanziCharacter | undefined> {
  return (await loadCharacterIndex()).get(character)
}

export async function listHanziCharacters({ limit = 50, offset = 0 }: { limit?: number; offset?: number } = {}): Promise<HanziCharacter[]> {
  const { characters } = await loadHanziCharacterDataset()
  const resultLimit = Math.max(1, Math.min(limit, 100))
  const resultOffset = Math.max(0, Math.floor(offset))
  return characters.slice(resultOffset, resultOffset + resultLimit + 1)
}

export async function searchHanziCharacters({
  query = "",
  radicalNumber,
  strokeCount,
  limit = 50,
  offset = 0,
}: HanziCharacterSearchOptions = {}): Promise<HanziCharacter[]> {
  const normalizedQuery = normalizeSearchValue(query.trim())
  if (!normalizedQuery) return []

  const normalizedUnicode = normalizeUnicode(query)
  const resultLimit = Math.max(1, Math.min(limit, 100))
  const resultOffset = Math.max(0, Math.floor(offset))
  const bucketLimit = resultOffset + resultLimit
  const searchIndex = await loadSearchIndex()
  const matchesFilters = (entry: HanziCharacter) =>
    (radicalNumber === undefined || entry.radicalNumber === radicalNumber) &&
    (strokeCount === undefined || entry.strokeCounts?.includes(strokeCount) === true)

  const exactCharacter = exactCharacterIndex?.get(normalizedQuery)
  if (exactCharacter && matchesFilters(exactCharacter)) {
    return resultOffset === 0 ? [exactCharacter] : []
  }
  if (/^U\+[0-9A-F]{4,6}$/.test(normalizedUnicode)) {
    const exactUnicode = exactUnicodeIndex?.get(normalizedUnicode)
    if (exactUnicode && matchesFilters(exactUnicode)) return resultOffset === 0 ? [exactUnicode] : []
  }

  const prefixBuckets: HanziCharacter[][] = [[], [], [], [], [], []]
  const prefixCandidates = firstCharacterSearchIndex?.get(Array.from(normalizedQuery)[0]) ?? []
  for (const searchable of prefixCandidates) {
    if (!matchesFilters(searchable.entry)) continue
    const rank = getSearchRank(searchable, normalizedQuery, normalizedUnicode)
    if (rank !== undefined && rank < 6 && prefixBuckets[rank].length < bucketLimit) {
      prefixBuckets[rank].push(searchable.entry)
    }
  }

  const prefixPage = collectRankedPage(prefixBuckets, bucketLimit, resultOffset, resultLimit)
  if (prefixPage.length === resultLimit) return prefixPage

  const buckets: HanziCharacter[][] = [[], [], [], [], [], [], []]
  for (const searchable of searchIndex) {
    if (!matchesFilters(searchable.entry)) continue
    const rank = getSearchRank(searchable, normalizedQuery, normalizedUnicode)
    if (rank !== undefined && buckets[rank].length < bucketLimit) buckets[rank].push(searchable.entry)
  }

  // The dataset's stable order is the deterministic tie-breaker within each rank.
  return collectRankedPage(buckets, bucketLimit, resultOffset, resultLimit)
}
