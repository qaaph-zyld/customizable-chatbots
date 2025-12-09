const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { supabaseAdmin } = require('../lib/supabase');
const { generateEmbedding } = require('../lib/openai');

// Get all documents for a chatbot
router.get('/', authenticate, async (req, res) => {
  try {
    const { chatbotId } = req.query;

    if (!chatbotId) {
      return res.status(400).json({ error: 'chatbotId is required' });
    }

    const { data, error } = await req.supabase
      .from('documents')
      .select('*')
      .eq('chatbot_id', chatbotId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single document with chunks
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data: doc, error: docError } = await req.supabase
      .from('documents')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (docError) throw docError;

    const { data: chunks, error: chunkError } = await req.supabase
      .from('document_chunks')
      .select('id, content, created_at')
      .eq('document_id', req.params.id);

    if (chunkError) throw chunkError;

    res.json({ ...doc, chunks });
  } catch (error) {
    res.status(404).json({ error: 'Document not found' });
  }
});

// Create document and process it
router.post('/', authenticate, async (req, res) => {
  try {
    const { chatbotId, name, type, content, url } = req.body;

    // Create document
    const { data: doc, error: docError } = await req.supabase
      .from('documents')
      .insert({
        chatbot_id: chatbotId,
        name,
        type,
        content,
        url,
        processed: false
      })
      .select()
      .single();

    if (docError) throw docError;

    // Process document asynchronously
    processDocument(doc.id, chatbotId, content || '').catch(console.error);

    res.status(201).json({
      ...doc,
      message: 'Document created. Processing in background.'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Process/reprocess document
router.post('/:id/process', authenticate, async (req, res) => {
  try {
    const { data: doc, error: docError } = await req.supabase
      .from('documents')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (docError) throw docError;

    // Delete existing chunks
    await supabaseAdmin
      .from('document_chunks')
      .delete()
      .eq('document_id', doc.id);

    // Reprocess
    await req.supabase
      .from('documents')
      .update({ processed: false })
      .eq('id', doc.id);

    processDocument(doc.id, doc.chatbot_id, doc.content || '').catch(console.error);

    res.json({ message: 'Document reprocessing started' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete document
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { error } = await req.supabase
      .from('documents')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Search documents (semantic search)
router.post('/search', authenticate, async (req, res) => {
  try {
    const { chatbotId, query, threshold = 0.7, limit = 5 } = req.body;

    // Generate embedding for query
    const embedding = await generateEmbedding(query);

    // Search using the match_documents function
    const { data, error } = await supabaseAdmin.rpc('match_documents', {
      query_embedding: embedding,
      match_chatbot_id: chatbotId,
      match_threshold: threshold,
      match_count: limit
    });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to process document
async function processDocument(documentId, chatbotId, content) {
  try {
    // Split content into chunks (simple paragraph-based splitting)
    const chunks = splitIntoChunks(content, 500);

    // Generate embeddings and save chunks
    for (const chunkContent of chunks) {
      if (!chunkContent.trim()) continue;

      const embedding = await generateEmbedding(chunkContent);

      await supabaseAdmin.from('document_chunks').insert({
        document_id: documentId,
        chatbot_id: chatbotId,
        content: chunkContent,
        embedding
      });
    }

    // Mark document as processed
    await supabaseAdmin
      .from('documents')
      .update({ processed: true })
      .eq('id', documentId);

    console.log(`Document ${documentId} processed successfully`);
  } catch (error) {
    console.error(`Document ${documentId} processing failed:`, error);
  }
}

// Helper function to split content into chunks
function splitIntoChunks(text, maxLength = 500) {
  const paragraphs = text.split(/\n\n+/);
  const chunks = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > maxLength && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  // Handle chunks that are still too long
  const finalChunks = [];
  for (const chunk of chunks) {
    if (chunk.length > maxLength * 2) {
      // Split by sentences
      const sentences = chunk.match(/[^.!?]+[.!?]+/g) || [chunk];
      let tempChunk = '';
      for (const sentence of sentences) {
        if ((tempChunk + sentence).length > maxLength && tempChunk) {
          finalChunks.push(tempChunk.trim());
          tempChunk = sentence;
        } else {
          tempChunk += sentence;
        }
      }
      if (tempChunk.trim()) finalChunks.push(tempChunk.trim());
    } else {
      finalChunks.push(chunk);
    }
  }

  return finalChunks;
}

module.exports = router;
