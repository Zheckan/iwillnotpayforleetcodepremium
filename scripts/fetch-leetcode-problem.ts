#!/usr/bin/env bun

interface TopicTag {
  name?: string | null
  slug?: string | null
}

interface CodeSnippet {
  lang: string
  langSlug: string
  code: string
}

interface QuestionNode {
  questionFrontendId: string
  title: string
  difficulty: string
  content: string | null
  topicTags: TopicTag[]
  titleSlug?: string | null
  codeSnippets?: CodeSnippet[] | null
  exampleTestcaseList?: string[] | null
  metaData?: string | null
}

interface GraphQLErrorItem {
  message?: string
}

interface LeetCodeQuestionGraphQLResponse {
  errors?: GraphQLErrorItem[]
  data?: {
    question?: QuestionNode | null
  }
}

/** Shape of https://leetcode.com/api/problems/all/ entries we read from the dataset. */
interface LeetCodeDatasetStat {
  question__title_slug?: string
  question__title?: string
}

interface LeetCodeDatasetEntry {
  stat?: LeetCodeDatasetStat
}

interface LeetCodeProblemsDatasetResponse {
  stat_status_pairs?: LeetCodeDatasetEntry[]
}

interface NormalizedExample {
  title: string
  markdown: string
  rawText: string
  inputs: string[]
  outputs: string[]
  explanation: string
}

interface NormalizedSections {
  description: string
  examples: NormalizedExample[]
  constraints: string[]
  followUp: string
}

interface OllamaContext {
  title: string
  difficulty: string
  topics: string[]
  model: string
}

interface ExtractedSections {
  descriptionHtml: string
  examples: NormalizedExample[]
  constraints: string[]
  followUpHtml: string
}

interface ExtractedImage {
  url: string
  filename: string
}

interface StarterCodeSelection {
  lang: string
  langSlug: string
  code: string
  source: 'match' | 'fallback'
}

interface QuestionMetaParam {
  name: string
  type: string
}

interface QuestionMetaReturn {
  type: string
  size?: number
}

interface QuestionMeta {
  name: string
  params: QuestionMetaParam[]
  return: QuestionMetaReturn
}

interface TestCaseDatum {
  label: string
  rawInput: string
  inputLines: string[]
  parsedInputs: unknown[] | null
  expectedRaw: string | null
  parsedExpected: unknown
  hasExpected: boolean
}

interface TestHarness {
  language: string
  mode: 'runnable' | 'comment'
  code: string
}

const DEFAULT_MODEL = (process.env.OLLAMA_MODEL ?? 'gpt-oss:20b').trim() || 'gpt-oss:20b'
const OLLAMA_ENDPOINT = (process.env.OLLAMA_ENDPOINT ?? 'http://127.0.0.1:11434').replace(/\/$/, '')

const args = Bun.argv.slice(2)
if (args.length === 0) {
  console.error('Usage: fetch-leetcode-problem.ts "<problem-title>"')
  process.exit(1)
}

const rawTitle = args.join(' ').trim()
if (!rawTitle) {
  console.error('Problem title cannot be empty.')
  process.exit(1)
}

const GRAPHQL_ENDPOINT = 'https://leetcode.com/graphql'
const DATASET_ENDPOINT = 'https://leetcode.com/api/problems/all/'
async function main() {
  let slug = slugify(rawTitle)
  let slugSource: string = 'derived'

  let question = await fetchQuestion(slug)
  if (!question) {
    const fallback = await findSlugViaDataset(rawTitle, slug)
    if (!fallback) {
      throw new Error(`Could not locate a LeetCode problem matching title: "${rawTitle}"`)
    }
    slug = fallback.slug
    slugSource = fallback.source
    question = await fetchQuestion(slug)
  }

  if (!question) {
    throw new Error(`GraphQL did not return data for slug: ${slug}`)
  }

  const resolvedSlug = (question.titleSlug ?? slug).toLowerCase()
  const meta = buildMeta(question, resolvedSlug, slugSource)

  const rawContentHtml = question.content ?? ''
  const images = extractImages(rawContentHtml)
  const contentHtml = images.length > 0 ? replaceImagesWithMarkdown(rawContentHtml, images) : rawContentHtml

  const structured = await buildStructuredSections(contentHtml, {
    title: question.title,
    difficulty: question.difficulty,
    topics: meta.topics,
    model: DEFAULT_MODEL,
  })
  const starterCode = resolveStarterCode(
    Array.isArray(question.codeSnippets) ? question.codeSnippets : [],
    process.env.PROBLEM_LANG ?? '',
  )
  const questionMeta = parseMeta(question.metaData ?? '')
  const exampleTestcases = Array.isArray(question.exampleTestcaseList) ? question.exampleTestcaseList : []
  const testCases = questionMeta ? buildTestCases(questionMeta, exampleTestcases, structured.examples) : []
  const testHarness = questionMeta
    ? buildTestHarness({
        languageHint: process.env.PROBLEM_LANG ?? '',
        selectedLanguage: starterCode?.langSlug ?? '',
        meta: questionMeta,
        functionName: questionMeta.name,
        cases: testCases,
      })
    : null

  const readmeContent = buildReadmeContent(meta, structured)

  const payload = {
    title: meta.title,
    slug: meta.slug,
    frontendId: meta.frontendId,
    paddedFrontendId: meta.paddedFrontendId,
    difficulty: {
      label: meta.difficultyLabel,
      lower: meta.difficultyLower,
    },
    topics: meta.topics,
    topicsLine: meta.topicsLine,
    url: meta.url,
    targetFolderName: meta.targetFolderName,
    readmeContent,
    structured,
    images,
    starterCode: starterCode
      ? {
          lang: starterCode.lang,
          langSlug: starterCode.langSlug,
          code: starterCode.code,
          source: starterCode.source,
        }
      : null,
    meta: questionMeta,
    testCases,
    testHarness,
    metadata: {
      slugSource: meta.slugSource,
      ollamaModel: DEFAULT_MODEL,
      ollamaEndpoint: `${OLLAMA_ENDPOINT}/api/generate`,
      starterCodeSource: starterCode?.source ?? null,
    },
  }

  process.stdout.write(JSON.stringify(payload, null, 2))
}

