const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')

const LOG_DIR = path.join(__dirname, '..', 'ai-logs')
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true })

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  if (!apiKey) return null

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          maxOutputTokens: 400,
        },
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Gemini HTTP error:', res.status, errText)
      return null
    }

    const data = await res.json()
    const parts = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts
    if (parts && parts.length) {
      return parts
        .map((p) => (p && p.text ? p.text : ''))
        .join('\n')
        .trim()
    }
    return null
  } catch (err) {
    console.error('Gemini call failed', err)
    return null
  }
}

function normalizeTone(tone) {
  const value = String(tone || '').trim()
  if (['Funny', 'Flirty', 'Confident', 'Direct'].includes(value)) return value
  return 'Flirty'
}

function sanitizeReply(reply) {
  if (!reply) return ''

  let cleaned = String(reply).trim()
  cleaned = cleaned.replace(/^[-*•]\s*/, '')
  cleaned = cleaned.replace(/^\d+[.)\-:]\s*/, '')
  cleaned = cleaned.replace(/^['"`]+|['"`]+$/g, '').trim()

  // Remove common conversation-echo fragments like "- Her: ..." or "- You: ..."
  cleaned = cleaned.replace(/\s*[\-—]\s*(her|him|them|you|me)\s*:\s*.*$/i, '').trim()
  cleaned = cleaned.replace(/^(her|him|them|you|me)\s*:\s*/i, '').trim()

  return cleaned
}

function isTooGeneric(line) {
  const lowered = String(line || '').toLowerCase()
  const blocked = [
    'i like your vibe',
    'you seem interesting',
    'keep going',
    'you have good energy',
    'you have my attention',
  ]
  return blocked.some((phrase) => lowered.includes(phrase))
}

function parseModelReplies(raw) {
  const lines = String(raw || '')
    .split('\n')
    .map((line) => sanitizeReply(line))
    .filter((line) => Boolean(line) && !isTooGeneric(line))

  const unique = []
  const seen = new Set()
  for (const line of lines) {
    const key = line.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(line)
    }
  }

  return unique.slice(0, 5)
}

function buildReplyPrompt(conversation, tone) {
  return [
    'You are writing HIGH-QUALITY, context-aware dating replies.',
    '',
    'GOAL:',
    'Every reply must feel like a natural, specific response to what the other person JUST said.',
    '',
    'CRITICAL RULES:',
    'DO NOT repeat the conversation',
    'Keep replies short (1 line preferred)',
    'MUST directly react to the LAST message or key word (e.g., "rare")',
    'If the reply could fit any conversation, it is WRONG → rewrite it',
    'Avoid generic lines like:',
    '  "you seem fun"',
    '  "I like your vibe"',
    '  "keep going"',
    '  "you are interesting"',
    '',
    'STYLE:',
    'Use the meaning of the last message',
    'Add light teasing, confidence, or intrigue',
    'Make it feel like a real human response',
    '',
    'VARIETY REQUIREMENT:',
    'Generate 5 replies, each different:',
    '1. playful tease',
    '2. confident response',
    '3. curiosity-based',
    '4. slightly bold',
    '5. smooth/charming',
    '',
    'QUALITY FILTER (VERY IMPORTANT):',
    'Before output:',
    'Check each reply:',
    '  Would a real person actually send this?',
    '  Does it connect to the conversation?',
    'If not → improve it',
    '',
    'TONE:',
    'Funny → witty',
    'Flirty → teasing + charm',
    'Confident → calm + strong',
    'Direct → minimal + clear',
    '',
    `SELECTED TONE: ${tone}`,
    '',
    'OUTPUT:',
    'Only 5 replies, no labels, no numbering',
    '',
    'CONVERSATION:',
    conversation,
  ].join('\n')
}

function contextTag(conversation) {
  const text = String(conversation || '').toLowerCase()
  const hasMusic = /music|song|playlist|spotify|album|artist/.test(text)
  const hasDrives = /drive|road|night drive|late night|car/.test(text)

  if (hasMusic && hasDrives) return 'music-and-drives'
  if (hasMusic) return 'music'
  if (hasDrives) return 'drives'
  return 'general'
}

