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
  character: string
  unicode: string
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
      character: normalizeSearchValue(entry.character),
      unicode: normalizeUnicode(entry.unicode),
      pinyin: [...entry.pinyin, ...(entry.pinyinNumeric ?? [])].map(normalizeSearchValue),
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
  const rankedResults: { entry: HanziCharacter; rank: number }[] = []

  for (const searchable of await loadSearchIndex()) {
    const { entry } = searchable
    if (radicalNumber !== undefined && entry.radicalNumber !== radicalNumber) continue
    if (strokeCount !== undefined && !entry.strokeCounts?.includes(strokeCount)) continue

    // Stable, intentionally small ranking model: exact identity first, then
    // pinyin, meanings, and finally partial matches.
    let rank: number | undefined
    if (searchable.character === normalizedQuery) rank = 0
    else if (searchable.unicode === normalizedUnicode) rank = 1
    else if (searchable.pinyin.includes(normalizedQuery)) rank = 2
    else if (searchable.pinyin.some((value) => value.startsWith(normalizedQuery))) rank = 3
    else if (searchable.meanings.includes(normalizedQuery)) rank = 4
    else if (searchable.meanings.some((value) => value.startsWith(normalizedQuery))) rank = 5
    else if (
      searchable.pinyin.some((value) => value.includes(normalizedQuery)) ||
      searchable.meanings.some((value) => value.includes(normalizedQuery))
    ) rank = 6

    if (rank !== undefined) rankedResults.push({ entry, rank })
  }

  return rankedResults
    .sort((a, b) => a.rank - b.rank || a.entry.character.localeCompare(b.entry.character))
    .slice(0, Math.max(1, Math.min(limit, 100)))
    .map(({ entry }) => entry)
}
