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

function normalizeSearchValue(value: string): string {
  return value.toLocaleLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[1-5]/g, "")
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
  const { characters } = await loadHanziCharacterDataset()
  const results: HanziCharacter[] = []

  for (const entry of characters) {
    if (radicalNumber !== undefined && entry.radicalNumber !== radicalNumber) continue
    if (strokeCount !== undefined && !entry.strokeCounts?.includes(strokeCount)) continue
    if (
      normalizedQuery &&
      normalizeSearchValue(entry.character) !== normalizedQuery &&
      normalizeSearchValue(entry.unicode) !== normalizedQuery &&
      (!entry.radical || normalizeSearchValue(entry.radical) !== normalizedQuery) &&
      (!entry.radicalSymbol || normalizeSearchValue(entry.radicalSymbol) !== normalizedQuery) &&
      !entry.pinyin.some((value) => normalizeSearchValue(value).includes(normalizedQuery)) &&
      !entry.pinyinNumeric?.some((value) => normalizeSearchValue(value).includes(normalizedQuery)) &&
      !entry.meanings.some((value) => normalizeSearchValue(value).includes(normalizedQuery))
    ) {
      continue
    }

    results.push(entry)
    if (results.length >= limit) break
  }
  return results
}
