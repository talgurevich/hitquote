'use client';

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ליצור קליינט רק בדפדפן ורק אם יש ENV
export const supabase = (typeof window !== 'undefined' && url && anon)
  ? createClient(url, anon)
  : null;
