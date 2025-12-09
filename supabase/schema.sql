-- Customizable Chatbots Platform - Supabase Schema
-- Run this in your Supabase SQL editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    company_name TEXT,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chatbots table
CREATE TABLE public.chatbots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    template_id UUID,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    settings JSONB DEFAULT '{
        "welcomeMessage": "Hello! How can I help you today?",
        "fallbackMessage": "I''m not sure I understand. Could you rephrase that?",
        "language": "en",
        "aiModel": "gpt-4o-mini",
        "temperature": 0.7,
        "maxTokens": 500
    }'::jsonb,
    system_prompt TEXT DEFAULT 'You are a helpful assistant.',
    widget_config JSONB DEFAULT '{
        "primaryColor": "#6366f1",
        "position": "bottom-right",
        "greeting": "Hi there! 👋"
    }'::jsonb,
    allowed_domains TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates table
CREATE TABLE public.templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'support', 'sales', 'faq', 'onboarding')),
    system_prompt TEXT,
    intents TEXT[] DEFAULT '{}',
    sample_responses JSONB DEFAULT '[]'::jsonb,
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chatbot_id UUID REFERENCES public.chatbots(id) ON DELETE CASCADE NOT NULL,
    session_id TEXT NOT NULL,
    visitor_id TEXT,
    channel TEXT DEFAULT 'web' CHECK (channel IN ('web', 'whatsapp', 'slack', 'messenger', 'sms', 'api')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated', 'abandoned')),
    metadata JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge base documents
CREATE TABLE public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chatbot_id UUID REFERENCES public.chatbots(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('text', 'pdf', 'url', 'markdown')),
    content TEXT,
    url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document chunks with vector embeddings for RAG
CREATE TABLE public.document_chunks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    chatbot_id UUID REFERENCES public.chatbots(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI ada-002 dimensions
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhooks configuration
CREATE TABLE public.webhooks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    chatbot_id UUID REFERENCES public.chatbots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    secret TEXT,
    events TEXT[] DEFAULT '{}'::text[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook logs
CREATE TABLE public.webhook_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    webhook_id UUID REFERENCES public.webhooks(id) ON DELETE CASCADE NOT NULL,
    event TEXT NOT NULL,
    payload JSONB,
    response_status INTEGER,
    response_body TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integrations (Slack, etc.)
CREATE TABLE public.integrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    chatbot_id UUID REFERENCES public.chatbots(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('slack', 'whatsapp', 'messenger', 'twilio', 'zapier')),
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys for external access
CREATE TABLE public.api_keys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL, -- First 8 chars for display
    permissions TEXT[] DEFAULT '{read}'::text[],
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events
CREATE TABLE public.analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chatbot_id UUID REFERENCES public.chatbots(id) ON DELETE CASCADE NOT NULL,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_chatbots_user_id ON public.chatbots(user_id);
CREATE INDEX idx_conversations_chatbot_id ON public.conversations(chatbot_id);
CREATE INDEX idx_conversations_session_id ON public.conversations(session_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_documents_chatbot_id ON public.documents(chatbot_id);
CREATE INDEX idx_document_chunks_chatbot_id ON public.document_chunks(chatbot_id);
CREATE INDEX idx_analytics_events_chatbot_id ON public.analytics_events(chatbot_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);

-- Vector similarity search index
CREATE INDEX idx_document_chunks_embedding ON public.document_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Chatbots: users can only access their own chatbots
CREATE POLICY "Users can view own chatbots" ON public.chatbots
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create chatbots" ON public.chatbots
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chatbots" ON public.chatbots
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chatbots" ON public.chatbots
    FOR DELETE USING (auth.uid() = user_id);

-- Templates: users can view public templates or their own
CREATE POLICY "Users can view templates" ON public.templates
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can create templates" ON public.templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON public.templates
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON public.templates
    FOR DELETE USING (auth.uid() = user_id);

-- Conversations: users can access conversations for their chatbots
CREATE POLICY "Users can view conversations" ON public.conversations
    FOR SELECT USING (
        chatbot_id IN (SELECT id FROM public.chatbots WHERE user_id = auth.uid())
    );
CREATE POLICY "Anyone can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update conversations" ON public.conversations
    FOR UPDATE USING (
        chatbot_id IN (SELECT id FROM public.chatbots WHERE user_id = auth.uid())
    );

-- Messages: follow conversation access
CREATE POLICY "Users can view messages" ON public.messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT c.id FROM public.conversations c
            JOIN public.chatbots cb ON c.chatbot_id = cb.id
            WHERE cb.user_id = auth.uid()
        )
    );
CREATE POLICY "Anyone can create messages" ON public.messages
    FOR INSERT WITH CHECK (true);

-- Documents: users can access documents for their chatbots
CREATE POLICY "Users can view documents" ON public.documents
    FOR SELECT USING (
        chatbot_id IN (SELECT id FROM public.chatbots WHERE user_id = auth.uid())
    );
CREATE POLICY "Users can create documents" ON public.documents
    FOR INSERT WITH CHECK (
        chatbot_id IN (SELECT id FROM public.chatbots WHERE user_id = auth.uid())
    );
CREATE POLICY "Users can update documents" ON public.documents
    FOR UPDATE USING (
        chatbot_id IN (SELECT id FROM public.chatbots WHERE user_id = auth.uid())
    );
CREATE POLICY "Users can delete documents" ON public.documents
    FOR DELETE USING (
        chatbot_id IN (SELECT id FROM public.chatbots WHERE user_id = auth.uid())
    );

-- Document chunks: follow document access
CREATE POLICY "Users can view document chunks" ON public.document_chunks
    FOR SELECT USING (
        chatbot_id IN (SELECT id FROM public.chatbots WHERE user_id = auth.uid())
    );
CREATE POLICY "Users can create document chunks" ON public.document_chunks
    FOR INSERT WITH CHECK (
        chatbot_id IN (SELECT id FROM public.chatbots WHERE user_id = auth.uid())
    );
CREATE POLICY "Users can delete document chunks" ON public.document_chunks
    FOR DELETE USING (
        chatbot_id IN (SELECT id FROM public.chatbots WHERE user_id = auth.uid())
    );

-- Webhooks: users can only access their own
CREATE POLICY "Users can view own webhooks" ON public.webhooks
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create webhooks" ON public.webhooks
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own webhooks" ON public.webhooks
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own webhooks" ON public.webhooks
    FOR DELETE USING (auth.uid() = user_id);

-- Webhook logs: follow webhook access
CREATE POLICY "Users can view webhook logs" ON public.webhook_logs
    FOR SELECT USING (
        webhook_id IN (SELECT id FROM public.webhooks WHERE user_id = auth.uid())
    );

-- Integrations: users can only access their own
CREATE POLICY "Users can view own integrations" ON public.integrations
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create integrations" ON public.integrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own integrations" ON public.integrations
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own integrations" ON public.integrations
    FOR DELETE USING (auth.uid() = user_id);

-- API Keys: users can only access their own
CREATE POLICY "Users can view own api keys" ON public.api_keys
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create api keys" ON public.api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own api keys" ON public.api_keys
    FOR DELETE USING (auth.uid() = user_id);

-- Analytics events: users can view events for their chatbots
CREATE POLICY "Users can view analytics" ON public.analytics_events
    FOR SELECT USING (
        chatbot_id IN (SELECT id FROM public.chatbots WHERE user_id = auth.uid())
    );
CREATE POLICY "System can create analytics" ON public.analytics_events
    FOR INSERT WITH CHECK (true);

-- Functions

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function for vector similarity search
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(1536),
    match_chatbot_id uuid,
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id uuid,
    content text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        document_chunks.id,
        document_chunks.content,
        1 - (document_chunks.embedding <=> query_embedding) as similarity
    FROM document_chunks
    WHERE document_chunks.chatbot_id = match_chatbot_id
        AND 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
    ORDER BY document_chunks.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chatbots_updated_at BEFORE UPDATE ON public.chatbots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON public.webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