async function fetchQuestion(titleSlug: string): Promise<QuestionNode | null> {
  if (!titleSlug) {
    return null
  }

  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionFrontendId
        title
        difficulty
        content
        titleSlug
        topicTags {
          name
          slug
        }
        codeSnippets {
          lang
          langSlug
          code
        }
        exampleTestcaseList
        metaData
      }
    }
  `

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': 'Mozilla/5.0 (compatible; ProblemBootstrap/1.0)',
      referer: 'https://leetcode.com/problemset/all/',
    },
    body: JSON.stringify({
      query,
      variables: { titleSlug },
    }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed for slug "${titleSlug}" (status ${response.status})`)
  }

  const json = (await response.json()) as LeetCodeQuestionGraphQLResponse

  if (Array.isArray(json.errors) && json.errors.length > 0) {
    const message = json.errors.map((err) => err?.message ?? '').join(' | ')
    throw new Error(`GraphQL errors for slug "${titleSlug}": ${message}`)
  }

  const question = json?.data?.question as QuestionNode | null | undefined
  return question ?? null
}

async function findSlugViaDataset(
  title: string,
  derivedSlug: string,
): Promise<{ slug: string; source: string } | null> {
  const response = await fetch(DATASET_ENDPOINT, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; ProblemBootstrap/1.0)',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch LeetCode dataset (status ${response.status}).`)
  }

  const json = (await response.json()) as LeetCodeProblemsDatasetResponse
  const pairs: LeetCodeDatasetEntry[] = Array.isArray(json.stat_status_pairs) ? json.stat_status_pairs : []

  if (!pairs.length) {
    return null
  }

  const normalizedTitle = title.trim().toLowerCase()
  const slugMatch = pairs.find((entry) => entry?.stat?.question__title_slug === derivedSlug)
  if (slugMatch?.stat?.question__title_slug) {
    return { slug: slugMatch.stat.question__title_slug, source: 'dataset-slug' }
  }

  const exactTitleMatch = pairs.find((entry) => entry?.stat?.question__title?.trim()?.toLowerCase() === normalizedTitle)
  if (exactTitleMatch?.stat?.question__title_slug) {
    return { slug: exactTitleMatch.stat.question__title_slug, source: 'dataset-title' }
  }

  const partialMatches = pairs.filter((entry) => {
    const candidate = entry?.stat?.question__title?.trim()?.toLowerCase()
    return candidate ? candidate.includes(normalizedTitle) : false
  })

  if (partialMatches.length === 1 && partialMatches[0]?.stat?.question__title_slug) {
    return {
      slug: partialMatches[0].stat.question__title_slug,
      source: 'dataset-partial',
    }
  }

  return null
}

function buildMeta(question: QuestionNode, slug: string, slugSource: string) {
  const frontendId = question.questionFrontendId.trim()
  const paddedFrontendId = frontendId.padStart(4, '0')
  const difficultyLabel = question.difficulty.trim()
  const difficultyLower = difficultyLabel.toLowerCase()
  const topics = Array.from(
    new Set(
      (question.topicTags || []).map((tag) => (tag?.name ?? '').trim()).filter((name) => Boolean(name)) as string[],
    ),
  )
  const topicsLine = topics.length ? topics.join(', ') : 'Topic1, Topic2, Topic3'
  const url = `https://leetcode.com/problems/${slug}/`

  return {
    title: question.title,
    slug,
    slugSource,
    frontendId,
    paddedFrontendId,
    difficultyLabel,
    difficultyLower,
    topics,
    topicsLine,
    url,
    targetFolderName: `${paddedFrontendId}-${slug}`,
  }
}

