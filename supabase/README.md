# Supabase Integration for Timesets

This directory contains migration scripts and helper files for integrating Supabase as a database backend for the timer app.

## Migration Scripts

The migration scripts are located in the `migrations` directory:

- `20240101000000_create_timesets_table.sql`: Creates the timesets table and sets up Row Level Security (RLS) policies
- `20240101000000_create_timesets_table_rollback.sql`: Rollback script to undo the changes

## How to Apply Migrations

### Option 1: Using Supabase CLI

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Apply the migrations:
   ```bash
   supabase db push
   ```

### Option 2: Using the Supabase Dashboard

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of the migration script
3. Paste it into the SQL Editor
4. Click "Run" to execute the script

## TypeScript Integration

The helper files in `src/lib/supabase` provide TypeScript types and functions for interacting with the timesets table:

- `database.types.ts`: TypeScript types for the database schema
- `timesets.ts`: Functions for CRUD operations on timesets

## Environment Variables

Make sure to set the following environment variables in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Migrating from Local Storage

To migrate from local storage to Supabase:

1. Apply the migration scripts to create the timesets table
2. Install the Supabase client:
   ```bash
   npm install @supabase/supabase-js
   ```
3. Import the helper functions from `src/lib/supabase/timesets.ts`
4. Replace local storage operations with the corresponding Supabase functions
5. Add authentication if needed

Example of migrating from local storage to Supabase:

```typescript
// Before (using local storage)
const saveTimesets = (timesets) => {
  localStorage.setItem('timesets', JSON.stringify(timesets));
};

const loadTimesets = () => {
  return JSON.parse(localStorage.getItem('timesets') || '[]');
};

// After (using Supabase)
import { getTimesets, createTimeset, updateTimeset, deleteTimeset } from '@/lib/supabase/timesets';

// Load timesets
const loadTimesets = async () => {
  try {
    return await getTimesets();
  } catch (error) {
    console.error('Failed to load timesets:', error);
    return [];
  }
};

// Save a new timeset
const saveTimeset = async (timeset) => {
  try {
    return await createTimeset(timeset);
  } catch (error) {
    console.error('Failed to save timeset:', error);
    throw error;
  }
};
``` 