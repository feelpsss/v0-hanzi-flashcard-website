# Base ampla de caracteres Han

Esta camada é estrutural/lexical e não substitui `lib/hanzi-data.ts`. O conteúdo pedagógico existente continua responsável por categorias, aulas, palavras compostas, traduções em português e sugestões atuais de flashcards.

## Fontes fixadas

### Unicode Unihan

- Fonte: `https://www.unicode.org/Public/17.0.0/ucd/Unihan.zip`
- Versão: Unicode 17.0.0, UCD de 2025-08-15
- SHA-256: `f7a48b2b545acfaa77b2d607ae28747404ce02baefee16396c5d2d7a8ef34b5e`
- Licença: Unicode License v3 (`https://www.unicode.org/license.txt`)
- Campos: `kMandarin`, `kDefinition`, `kRSUnicode`, `kTotalStrokes`, `kSimplifiedVariant` e `kTraditionalVariant`

O gerador examina todos os arquivos `Unihan*.txt` do ZIP, sem supor em qual arquivo cada propriedade estará. Isso acompanha a recomendação do UAX #38, pois propriedades podem mudar de arquivo entre versões.

`kRSUnicode` é preservado em `radicalStrokes`. Cada valor guarda o número do radical Kangxi, o símbolo correspondente no bloco Kangxi Radicals (`U+2F00` a `U+2FD5`), os traços residuais e o indicador de forma simplificada. `radical` e `radicalNumber` expõem o primeiro valor como atalho, sem descartar valores alternativos.

### CC-CEDICT

- Distribuição oficial: `https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz`
- Snapshot incluído: 2026-08-18T08:06:06Z, versão de formato 1.0
- Arquivo: `scripts/hanzi-data/sources/cedict-2026-08-18.txt.gz`
- SHA-256: `e11a9e1866725bf6eefb75d35e328e50cf66a17e5f3b19e4d0916354cba1787f`
- Licença: Creative Commons Attribution-ShareAlike 4.0 International
- Campos: forma tradicional, forma simplificada, pinyin e definições

O snapshot comprimido é mantido para tornar a geração repetível, já que a URL oficial é atualizada continuamente. Somente linhas cujas formas tradicional e simplificada contêm exatamente um caractere Han são associadas à base. Entradas compostas do CC-CEDICT não são aplicadas a caracteres isolados.

## Geração

Execute:

```bash
pnpm hanzi:data
```

O script usa apenas APIs nativas do Node.js, valida os hashes das fontes, converte pinyin numerado para marcas de tom, remove duplicatas e gera:

- `data/generated/hanzi-characters.json`: dataset minificado consumido pela aplicação;
- `data/generated/hanzi-characters.report.json`: métricas e amostras legíveis.

Para atualizar no futuro:

1. escolha uma nova versão fixada do Unihan e atualize URL, versão, data e hash no gerador;
2. baixe a nova distribuição oficial do CC-CEDICT, substitua o snapshot e atualize data e hash;
3. execute `pnpm hanzi:data`;
4. revise o relatório e as diferenças do dataset;
5. rode o build e as verificações do projeto.

## Acesso e performance

Os tipos públicos ficam em `lib/hanzi-character.ts`. O acesso ao JSON fica em `lib/hanzi-character-data.server.ts`, marcado como `server-only`, com funções para:

- carregar o dataset sob demanda;
- consultar diretamente um caractere;
- pesquisar por caractere, code point, pinyin, significado, radical e número de traços.

O JSON não é importado por componentes cliente e não entra no JavaScript inicial da página. Ele só é lido e analisado quando uma função server-only for chamada. A escolha evita banco externo, chamadas às fontes em runtime e complexidade de infraestrutura. Uma futura UI pode colocar paginação ou um índice segmentado diante desta camada se a pesquisa integral em memória se tornar necessária.

## Licenciamento

O dataset gerado combina dados sob Unicode License v3 e CC BY-SA 4.0. Distribuições e alterações do conteúdo derivado do CC-CEDICT devem respeitar atribuição e compartilhamento pela mesma licença. Consulte os textos oficiais antes de redistribuir a base fora deste projeto.