function resolveStarterCode(snippets: CodeSnippet[], languageHintRaw: string): StarterCodeSelection | null {
  if (!snippets.length) {
    return null
  }

  const languageHint = languageHintRaw.trim().toLowerCase()
  const slugPreferences = getLanguageSlugPreferences(languageHint)

  const normalizedSnippets = snippets.map((snippet) => ({
    lang: snippet.lang.trim(),
    langLower: snippet.lang.trim().toLowerCase(),
    langSlug: snippet.langSlug.trim().toLowerCase(),
    code: snippet.code ?? '',
  }))

  const matchedSnippet = slugPreferences
    .map((preferred) =>
      normalizedSnippets.find((snippet) => snippet.langSlug === preferred || snippet.langLower === preferred),
    )
    .find((snippet): snippet is (typeof normalizedSnippets)[number] => Boolean(snippet))

  const snippetToUse =
    matchedSnippet ||
    (languageHint
      ? normalizedSnippets.find(
          (snippet) => snippet.langLower.includes(languageHint) || snippet.langSlug.includes(languageHint),
        )
      : undefined) ||
    normalizedSnippets[0]

  if (!snippetToUse) {
    return null
  }

  const source: 'match' | 'fallback' = matchedSnippet ? 'match' : 'fallback'

  return {
    lang: snippetToUse.lang,
    langSlug: snippetToUse.langSlug,
    code: ensureTrailingNewline(snippetToUse.code.replace(/\r\n/g, '\n')),
    source,
  }
}

function getLanguageSlugPreferences(languageHint: string): string[] {
  if (!languageHint) {
    return []
  }

  const preferences: Record<string, string[]> = {
    ts: ['typescript'],
    typescript: ['typescript'],
    js: ['javascript', 'typescript'],
    javascript: ['javascript', 'typescript'],
    py: ['python3', 'python'],
    python: ['python3', 'python'],
    python3: ['python3', 'python'],
    java: ['java'],
    cpp: ['cpp', 'c++'],
    c: ['c'],
    go: ['golang', 'go'],
    golang: ['golang', 'go'],
    rb: ['ruby'],
    ruby: ['ruby'],
    swift: ['swift'],
    kotlin: ['kotlin'],
    kt: ['kotlin'],
    rs: ['rust'],
    rust: ['rust'],
    php: ['php'],
    scala: ['scala'],
    dart: ['dart'],
    csharp: ['csharp', 'c#'],
    'c#': ['csharp', 'c#'],
    typescriptreact: ['typescript'],
  }

  return preferences[languageHint] ?? [languageHint]
}

async function buildStructuredSections(html: string, context: OllamaContext): Promise<NormalizedSections> {
  const sections = extractSections(html)

  let descriptionMarkdown = ''
  if (sections.descriptionHtml.trim()) {
    try {
      const raw = await convertHtmlToMarkdown(sections.descriptionHtml, {
        ...context,
        section: 'Problem Description',
      })
      // Ollama may leave residual HTML tags (e.g. <sup>, <i>) in its output.
      // Run a lightweight cleanup pass to convert them to proper Markdown.
      descriptionMarkdown = cleanHtmlFromMarkdown(raw)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`Warning: ollama description conversion failed (${message}). Falling back to basic summary.`)
    }
  }

  if (!descriptionMarkdown.trim()) {
    descriptionMarkdown = buildFallbackDescription(sections.descriptionHtml || html)
  }

  let followUpMarkdown = ''
  if (sections.followUpHtml.trim()) {
    try {
      const raw = await convertHtmlToMarkdown(sections.followUpHtml, {
        ...context,
        section: 'Follow-up',
      })
      followUpMarkdown = cleanHtmlFromMarkdown(raw)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`Warning: ollama follow-up conversion failed (${message}). Using plain text instead.`)
      followUpMarkdown = stripHtml(sections.followUpHtml)
    }
  }

  return {
    description: descriptionMarkdown.trim() || buildFallbackDescription(html),
    examples: sections.examples,
    constraints: sections.constraints,
    followUp: followUpMarkdown.trim(),
  }
}

function extractSections(html: string): ExtractedSections {
  const descriptionHtml = extractDescriptionHtml(html)
  const examples = extractExamples(html)
  const constraints = extractConstraints(html)
  const followUpHtml = extractFollowUpHtml(html)
  return {
    descriptionHtml,
    examples,
    constraints,
    followUpHtml,
  }
}

function extractDescriptionHtml(html: string): string {
  if (!html) {
    return ''
  }
  const lower = html.toLowerCase()
  const exampleIdx = lower.indexOf('<strong class="example">')
  if (exampleIdx !== -1) {
    return html.slice(0, exampleIdx)
  }
  const constraintsIdx = lower.indexOf('<strong>constraints</strong>')
  if (constraintsIdx !== -1) {
    return html.slice(0, constraintsIdx)
  }
  return html
}

