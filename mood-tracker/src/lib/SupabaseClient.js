import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cbhkhdldkopnzaawdbag.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiaGtoZGxka29wbnphYXdkYmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyODQ2OTAsImV4cCI6MjA2MDg2MDY5MH0._mtTxFvbsPNpo76mqq03zpwsAnahvqFHXCPfZMaitGY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
