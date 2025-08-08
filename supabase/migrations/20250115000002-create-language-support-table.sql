-- Create language_support table
CREATE TABLE IF NOT EXISTS public.language_support (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    language TEXT NOT NULL DEFAULT 'de',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.language_support IS 'User language preferences for the application';
COMMENT ON COLUMN public.language_support.email IS 'User email address';
COMMENT ON COLUMN public.language_support.language IS 'User preferred language (de, en)';
COMMENT ON COLUMN public.language_support.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN public.language_support.updated_at IS 'Timestamp when the record was last updated';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_language_support_email ON public.language_support (email);
CREATE INDEX IF NOT EXISTS idx_language_support_language ON public.language_support (language);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.language_support ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own language preference
CREATE POLICY "Users can read their own language preference" ON public.language_support
    FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Policy to allow users to insert their own language preference
CREATE POLICY "Users can insert their own language preference" ON public.language_support
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = email);

-- Policy to allow users to update their own language preference
CREATE POLICY "Users can update their own language preference" ON public.language_support
    FOR UPDATE USING (auth.jwt() ->> 'email' = email);

-- Policy to allow users to delete their own language preference
CREATE POLICY "Users can delete their own language preference" ON public.language_support
    FOR DELETE USING (auth.jwt() ->> 'email' = email);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_language_support_updated_at 
    BEFORE UPDATE ON public.language_support 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 