function extractExamples(html: string): NormalizedExample[] {
  const lowerHtml = html.toLowerCase()
  const marker = '<strong class="example">'
  const markerLength = marker.length
  const indices: number[] = []

  let searchIndex = 0
  while (true) {
    const found = lowerHtml.indexOf(marker, searchIndex)
    if (found === -1) {
      break
    }
    indices.push(found)
    searchIndex = found + markerLength
  }

  if (!indices.length) {
    return []
  }

  const examples: NormalizedExample[] = []

  const findSectionEnd = (start: number) => {
    const tokens = ['<strong>constraints', '<strong>follow-up', '<strong class="follow-up"']
    let minIndex = Number.POSITIVE_INFINITY
    for (const token of tokens) {
      const position = lowerHtml.indexOf(token, start)
      if (position !== -1 && position < minIndex) {
        minIndex = position
      }
    }
    return Number.isFinite(minIndex) ? minIndex : html.length
  }

  indices.forEach((startIndex, idx) => {
    const blockStart = startIndex
    const blockEnd = idx + 1 < indices.length ? indices[idx + 1] : findSectionEnd(startIndex + markerLength)
    const blockHtml = html.slice(blockStart, blockEnd)
    const titleMatch = blockHtml.match(/<strong class="example">([\s\S]*?)<\/strong>/i)
    const title = sanitizeExampleTitle(titleMatch?.[1] ?? '', idx)
    const remainderHtml = titleMatch ? blockHtml.slice(titleMatch[0].length) : blockHtml
    const body = decodeHtmlPreservingNewlines(remainderHtml)
    const parsed = parseExampleIO(body)
    const trimmedBody = body.trim()
    const bodyLines = trimmedBody.split('\n')
    const imageLines = bodyLines.filter((line) => line.trim().startsWith('!['))
    const codeLines = bodyLines.filter((line) => !line.trim().startsWith('!['))
    const codeBody = codeLines.join('\n').trim()
    const imagePart = imageLines.length > 0 ? imageLines.join('\n') + '\n\n' : ''
    const codePart = codeBody ? `\`\`\`\n${codeBody}\n\`\`\`` : ''
    const markdown = imagePart || codePart ? `${imagePart}${codePart}`.trim() : '_(Example content unavailable.)_'

    examples.push({
      title,
      markdown,
      rawText: body,
      inputs: parsed.inputs,
      outputs: parsed.outputs,
      explanation: parsed.explanation,
    })
  })

  return examples
}

function extractConstraints(html: string): string[] {
  const match = html.match(/<strong>Constraints:<\/strong>[\s\S]*?(?:<ul>([\s\S]*?)<\/ul>|<ol>([\s\S]*?)<\/ol>)/i)
  if (!match) {
    return []
  }
  const listHtml = match[1] ?? match[2] ?? ''
  const itemRegex = /<li>([\s\S]*?)<\/li>/gi
  const constraints: string[] = []
  let itemMatch: RegExpExecArray | null
  while ((itemMatch = itemRegex.exec(listHtml)) !== null) {
    const text = formatConstraintText(stripHtml(itemMatch[1] ?? ''))
    if (text) {
      constraints.push(text)
    }
  }
  return constraints
}

function formatConstraintText(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/\s*\(\s*/g, '(')
    .replace(/\s*\)\s*/g, ')')
    .replace(/([a-zA-Z0-9])\(/g, '$1 (')
    .replace(/\)([a-zA-Z0-9])/g, ') $1')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s*\.\s*$/g, '.')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function extractFollowUpHtml(html: string): string {
  const match = html.match(/<strong>Follow-up:<\/strong>([\s\S]*?)(?:<strong>|$)/i)
  if (!match) {
    return ''
  }
  return match[1] ?? ''
}

async function convertHtmlToMarkdown(
  htmlSnippet: string,
  context: OllamaContext & { section: string },
): Promise<string> {
  const snippet = htmlSnippet.trim()
  if (!snippet) {
    return ''
  }

  const prompt = [
    'You are an HTML-to-Markdown converter. Your output is written verbatim to a README file.',
    '',
    'OUTPUT RULES (mandatory):',
    '- Output ONLY the converted GitHub-flavored Markdown.',
    '- Do NOT include any preamble, planning, explanation, or commentary about your task.',
    '- Do NOT start with phrases like "Here is", "Here\'s", "Thus", "So:", "We need to", "The output is", "I will", or any meta-commentary.',
    '- Do NOT repeat the input HTML.',
    '- Do NOT output the same sentence twice.',
    '- Do NOT mention "Markdown", "HTML", or your conversion process.',
    '- Preserve: math notation, inline code (`backticks`), markdown image links (e.g. ![alt](path)), emphasis, lists.',
    '- Convert: <strong>/<b> → **bold**, <em>/<i> → _italic_, <code> → `code`.',
    '- Strip: wrapper tags like <p>, <div>, <section>.',
    '',
    `Context: section "${context.section}" of LeetCode problem "${context.title}" (${context.difficulty}).`,
    '',
    'INPUT HTML:',
    snippet,
    '',
    'OUTPUT MARKDOWN:',
  ].join('\n')

  const response = await fetch(`${OLLAMA_ENDPOINT}/api/generate`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: context.model,
      prompt,
      stream: false,
      options: {
        temperature: 0,
        top_p: 0.1,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`ollama HTTP error (status ${response.status})`)
  }

  const json = (await response.json()) as { response?: string }
  const raw = typeof json?.response === 'string' ? json.response.trim() : ''
  if (!raw) {
    throw new Error('ollama returned empty output')
  }
  return stripMetaCommentary(raw)
}

/**
 * Safety net: strip meta-commentary that LLMs sometimes leak when converting HTML.
 *
 * Common failure modes we've observed (gpt-oss:20b):
 *   - "We need to preserve math expressions, inline code... Thus:\n\nGiven a string..."
 *   - "Here is the markdown:\n\n# Title..."
 *   - Output the answer, then repeat the answer prefixed by "Thus:" or similar.
 *
 * Strategy:
 *   1. Drop leading lines matching known meta patterns until we find real content.
 *   2. If the output ends with a duplicate of an earlier paragraph (preamble + answer + repeated answer),
 *      detect and trim. This is a conservative pass; if we can't be confident, leave it.
 */
