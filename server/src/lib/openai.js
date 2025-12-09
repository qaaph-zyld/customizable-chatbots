const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate chat completion
async function generateChatResponse(messages, options = {}) {
  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    maxTokens = 500,
    systemPrompt = 'You are a helpful assistant.'
  } = options;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature,
      max_tokens: maxTokens
    });

    return {
      content: completion.choices[0]?.message?.content || '',
      tokensUsed: completion.usage?.total_tokens || 0,
      model: completion.model
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

// Generate embeddings for RAG
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text.replace(/\n/g, ' ')
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('OpenAI embedding error:', error);
    throw error;
  }
}

// Analyze sentiment
async function analyzeSentiment(text) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Analyze the sentiment of the following text and respond with only one word: positive, neutral, or negative.'
        },
        { role: 'user', content: text }
      ],
      temperature: 0,
      max_tokens: 10
    });

    const sentiment = completion.choices[0]?.message?.content?.toLowerCase().trim();
    return ['positive', 'neutral', 'negative'].includes(sentiment) ? sentiment : 'neutral';
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return 'neutral';
  }
}

module.exports = {
  openai,
  generateChatResponse,
  generateEmbedding,
  analyzeSentiment
};
