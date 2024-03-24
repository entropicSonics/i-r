import { z } from "https://deno.land/x/zod/mod.ts";
import { ZodError } from "https://deno.land/x/zod@v3.22.4/ZodError.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import MistralClient from "npm:@mistralai/mistralai";
import { notes, tags } from "../_shared/schema.ts";
import { drizzle } from "npm:drizzle-orm/postgres-js";
import { eq, InferSelectModel, isNull } from "npm:drizzle-orm";
import postgres from "npm:postgres";
import { uuid } from "https://esm.sh/v135/@supabase/gotrue-js@2.62.2/dist/module/lib/helpers.js";
import { corsHeaders } from "../_shared/cors.ts";
import { getCategoryLabel } from "../_shared/llm.ts";
import { ConsoleLogWriter } from "npm:drizzle-orm/logger";

if (import.meta.main) {
  const newNote = {
    id: uuid(),
    profileId: user?.id ?? null,
    title: title,
    content: content,
    contentEmbedding: embedding.data[0].embedding,

    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
  } satisfies Note;

  const category = await getCategoryLabel(
    newNote.content,
    savedCategories,
  );

  if (!savedCategories.includes(category)) {
    savedCategories.push(category);

    console.log("New category added: ", category);
  } else {
    console.log("Added to category: ", category);
  }

  await db.insert(notes).values(newNote);
}