function stripMetaCommentary(raw: string): string {
  const META_PREFIXES = [
    /^we need to\b/i,
    /^we should\b/i,
    /^we will\b/i,
    /^we want\b/i,
    /^let'?s\b/i,
    /^here'?s\b/i,
    /^here is\b/i,
    /^here are\b/i,
    /^the output\b/i,
    /^the markdown\b/i,
    /^the final\b/i,
    /^the result\b/i,
    /^thus\b/i,
    /^therefore\b/i,
    /^so\s*[:,]?\s*$/i,
    /^so\s*[:,]/i,
    /^also\b/i,
    /^output\s*[:]/i,
    /^markdown\s*[:]/i,
    /^that'?s it\b/i,
    /^ensure\b/i,
    /^note that the\b/i, // model commentary, not problem note
    /\bcommentary\b/i,
    /\bbacktick\b/i,
  ]

  // Step 1: drop leading meta lines (cap at 20 to avoid eating real content).
  let lines = raw.split('\n')
  let stripped = 0
  while (lines.length > 0 && stripped < 20) {
    const first = lines[0].trim()
    if (!first) {
      lines.shift()
      stripped += 1
      continue
    }
    const isMeta = META_PREFIXES.some((rx) => rx.test(first))
    if (!isMeta) break
    lines.shift()
    stripped += 1
  }

  // Step 2: detect and trim "preamble + answer + duplicated answer" pattern.
  // If the same non-trivial line appears twice and the second occurrence is at the
  // start of a duplicate section, keep only one copy.
  const cleaned = lines.join('\n').trim()
  const sentences = cleaned.split(/\n{2,}/)
  if (sentences.length >= 2) {
    const half = Math.floor(sentences.length / 2)
    const firstHalf = sentences.slice(0, half).join('\n\n')
    const secondHalf = sentences.slice(half).join('\n\n')
    // If second half is an exact substring continuation of the first half's content, dedupe.
    if (firstHalf.length > 40 && secondHalf.startsWith(firstHalf)) {
      return firstHalf.trim()
    }
  }

  return cleaned
}

function decodeHtmlPreservingNewlines(html: string): string {
  if (!html) {
    return ''
  }
  return html
    .replace(/<\/?code[^>]*>/gi, '')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(p|div|section|li|ul|ol|table|tbody|thead|tr|td|th)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#96;/gi, '`')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function sanitizeExampleTitle(rawTitleHtml: string, index: number): string {
  const text = rawTitleHtml
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[:\s]+$/g, '')
    .trim()
  return text || `Example ${index + 1}`
}

function parseExampleIO(text: string): { inputs: string[]; outputs: string[]; explanation: string } {
  const inputs: string[] = []
  const outputs: string[] = []
  const explanationLines: string[] = []

  const lines = text.replace(/\r\n/g, '\n').split('\n')
  let capturingExplanation = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      if (capturingExplanation) {
        explanationLines.push('')
      }
      continue
    }

    const lower = trimmed.toLowerCase()

    if (lower.startsWith('input:')) {
      inputs.push(trimmed.slice(trimmed.indexOf(':') + 1).trim())
      capturingExplanation = false
      continue
    }

    if (lower.startsWith('output:')) {
      outputs.push(trimmed.slice(trimmed.indexOf(':') + 1).trim())
      capturingExplanation = false
      continue
    }

    if (lower.startsWith('answer:')) {
      outputs.push(trimmed.slice(trimmed.indexOf(':') + 1).trim())
      capturingExplanation = false
      continue
    }

    if (lower.startsWith('explanation:')) {
      const explanationText = trimmed.slice(trimmed.indexOf(':') + 1).trim()
      if (explanationText) {
        explanationLines.push(explanationText)
      }
      capturingExplanation = true
      continue
    }

    if (capturingExplanation) {
      explanationLines.push(trimmed)
    }
  }

  const explanation = explanationLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return { inputs, outputs, explanation }
}

function parseMeta(metaJson: string): QuestionMeta | null {
  if (!metaJson || !metaJson.trim()) {
    return null
  }

  try {
    const meta = JSON.parse(metaJson) as QuestionMeta | null
    if (!meta || typeof meta.name !== 'string') {
      return null
    }
    const params = Array.isArray(meta.params)
      ? meta.params.filter(
          (param): param is QuestionMetaParam =>
            param && typeof param.name === 'string' && typeof param.type === 'string',
        )
      : []
    const returnType = meta.return && typeof meta.return.type === 'string' ? meta.return : { type: '' }
    return {
      name: meta.name,
      params,
      return: returnType,
    }
  } catch (error) {
    console.warn(`Unable to parse metaData JSON: ${(error as Error).message}`)
    return null
  }
}

