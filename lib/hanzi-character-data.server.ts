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
  searchIndexPromise ??= loadHanziCharacterDataset().then(({ characters }) =>
    characters.map((entry) => ({
      entry,
      pinyin: [...new Set([...entry.pinyin, ...(entry.pinyinNumeric ?? [])].map(normalizeSearchValue))],
      meanings: entry.meanings.map(normalizeSearchValue),
    })),
  )
  return searchIndexPromise
}

export async function getHanziCharacter(character: string): Promise<HanziCharacter | undefined> {
  return (await loadCharacterIndex()).get(character)
}

export async function searchHanziCharacters({
  query = "",
  radicalNumber,
  strokeCount,
  limit = 50,
}: HanziCharacterSearchOptions = {}): Promise<HanziCharacter[]> {
  const normalizedQuery = normalizeSearchValue(query.trim())
  if (!normalizedQuery) return []

  const normalizedUnicode = normalizeUnicode(query)
  const resultLimit = Math.max(1, Math.min(limit, 100))
  const buckets: HanziCharacter[][] = [[], [], [], [], [], [], []]

  for (const searchable of await loadSearchIndex()) {
    const { entry } = searchable
    if (radicalNumber !== undefined && entry.radicalNumber !== radicalNumber) continue
    if (strokeCount !== undefined && !entry.strokeCounts?.includes(strokeCount)) continue

    // Stable, intentionally small ranking model: exact identity first, then
    // pinyin, meanings, and finally partial matches.
    let rank: number | undefined
    if (entry.character === normalizedQuery) rank = 0
    else if (entry.unicode === normalizedUnicode) rank = 1
    else if (searchable.pinyin.includes(normalizedQuery)) rank = 2
    else if (searchable.pinyin.some((value) => value.startsWith(normalizedQuery))) rank = 3
    else if (searchable.meanings.includes(normalizedQuery)) rank = 4
    else if (searchable.meanings.some((value) => value.startsWith(normalizedQuery))) rank = 5
    else if (
      searchable.pinyin.some((value) => value.includes(normalizedQuery)) ||
      searchable.meanings.some((value) => value.includes(normalizedQuery))
    ) rank = 6

    // Later entries in the same rank cannot enter the final limited result,
    // so each bucket is capped without changing its stable source order.
    if (rank !== undefined && buckets[rank].length < resultLimit) buckets[rank].push(entry)
  }

  const results: HanziCharacter[] = []
  // The generated dataset has a stable character order, which becomes the
  // deterministic tie-breaker inside each rank without any extra sorting.
  for (const bucket of buckets) {
    const remaining = resultLimit - results.length
    if (remaining <= 0) break
    results.push(...bucket.slice(0, remaining))
  }
  return results
}
