CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.ios_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT NOT NULL,
    documents JSONB,
    language_from TEXT NOT NULL,
    language_to TEXT NOT NULL,
    service_type TEXT NOT NULL,
    page_count INTEGER,
    price_per_page DECIMAL,
    total_amount DECIMAL NOT NULL,
    stripe_payment_intent_id TEXT,
    order_status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.ios_orders IS 'Stores information about orders made through the iOS app.';
COMMENT ON COLUMN public.ios_orders.id IS 'Unique identifier for the order.';
COMMENT ON COLUMN public.ios_orders.user_id IS 'Foreign key referencing the user who placed the order.';
COMMENT ON COLUMN public.ios_orders.user_email IS 'Email of the user who placed the order.';
COMMENT ON COLUMN public.ios_orders.documents IS 'Array of document URLs from Supabase Storage.';
COMMENT ON COLUMN public.ios_orders.language_from IS 'Original language of the documents.';
COMMENT ON COLUMN public.ios_orders.language_to IS 'Target language for translation/evaluation.';
COMMENT ON COLUMN public.ios_orders.service_type IS 'Type of service requested (e.g., ''Certified Translation'', ''Diploma Evaluation'').';
COMMENT ON COLUMN public.ios_orders.page_count IS 'Number of pages to be processed (if applicable).';
COMMENT ON COLUMN public.ios_orders.price_per_page IS 'Price per page for the service (if applicable).';
COMMENT ON COLUMN public.ios_orders.total_amount IS 'Total amount charged for the order.';
COMMENT ON COLUMN public.ios_orders.stripe_payment_intent_id IS 'Stripe Payment Intent ID for the transaction.';
COMMENT ON COLUMN public.ios_orders.order_status IS 'Current status of the order (e.g., ''Pending'', ''Processing'', ''Completed'', ''Cancelled'').';
COMMENT ON COLUMN public.ios_orders.created_at IS 'Timestamp of when the order was created.';
COMMENT ON COLUMN public.ios_orders.updated_at IS 'Timestamp of when the order was last updated.';
