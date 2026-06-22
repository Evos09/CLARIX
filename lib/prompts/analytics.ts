export function analyticsPrompt(transcript: string, durationSeconds: number): string {
  return `You are a meeting analytics expert. Analyze this meeting transcript in detail.
Meeting duration: ${durationSeconds} seconds.

Return ONLY a JSON object with this exact structure (no markdown, no preamble):
{
  "overallEngagement": 0-100,
  "participationBalance": 0-100,
  "questionRate": number,
  "decisionRate": number,
  "actionRate": number,
  "overallSentiment": "POSITIVE|NEUTRAL|MIXED|TENSE",
  "sentimentByMinute": [{"minute": N, "sentiment": "POSITIVE|NEUTRAL|TENSE", "score": 0.0-1.0}],
  "speakerStats": [{"speaker": "A", "talkPercent": N, "wordCount": N, "fillerWords": N, "longestMonologueSeconds": N, "questionsAsked": N}],
  "fillerWordDetails": [{"word": "um", "count": N, "speaker": "A"}],
  "topicTimeline": [{"topic": "string", "startMinute": N, "endMinute": N, "sentiment": "POSITIVE|NEUTRAL|TENSE"}],
  "energyTimeline": [{"minute": N, "energy": 0-100}],
  "insights": ["Insight 1", "Insight 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}

Transcript:
${transcript.slice(0, 16000)}`;
}