function buildTestCases(
  meta: QuestionMeta,
  exampleTestcaseList: string[],
  examples: NormalizedExample[],
): TestCaseDatum[] {
  const max = Math.max(exampleTestcaseList.length, examples.length)
  const cases: TestCaseDatum[] = []

  for (let index = 0; index < max; index += 1) {
    const rawInput = exampleTestcaseList[index] ?? ''
    const example = examples[index]
    const label = example?.title || `Example ${index + 1}`

    const { inputLines, parsedInputs } = parseTestcaseInputs(rawInput, meta)

    const expectedRaw = example?.outputs?.[0] ?? null
    const expectedParse = expectedRaw
      ? parseValueWithType(expectedRaw, meta.return?.type ?? '')
      : { ok: false, value: undefined }

    cases.push({
      label,
      rawInput,
      inputLines,
      parsedInputs,
      expectedRaw,
      parsedExpected: expectedParse.value,
      hasExpected: Boolean(expectedRaw) && expectedParse.ok,
    })
  }

  return cases
}

function parseTestcaseInputs(
  rawInput: string,
  meta: QuestionMeta,
): { inputLines: string[]; parsedInputs: unknown[] | null } {
  if (!rawInput) {
    return { inputLines: [], parsedInputs: null }
  }

  const inputLines = rawInput.replace(/\r\n/g, '\n').split('\n')
  const parsedInputs: unknown[] = []
  let success = true

  for (let i = 0; i < meta.params.length; i += 1) {
    const rawLine = inputLines[i] ?? ''
    const paramType = meta.params[i]?.type ?? ''
    const parsed = parseValueWithType(rawLine, paramType)
    if (!parsed.ok) {
      success = false
    }
    parsedInputs.push(parsed.value)
  }

  return {
    inputLines,
    parsedInputs: success ? parsedInputs : null,
  }
}

function parseValueWithType(valueRaw: string, typeHint: string): { ok: boolean; value: unknown } {
  const trimmed = valueRaw.trim()
  if (!trimmed) {
    return { ok: false, value: null }
  }

  const jsonAttempt = tryParseJson(trimmed)
  if (jsonAttempt.ok) {
    return jsonAttempt
  }

  const normalizedType = normalizeType(typeHint)

  if (isNumericType(normalizedType)) {
    const num = Number(trimmed)
    if (!Number.isNaN(num)) {
      return { ok: true, value: num }
    }
  }

  if (normalizedType === 'boolean' || normalizedType === 'bool') {
    if (trimmed.toLowerCase() === 'true') {
      return { ok: true, value: true }
    }
    if (trimmed.toLowerCase() === 'false') {
      return { ok: true, value: false }
    }
  }

  if (normalizedType === 'char' || normalizedType === 'character') {
    if (trimmed.length === 1) {
      return { ok: true, value: trimmed }
    }
  }

  if (normalizedType === 'string' && trimmed.length > 0) {
    return { ok: true, value: trimmed }
  }

  return { ok: false, value: trimmed }
}

function tryParseJson(value: string): { ok: boolean; value: unknown } {
  try {
    return { ok: true, value: JSON.parse(value) }
  } catch {
    return { ok: false, value: value }
  }
}

function normalizeType(type: string): string {
  return (type || '').toLowerCase().replace(/\s+/g, '')
}

function isNumericType(type: string): boolean {
  return ['int', 'integer', 'long', 'float', 'double', 'number'].some((token) => type.startsWith(token))
}

function isSimpleType(type: string): boolean {
  const normalized = normalizeType(type)
  if (!normalized) {
    return false
  }
  if (
    ['listnode', 'treenode', 'node', 'graphnode', 'narytreenode', 'linkedlist'].some((token) =>
      normalized.includes(token),
    )
  ) {
    return false
  }
  return true
}

function buildTestHarness(options: {
  languageHint: string
  selectedLanguage: string
  meta: QuestionMeta
  functionName: string
  cases: TestCaseDatum[]
}): TestHarness | null {
  const language = pickLanguage(options.languageHint, options.selectedLanguage)

  if (!language) {
    return null
  }

  const runnableCases = options.cases.filter(
    (testCase) =>
      Array.isArray(testCase.parsedInputs) &&
      testCase.parsedInputs !== null &&
      testCase.parsedInputs.length === options.meta.params.length &&
      testCase.hasExpected,
  )

  const allTypesSimple =
    options.meta.params.every((param) => isSimpleType(param.type)) && isSimpleType(options.meta.return?.type ?? '')

  if (runnableCases.length > 0 && allTypesSimple && (language === 'typescript' || language === 'javascript')) {
    const harnessCode = createJsHarness(language, options.functionName, runnableCases)
    return {
      language,
      mode: 'runnable',
      code: harnessCode,
    }
  }

  const comment = buildCommentHarness(language, options.cases)
  return comment
    ? {
        language,
        mode: 'comment',
        code: comment,
      }
    : null
}

function pickLanguage(languageHint: string, selectedLanguage: string): string {
  const aliases: Record<string, string> = {
    ts: 'typescript',
    typescript: 'typescript',
    javascript: 'javascript',
    js: 'javascript',
  }

  const candidates = [languageHint, selectedLanguage]
    .map((value) => value || '')
    .map((value) => value.toLowerCase())
    .filter((value) => value.length > 0)

  for (const candidate of candidates) {
    if (aliases[candidate]) {
      return aliases[candidate]
    }
    return candidate
  }

  return ''
}

