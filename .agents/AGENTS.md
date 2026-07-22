# Agent Guidelines

## Database and Supabase
- **Manual SQL Execution Required**: If you ever write or create a new Supabase migration, database function (RPC), or any SQL that needs to be applied to the database, you MUST immediately notify the user. The local `npx supabase db push` command will not work automatically. You must provide the user with the SQL code or tell them which migration file to copy from, and instruct them to run it manually in the Supabase SQL Editor.
