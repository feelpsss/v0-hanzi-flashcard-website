import { NextRequest, NextResponse } from "next/server"

import { searchHanziCharacters } from "@/lib/hanzi-character-data.server"

export const runtime = "nodejs"

function optionalInteger(value: string | null): number | undefined {
  if (value === null || value === "") return undefined
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const query = params.get("q")?.trim() ?? ""
  const requestedLimit = optionalInteger(params.get("limit")) ?? 50
  const limit = Math.max(1, Math.min(requestedLimit, 100))
  const radicalNumber = optionalInteger(params.get("radical") ?? params.get("radicalNumber"))
  const strokeCount = optionalInteger(params.get("strokeCount"))

  if (!query) return NextResponse.json({ results: [] })

  const matches = await searchHanziCharacters({ query, limit, radicalNumber, strokeCount })
  const results = matches.map(({
    character,
    unicode,
    pinyin,
    meanings,
    radical,
    radicalNumber,
    strokeCount,
    strokeCounts,
    simplified,
    traditional,
  }) => ({
    character,
    unicode,
    pinyin,
    meanings,
    radical,
    radicalNumber,
    strokeCount,
    strokeCounts,
    simplified,
    traditional,
  }))
  return NextResponse.json({ results })
}