function mockGenerateReplies(conversation, tone) {
  const normalizedTone = normalizeTone(tone)
  const tag = contextTag(conversation)

  // 5-style structure: [playful tease, confident line, curious question, slightly bold, smooth/charming]
  const templates = {
    'music-and-drives': {
      Funny: [
        'So are we talking cinematic midnight drives or you just making excuses to avoid questions?',
        'If your playlist has range, we might actually vibe.',
        'What is your "guilty pleasure song" that ruins the whole mood?',
        'Plot twist: we argue over one song and it becomes a thing.',
        'Late-night drives sound like the move if you don\'t skip mid-song.',
      ],
      Flirty: [
        'I am guessing you are the type to pretend not to sing, then steal the chorus?',
        'If your playlist is that good, we need to test it on a night drive.',
        'Top 3 songs so I can judge your passenger-seat vibe?',
        'This is giving windows-down and a little trouble.',
        'You handle the route, I\'ll bring the songs and chaotic energy.',
      ],
      Confident: [
        'So you pick the songs and I pick the route—deal?',
        'Cool. Night drive this week, you pick the day.',
        'What day works to lock this in?',
        'Let us skip the small talk and make this real.',
        'Simple: good music, good company, Friday night.',
      ],
      Direct: [
        'Bet. What is your top 3 songs?',
        'Friday or Saturday night?',
        'You on music, me on route?',
        'Let us meet this week.',
        'Pick the day and song.',
      ],
    },
    music: {
      Funny: [
        'Are we talking chill vibes or dramatic main-character anthem energy?',
        'If your taste is solid, I might respect you.',
        'Do you skip songs fast or let them breathe? This matters.',
        'One good track rec and I am already impressed.',
        'Send me your most unpopular opinion song.',
      ],
      Flirty: [
        'You have good taste? Prove it with one song.',
        'I can already tell your playlist is dangerously good.',
        'What song would you send me at 1 AM?',
        'Your vibe tells me your music taste hits different.',
        'Send your most underrated track and I will know everything.',
      ],
      Confident: [
        'Trade top songs and let us move forward?',
        'Let us settle this: send your best track.',
        'Good music taste is non-negotiable. What is your pick?',
        'Send me one song you never skip.',
        'Music first, then we plan the rest.',
      ],
      Direct: [
        'Top track right now?',
        'What is your go-to song?',
        'One song rec?',
        'Best track you have?',
        'Music taste check.',
      ],
    },
    drives: {
      Funny: [
        'Late-night drives are either therapy or you getting lost on purpose?',
        'If you actually know where you are going, I respect it.',
        'Do you blast music or drive in silence like a psychopath?',
        'Are snacks involved or is this a raw vibe?',
        'If you miss a turn for the moment, I get it.',
      ],
      Flirty: [
        'Late-night drives with the right person hits different, right?',
        'Sounds like you are the type to steal the aux and act innocent.',
        'Windows down, city lights, and you—that is the vibe I am after.',
        'I can already tell your drive playlist is secretly elite.',
        'Your route sounds as smooth as your chat.',
      ],
      Confident: [
        'Alright, let us do a late-night drive soon.',
        'You pick the time, I will be ready.',
        'This is simple—night drive this week?',
        'I am in. Route and timing?',
        'Let us lock a day.',
      ],
      Direct: [
        'Night drive this week?',
        'What day works?',
        'You pick the time.',
        'Friday or Saturday?',
        'Route and when?',
      ],
    },
    general: {
      Funny: [
        'That was smooth, but are you always this bold or is this special?',
        'Either you are charming or very committed to the bit.',
        'Okay, you got a real laugh out of me—what is round two?',
        'I respect this energy, cautiously.',
        'If this is your opener, I am curious.',
      ],
      Flirty: [
        'You are making this way too easy to say yes to meeting you.',
        'What is your next move, smooth talker?',
        'Keep that confidence when we meet in person.',
        'You are actually kinda fun.',
        'I see where you are going with this. Continue.',
      ],
      Confident: [
        'Good. Let us turn this into an actual plan.',
        'I am in. Pick a day this week.',
        'Works for me. Time and place?',
        'Let us keep the momentum going.',
        'Simple. Let us meet.',
      ],
      Direct: [
        'Want to meet this week?',
        'What day works?',
        'Coffee or drinks?',
        'Set a time.',
        'I am free this weekend.',
      ],
    },
  }

  return (templates[tag] && templates[tag][normalizedTone]) || templates.general[normalizedTone] || templates.general.Direct
}

function appendLog(filename, content) {
  try {
    const file = path.join(LOG_DIR, filename)
    fs.appendFileSync(file, content + '\n---\n')
  } catch (err) {
    console.error('Failed to write log', err)
  }
}

exports.generateReplies = async (req, res) => {
  const { conversation = '', tone = 'Funny', type = 'replies', bio = '' } = req.body || {}
  if (!conversation && type === 'replies') return res.status(400).json({ error: 'conversation is required' })

  const prompt = buildReplyPrompt(conversation, normalizeTone(tone))
  appendLog('generate_prompts.txt', `PROMPT:\n${prompt}`)

  if (process.env.GEMINI_API_KEY) {
    const out = await callGemini(prompt)
    if (out) {
      appendLog('generate_responses.txt', `RESPONSE:\n${out}`)
      const items = parseModelReplies(out)
      if (items.length >= 3) return res.json({ replies: items.slice(0, 5) })
    }
  }

  const replies = mockGenerateReplies(conversation || bio, tone).slice(0, 5)
  appendLog('generate_responses.txt', `MOCK_RESPONSE:\n${replies.join('\n')}`)
  res.json({ replies })
}

exports.generateOpener = async (req, res) => {
  const { bio = '', style = 'Funny' } = req.body || {}
  if (!bio) return res.status(400).json({ error: 'bio is required' })
  const prompt = `Generate 3 short openers in ${style} style based on this bio: ${bio}`
  appendLog('generate_prompts.txt', `PROMPT_OPENER:\n${prompt}`)

  if (process.env.GEMINI_API_KEY) {
    const out = await callGemini(prompt)
    if (out) {
      appendLog('generate_responses.txt', `RESPONSE_OPENER:\n${out}`)
      const items = out.split('\n').map((s) => s.trim()).filter(Boolean)
      if (items.length) return res.json({ openers: items.slice(0, 5) })
    }
  }

  const openers = [
    `Hey — your profile made me laugh. Coffee sometime?`,
    `I can’t resist a good bio like yours. Drinks?`,
    `Noticed we both like good food — favorite spot?`,
  ]
  appendLog('generate_responses.txt', `MOCK_OPENER:\n${openers.join('\n')}`)
  res.json({ openers })
}
