import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ktptppnofcjdjmymkfjn.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseKey) {
    throw new Error('SUPABASE_KEY is not set')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
