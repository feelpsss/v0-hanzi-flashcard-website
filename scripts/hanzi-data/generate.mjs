import { createHash } from "node:crypto"
import { readFile, writeFile, mkdir } from "node:fs/promises"
import { gunzipSync, inflateRawSync } from "node:zlib"
import path from "node:path"
import { fileURLToPath } from "node:url"

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDirectory, "../..")
const generatedDirectory = path.join(projectRoot, "data/generated")

const UNIHAN = {
  name: "Unicode Unihan",
  version: "17.0.0",
  date: "2025-08-15",
  url: "https://www.unicode.org/Public/17.0.0/ucd/Unihan.zip",
  license: "Unicode License v3",
  licenseUrl: "https://www.unicode.org/license.txt",
  sha256: "f7a48b2b545acfaa77b2d607ae28747404ce02baefee16396c5d2d7a8ef34b5e",
  fields: [
    "kMandarin",
    "kDefinition",
    "kRSUnicode",
    "kTotalStrokes",
    "kSimplifiedVariant",
    "kTraditionalVariant",
  ],
}

const CC_CEDICT = {
  name: "CC-CEDICT",
  version: "1.0.0",
  date: "2026-08-18T08:06:06Z",
  url: "https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz",
  license: "Creative Commons Attribution-ShareAlike 4.0 International",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  sha256: "e11a9e1866725bf6eefb75d35e328e50cf66a17e5f3b19e4d0916354cba1787f",
  fields: ["traditional", "simplified", "pinyin", "definitions"],
  snapshot: "scripts/hanzi-data/sources/cedict-2026-08-18.txt.gz",
}

const CJK_RADICALS = {
  name: "Unicode CJK Radicals",
  version: "17.0.0",
  date: "2025-05-07",
  url: "https://www.unicode.org/Public/17.0.0/ucd/CJKRadicals.txt",
  license: "Unicode License v3",
  licenseUrl: "https://www.unicode.org/license.txt",
  sha256: "826f83be25cd18fb8a5015a514704504e1982e840ea14d058bf583e1cc620c83",
  fields: ["radicalNumber", "radicalSymbol", "unifiedIdeograph"],
}

const toneMarks = {
  a: ["a", "ā", "á", "ǎ", "à"],
  e: ["e", "ē", "é", "ě", "è"],
  i: ["i", "ī", "í", "ǐ", "ì"],
  o: ["o", "ō", "ó", "ǒ", "ò"],
  u: ["u", "ū", "ú", "ǔ", "ù"],
  ü: ["ü", "ǖ", "ǘ", "ǚ", "ǜ"],
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex")
}

function assertChecksum(buffer, expected, sourceName) {
  const actual = sha256(buffer)
  if (actual !== expected) {
    throw new Error(`${sourceName} checksum mismatch: expected ${expected}, received ${actual}`)
  }
}

