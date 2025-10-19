CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,  -- same as auth.users.id
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  capital_one_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);