function createJsHarness(language: string, functionName: string, cases: TestCaseDatum[]): string {
  const serializedCases = cases
    .map((testCase) => {
      const inputs = (testCase.parsedInputs ?? []).map((value) => serializeValueForCode(value))
      const expectedLiteral = serializeValueForCode(testCase.parsedExpected)
      const inputLiteral = `[${inputs.join(', ')}]`
      return `  {
    name: ${JSON.stringify(testCase.label)},
    input: ${inputLiteral} as Parameters<typeof ${functionName}>,
    expected: ${expectedLiteral} as ReturnType<typeof ${functionName}>,
  }`
    })
    .join(',\n')

  const harnessLines = [
    '',
    'declare const require: any;',
    'declare const module: any;',
    '',
    `type TestCase = { name: string; input: Parameters<typeof ${functionName}>; expected: ReturnType<typeof ${functionName}> };`,
    'const tests: TestCase[] = [',
    serializedCases,
    '];',
    '',
    'function isDeepEqual(actual: unknown, expected: unknown): boolean {',
    '  if (Array.isArray(actual) || Array.isArray(expected)) {',
    '    return JSON.stringify(actual) === JSON.stringify(expected);',
    '  }',
    '  if (isObject(actual) || isObject(expected)) {',
    '    return JSON.stringify(actual) === JSON.stringify(expected);',
    '  }',
    "  if (typeof actual === 'number' && typeof expected === 'number') {",
    '    if (Number.isNaN(actual) && Number.isNaN(expected)) {',
    '      return true;',
    '    }',
    '  }',
    '  return actual === expected;',
    '}',
    '',
    'function isObject(value: unknown): value is Record<string, unknown> {',
    "  return typeof value === 'object' && value !== null;",
    '}',
    '',
    'function formatValue(value: unknown): string {',
    '  const json = JSON.stringify(value);',
    "  if (typeof value === 'string') {",
    '    return JSON.stringify(value);',
    '  }',
    '  return json ?? String(value);',
    '}',
    '',
    "if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {",
    '  let failures = 0;',
    '  for (const { name, input, expected } of tests) {',
    `    const actual = ${functionName}(...input);`,
    '    if (!isDeepEqual(actual, expected)) {',
    '      failures += 1;',
    '      console.error(`❌ ${name}: expected ${formatValue(expected)}, got ${formatValue(actual)}`);',
    '    } else {',
    '      console.log(`✅ ${name}`);',
    '    }',
    '  }',
    '  if (failures > 0) {',
    '    process.exitCode = 1;',
    '  }',
    '}',
  ]

  return harnessLines.join('\n')
}

function buildCommentHarness(language: string, cases: TestCaseDatum[]): string | null {
  const prefix = getCommentPrefix(language)
  if (!prefix) {
    return null
  }

  if (!cases.length) {
    return null
  }

  const lines: string[] = ['', `${prefix} Test cases`]
  cases.forEach((testCase, index) => {
    lines.push(`${prefix} ${testCase.label}:`)
    if (testCase.inputLines.length) {
      lines.push(`${prefix}   Input:`)
      testCase.inputLines.forEach((line) => {
        lines.push(`${prefix}     ${line}`)
      })
    }
    if (testCase.expectedRaw) {
      lines.push(`${prefix}   Expected: ${testCase.expectedRaw}`)
    }
    if (index !== cases.length - 1) {
      lines.push(prefix)
    }
  })

  return lines.join('\n')
}

function getCommentPrefix(language: string): string | null {
  const prefixMap: Record<string, string> = {
    ts: '//',
    typescript: '//',
    javascript: '//',
    js: '//',
    java: '//',
    cpp: '//',
    c: '//',
    csharp: '//',
    'c#': '//',
    go: '//',
    golang: '//',
    swift: '//',
    kotlin: '//',
    kt: '//',
    scala: '//',
    rust: '//',
    dart: '//',
    php: '//',
    rb: '#',
    ruby: '#',
    py: '#',
    python: '#',
    python3: '#',
  }

  return prefixMap[language] ?? null
}

function serializeValueForCode(value: unknown): string {
  if (typeof value === 'string') {
    return JSON.stringify(value)
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : JSON.stringify(value)
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }
  if (value === null) {
    return 'null'
  }
  return JSON.stringify(value)
}

function buildFallbackDescription(htmlSnippet: string): string {
  const stripped = stripHtml(htmlSnippet || '')
    .split(/\n{2,}/g)
    .slice(0, 3)
    .join('\n\n')
    .trim()
  if (stripped) {
    return `${stripped}\n\n_(Auto-generated summary. Verify with the official description.)_`
  }
  return '_(Description not auto-extracted. Paste the official statement here.)_'
}

function buildExamplesMarkdown(examples: NormalizedExample[]): string {
  if (!examples.length) {
    return '_(Examples were not auto-extracted. Fill this section manually.)_'
  }

  return examples
    .map((example, index) => {
      const heading = example.title.endsWith(':') ? example.title : `${example.title}:`
      const body = example.markdown.trim()
      return `### ${heading}\n\n${body}`
    })
    .join('\n\n')
}