async function download(url) {
  const response = await fetch(url, { headers: { "user-agent": "v0-hanzi-data-generator/1.0" } })
  if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`)
  return Buffer.from(await response.arrayBuffer())
}

function unzipTextFiles(archive) {
  const files = new Map()
  const endOfCentralDirectory = archive.lastIndexOf(Buffer.from("PK\x05\x06", "binary"))
  if (endOfCentralDirectory < 0) throw new Error("Invalid ZIP: end of central directory not found")
  const entryCount = archive.readUInt16LE(endOfCentralDirectory + 10)
  let offset = archive.readUInt32LE(endOfCentralDirectory + 16)

  for (let entryIndex = 0; entryIndex < entryCount; entryIndex += 1) {
    if (archive.readUInt32LE(offset) !== 0x02014b50) throw new Error("Invalid ZIP central directory entry")
    const compression = archive.readUInt16LE(offset + 10)
    const compressedSize = archive.readUInt32LE(offset + 20)
    const fileNameLength = archive.readUInt16LE(offset + 28)
    const extraLength = archive.readUInt16LE(offset + 30)
    const commentLength = archive.readUInt16LE(offset + 32)
    const localOffset = archive.readUInt32LE(offset + 42)
    const fileName = archive.subarray(offset + 46, offset + 46 + fileNameLength).toString("utf8")
    const localNameLength = archive.readUInt16LE(localOffset + 26)
    const localExtraLength = archive.readUInt16LE(localOffset + 28)
    const dataStart = localOffset + 30 + localNameLength + localExtraLength
    const compressed = archive.subarray(dataStart, dataStart + compressedSize)

    if (fileName.endsWith(".txt")) {
      const content = compression === 0 ? compressed : compression === 8 ? inflateRawSync(compressed) : null
      if (!content) throw new Error(`Unsupported ZIP compression ${compression} for ${fileName}`)
      files.set(fileName, content.toString("utf8"))
    }
    offset += 46 + fileNameLength + extraLength + commentLength
  }
  return files
}

function isHanCodePoint(codePoint) {
  return (
    (codePoint >= 0x3400 && codePoint <= 0x4dbf) ||
    (codePoint >= 0x4e00 && codePoint <= 0x9fff) ||
    (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
    (codePoint >= 0x20000 && codePoint <= 0x2ffff) ||
    (codePoint >= 0x30000 && codePoint <= 0x3347f)
  )
}

function isSingleHanCharacter(value) {
  const codePoints = [...value]
  return codePoints.length === 1 && isHanCodePoint(codePoints[0].codePointAt(0))
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function splitUnihanMeanings(value) {
  return unique(value.split(";").map((meaning) => meaning.trim()))
}

function parseVariants(value) {
  return unique([...value.matchAll(/U\+([0-9A-F]{4,6})/g)].map((match) => String.fromCodePoint(Number.parseInt(match[1], 16))))
}

function parseCjkRadicals(text) {
  const radicals = new Map()
  for (const rawLine of text.split("\n")) {
    const line = rawLine.replace(/#.*/, "").trim()
    if (!line) continue
    const [identifier, symbolCodePoint, ideographCodePoint] = line.split(";").map((field) => field.trim())
    const match = /^(\d{1,3})('{0,3})$/.exec(identifier)
    if (!match) throw new Error(`Unsupported CJK radical identifier: ${identifier}`)
    radicals.set(identifier, {
      radicalNumber: Number.parseInt(match[1], 10),
      simplifiedForm: match[2].length,
      radicalSymbol: symbolCodePoint ? String.fromCodePoint(Number.parseInt(symbolCodePoint, 16)) : undefined,
      radical: String.fromCodePoint(Number.parseInt(ideographCodePoint, 16)),
    })
  }
  return radicals
}

function parseRadicalStrokes(value, radicalMappings) {
  return value.split(" ").map((item) => {
    const match = /^(\d{1,3})('{0,3})\.(-?\d+)$/.exec(item)
    if (!match) throw new Error(`Unsupported kRSUnicode value: ${item}`)
    const radicalNumber = Number.parseInt(match[1], 10)
    const simplifiedForm = match[2].length
    const mapping = radicalMappings.get(`${radicalNumber}${"'".repeat(simplifiedForm)}`)
    if (!mapping) throw new Error(`Missing CJKRadicals mapping for ${item}`)
    return {
      radicalNumber,
      radical: mapping.radical,
      ...(mapping.radicalSymbol ? { radicalSymbol: mapping.radicalSymbol } : {}),
      additionalStrokes: Number.parseInt(match[3], 10),
      simplifiedForm,
    }
  })
}

function numberedSyllableToToneMarks(rawSyllable) {
  const normalized = rawSyllable.toLowerCase().replaceAll("u:", "ü").replaceAll("v", "ü")
  const match = /^(.*?)([1-5])$/.exec(normalized)
  if (!match) return normalized
  const syllable = match[1]
  const tone = Number.parseInt(match[2], 10)
  if (tone === 5) return syllable

  const vowels = [...syllable]
  let vowelIndex = vowels.indexOf("a")
  if (vowelIndex < 0) vowelIndex = vowels.indexOf("e")
  if (vowelIndex < 0) {
    const ouIndex = syllable.indexOf("ou")
    if (ouIndex >= 0) vowelIndex = ouIndex
  }
  if (vowelIndex < 0) {
    for (let index = vowels.length - 1; index >= 0; index -= 1) {
      if (toneMarks[vowels[index]]) {
        vowelIndex = index
        break
      }
    }
  }
  if (vowelIndex < 0) return syllable
  vowels[vowelIndex] = toneMarks[vowels[vowelIndex]][tone]
  return vowels.join("")
}

function numberedPinyinToToneMarks(value) {
  return value
    .toLowerCase()
    .replaceAll("u:", "ü")
    .replaceAll("v", "ü")
    .replace(/[a-zü]+[1-5]/g, (syllable) => numberedSyllableToToneMarks(syllable))
    .trim()
}

function createCharacter(codePoint) {
  return {
    character: String.fromCodePoint(codePoint),
    unicode: `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`,
    pinyin: [],
    pinyinNumeric: [],
    meanings: [],
    sources: { pinyin: [], meanings: [] },
  }
}

function addSource(target, field, source) {
  if (!target.sources[field].includes(source)) target.sources[field].push(source)
}

function addValues(target, field, values, source) {
  target[field] = unique([...target[field], ...values])
  if (values.length > 0) addSource(target, field === "meanings" ? "meanings" : "pinyin", source)
}

function parseUnihan(files, radicalMappings) {
  const characters = new Map()
  const wantedFields = new Set(UNIHAN.fields)

  for (const content of files.values()) {
    for (const line of content.split("\n")) {
      if (!line || line.startsWith("#")) continue
      const [codePointText, field, value] = line.split("\t")
      if (!wantedFields.has(field)) continue
      const codePoint = Number.parseInt(codePointText.slice(2), 16)
      if (!isHanCodePoint(codePoint)) continue
      const entry = characters.get(codePoint) ?? createCharacter(codePoint)
      characters.set(codePoint, entry)

      if (field === "kMandarin") addValues(entry, "pinyin", value.split(" ").map((item) => item.toLowerCase()), "Unihan")
      if (field === "kDefinition") addValues(entry, "meanings", splitUnihanMeanings(value), "Unihan")
      if (field === "kRSUnicode") {
        entry.radicalStrokes = parseRadicalStrokes(value, radicalMappings)
        entry.radicalNumber = entry.radicalStrokes[0].radicalNumber
        entry.radical = entry.radicalStrokes[0].radical
        if (entry.radicalStrokes[0].radicalSymbol) entry.radicalSymbol = entry.radicalStrokes[0].radicalSymbol
      }
      if (field === "kTotalStrokes") {
        entry.strokeCounts = unique(value.split(" ").map((item) => Number.parseInt(item, 10)))
        entry.strokeCount = entry.strokeCounts[0]
      }
      if (field === "kSimplifiedVariant") entry.simplified = parseVariants(value)
      if (field === "kTraditionalVariant") entry.traditional = parseVariants(value)
    }
  }
  return characters
}

function createRadicalCatalog(radicalMappings, characters) {
  const components = new Map()
  for (const entry of characters.values()) {
    for (const radicalStroke of entry.radicalStrokes ?? []) {
      if (radicalStroke.additionalStrokes !== 0) continue
      const values = components.get(radicalStroke.radicalNumber) ?? []
      if (!values.includes(entry.character)) values.push(entry.character)
      components.set(radicalStroke.radicalNumber, values)
    }
  }

  return Array.from({ length: 214 }, (_, index) => {
    const radicalNumber = index + 1
    const forms = [...radicalMappings.values()]
      .filter((mapping) => mapping.radicalNumber === radicalNumber)
      .sort((left, right) => left.simplifiedForm - right.simplifiedForm)
    const primary = forms[0]
    return {
      radicalNumber,
      radical: primary.radical,
      ...(primary.radicalSymbol ? { radicalSymbol: primary.radicalSymbol } : {}),
      components: unique([primary.radical, ...(components.get(radicalNumber) ?? [])]),
      forms,
    }
  })
}

function parseCcCedict(buffer, characters) {
  const text = gunzipSync(buffer).toString("utf8")
  for (const line of text.split("\n")) {
    if (!line || line.startsWith("#")) continue
    const match = /^(\S+) (\S+) \[([^\]]+)\] \/(.+)\/$/.exec(line.trimEnd())
    if (!match) continue
    const [, traditional, simplified, numericPinyin, definitionsText] = match
    if (!isSingleHanCharacter(traditional) || !isSingleHanCharacter(simplified)) continue
    const headwords = unique([traditional, simplified])
    const pinyinNumeric = numericPinyin.toLowerCase()
    const pinyin = numberedPinyinToToneMarks(numericPinyin)
    const meanings = unique(definitionsText.split("/").map((meaning) => meaning.trim()))

    for (const headword of headwords) {
      const codePoint = headword.codePointAt(0)
      const entry = characters.get(codePoint) ?? createCharacter(codePoint)
      characters.set(codePoint, entry)
      addValues(entry, "pinyin", [pinyin], "CC-CEDICT")
      entry.pinyinNumeric = unique([...entry.pinyinNumeric, pinyinNumeric])
      addValues(entry, "meanings", meanings, "CC-CEDICT")
    }
  }
}

function cleanEntry(entry) {
  if (entry.pinyinNumeric.length === 0) delete entry.pinyinNumeric
  if (entry.sources.pinyin.length === 0) delete entry.sources.pinyin
  if (entry.sources.meanings.length === 0) delete entry.sources.meanings
  if (Object.keys(entry.sources).length === 0) delete entry.sources
  return entry
}

function createStatistics(characters) {
  const count = (predicate) => characters.filter(predicate).length
  return {
    total: characters.length,
    withPinyin: count((entry) => entry.pinyin.length > 0),
    withMeanings: count((entry) => entry.meanings.length > 0),
    withRadical: count((entry) => entry.radicalNumber !== undefined),
    withStrokeCount: count((entry) => entry.strokeCount !== undefined),
    withSimplifiedVariant: count((entry) => entry.simplified?.length > 0),
    withTraditionalVariant: count((entry) => entry.traditional?.length > 0),
  }
}

async function main() {
  const [unihanArchive, cjkRadicalsFile] = await Promise.all([download(UNIHAN.url), download(CJK_RADICALS.url)])
  assertChecksum(unihanArchive, UNIHAN.sha256, UNIHAN.name)
  assertChecksum(cjkRadicalsFile, CJK_RADICALS.sha256, CJK_RADICALS.name)
  const ccCedictArchive = await readFile(path.join(projectRoot, CC_CEDICT.snapshot))
  assertChecksum(ccCedictArchive, CC_CEDICT.sha256, CC_CEDICT.name)

  const radicalMappings = parseCjkRadicals(cjkRadicalsFile.toString("utf8"))
  const characterMap = parseUnihan(unzipTextFiles(unihanArchive), radicalMappings)
  parseCcCedict(ccCedictArchive, characterMap)
  const characters = [...characterMap.entries()]
    .sort(([left], [right]) => left - right)
    .map(([, entry]) => cleanEntry(entry))
  const statistics = createStatistics(characters)
  const radicals = createRadicalCatalog(radicalMappings, characterMap)
  const metadata = { schemaVersion: 1, sources: { unihan: UNIHAN, cjkRadicals: CJK_RADICALS, ccCedict: CC_CEDICT } }
  const dataset = { metadata, statistics, radicals, characters }
  const examples = Object.fromEntries(
    ["你", "我", "学", "學", "国", "國", "龍", "龘"].map((character) => [
      character,
      characters.find((entry) => entry.character === character) ?? null,
    ]),
  )
  const radicalExamples = Object.fromEntries(
    [9, 62, 212].map((radicalNumber) => [radicalNumber, radicals[radicalNumber - 1]]),
  )

  await mkdir(generatedDirectory, { recursive: true })
  const datasetPath = path.join(generatedDirectory, "hanzi-characters.json")
  await writeFile(datasetPath, `${JSON.stringify(dataset)}\n`)
  const fileSizeBytes = (await readFile(datasetPath)).byteLength
  const report = {
    ...statistics,
    fileSizeBytes,
    fileSizeMiB: Number((fileSizeBytes / 1024 / 1024).toFixed(2)),
    radicalExamples,
    examples,
  }
  await writeFile(path.join(generatedDirectory, "hanzi-characters.report.json"), `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify(report, null, 2))
}

await main()