function buildConstraintsMarkdown(constraints: string[]): string {
  if (!constraints.length) {
    return '- [Constraint 1]\n- [Constraint 2]\n- [Constraint 3]'
  }

  return constraints.map((constraint) => `- ${constraint}`).join('\n')
}

function buildReadmeContent(meta: ReturnType<typeof buildMeta>, sections: NormalizedSections): string {
  const examplesMarkdown = buildExamplesMarkdown(sections.examples)
  const constraintsMarkdown = buildConstraintsMarkdown(sections.constraints)

  const lines = [
    `# ${meta.frontendId}. ${meta.title}`,
    '',
    `**Difficulty:** ${meta.difficultyLabel}`,
    '',
    `**Topics:** ${meta.topicsLine}`,
    '',
    `**Link:** ${meta.url}`,
    '',
    '## Problem Description',
    '',
    sections.description,
    '',
    '## Examples',
    '',
    examplesMarkdown,
    '',
    '## Constraints',
    '',
    constraintsMarkdown,
    '',
  ]

  if (sections.followUp) {
    lines.push('## Follow-up', '', sections.followUp, '')
  }

  lines.push(
    '## Solution Approach',
    '',
    '[Describe your approach to solving the problem]',
    '',
    '**Time Complexity:** O(?)',
    '**Space Complexity:** O(?)',
    '',
    '## Notes',
    '',
    '[Optional: Any additional notes, alternative approaches, edge cases, or learnings]',
    '',
  )

  return ensureTrailingNewline(lines.join('\n'))
}

function ensureTrailingNewline(text: string): string {
  if (text.endsWith('\n')) {
    return text
  }
  return `${text}\n`
}

function extractImages(html: string): ExtractedImage[] {
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  const images: ExtractedImage[] = []
  const seenUrls = new Set<string>()

  let match: RegExpExecArray | null
  while ((match = imgRegex.exec(html)) !== null) {
    const url = match[1] ?? ''
    if (!url || seenUrls.has(url)) {
      continue
    }
    seenUrls.add(url)

    const hasher = new Bun.CryptoHasher('sha256')
    hasher.update(url)
    const hash = hasher.digest('hex')

    const extMatch = url.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/)
    const ext = extMatch ? `.${extMatch[1].toLowerCase()}` : '.png'

    images.push({ url, filename: `${hash}${ext}` })
  }

  return images
}

function replaceImagesWithMarkdown(html: string, images: ExtractedImage[]): string {
  let result = html
  for (const image of images) {
    const imgTagRegex = new RegExp(
      `<img[^>]*src=["']${image.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`,
      'gi',
    )
    result = result.replace(imgTagRegex, (tag) => {
      const altMatch = tag.match(/alt=["']([^"']*)["']/i)
      const alt = altMatch?.[1] || 'alt text'
      return `![${alt}](images/${image.filename})`
    })
  }
  return result
}

function stripHtml(html: string): string {
  return (
    html
      .replace(/<\/(p|div|section|br|li|ul|ol|pre|code|span|strong|em|table|tr|td|th)[^>]*>/gi, '\n')
      .replace(/<li[^>]*>/gi, '\n- ')
      .replace(/<br\s*\/?\s*>/gi, '\n')
      // Convert semantic inline tags before the catch-all strips them.
      // Must happen before entity decoding so that &lt; / &gt; don't produce
      // false-positive tag-like sequences that confuse <[^>]+>.
      .replace(/<sup>([\s\S]*?)<\/sup>/gi, '^$1')
      .replace(/<sub>([\s\S]*?)<\/sub>/gi, '$1')
      // Strip all remaining HTML tags.
      .replace(/<[^>]+>/g, ' ')
      // Decode HTML entities only after tags are gone so &lt; → < can never
      // be mistaken for an opening angle bracket by the tag-stripping regex above.
      .replace(/&nbsp;/gi, ' ')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&#x27;/gi, "'")
      .replace(/&#96;/gi, '`')
      .replace(/[\r\t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/ +/g, ' ')
      .replace(/\s+\n/g, '\n')
      .replace(/\n\s+/g, '\n')
      .trim()
  )
}

/**
 * Remove / convert residual HTML that an LLM conversion step may have left
 * inside an otherwise-Markdown string.
 *
 * Handles the most common inline tags LeetCode uses:
 *   <sup>  → ^N  (exponent notation)
 *   <sub>  → N   (subscript content kept, wrapper removed)
 *   <i>/<em>     → _italic_
 *   <b>/<strong> → **bold**
 *   <code>       → `code`
 *
 * HTML entities are decoded last so they cannot create false tag sequences.
 */
function cleanHtmlFromMarkdown(markdown: string): string {
  return markdown
    .replace(/<sup>([\s\S]*?)<\/sup>/gi, '^$1')
    .replace(/<sub>([\s\S]*?)<\/sub>/gi, '$1')
    .replace(/<i>([\s\S]*?)<\/i>/gi, '_$1_')
    .replace(/<em>([\s\S]*?)<\/em>/gi, '_$1_')
    .replace(/<b>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<code>([\s\S]*?)<\/code>/gi, '`$1`')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#96;/gi, '`')
    .trim()
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Error: ${message}`)
  process.exit(1)
})
