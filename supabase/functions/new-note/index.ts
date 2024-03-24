// console.log("Hello from Functions!");
import { z } from "https://deno.land/x/zod/mod.ts";
import { ZodError } from "https://deno.land/x/zod@v3.22.4/ZodError.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import MistralClient from "npm:@mistralai/mistralai";
import { notes, noteTags, tags } from "../_shared/schema.ts";
import { drizzle } from "npm:drizzle-orm/postgres-js";
import { and, eq, InferSelectModel, isNull } from "npm:drizzle-orm";
import postgres from "npm:postgres";
import { uuid } from "https://esm.sh/v135/@supabase/gotrue-js@2.62.2/dist/module/lib/helpers.js";
import { corsHeaders } from "../_shared/cors.ts";
import { getCategoryLabel } from "../_shared/llm.ts";
import { ConsoleLogWriter } from "npm:drizzle-orm/logger";

const databaseUrl = Deno.env.get("C_SUPABASE_DB_URL")!;
const pool = postgres(databaseUrl, { prepare: false });
const db = drizzle(pool);

type Note = InferSelectModel<typeof notes>;

const body = z.object({
  title: z.string(),
  content: z.string(),
  date: z.string().transform((v) => new Date(v)).optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { title, content, date } = body.parse(await req.json());

    const { data } = await supabaseClient.auth.getUser();
    const user = data.user;

    const client = new MistralClient(Deno.env.get("MISTRAL_API_KEY") ?? "");
    const embedding = await client.embeddings({
      model: "mistral-embed",
      input: `${title}\n${content}`,
    });

    const savedCategories = (await db.select().from(tags).where(
      user?.id ? eq(tags.profileId, user.id) : isNull(tags.profileId),
    )).map((tag) => tag.name);

    console.log("Saved categories: ", savedCategories);

    const newNote = {
      id: uuid(),
      profileId: user?.id ?? null,
      title: title,
      content: content,
      contentEmbedding: embedding.data[0].embedding,

      createdAt: date ?? new Date(),
      updatedAt: null,
      deletedAt: null,
    } satisfies Note;

    const category = await getCategoryLabel(
      newNote.content,
      savedCategories,
    );

    let tagId;

    if (!savedCategories.includes(category)) {
      savedCategories.push(category);

      console.log("New category added: ", category);

      // Save tag
      const newTag = await db.insert(tags).values({
        id: uuid(),
        profileId: user?.id ?? null,
        name: category,
        hexColor: "#" +
          (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, "0"),
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
      });

      console.log("Saved new tag: ", newTag);

      tagId = newTag.id;
    } else {
      const tag = await db.select().from(tags).where(
        and(
          user?.id ? eq(tags.profileId, user.id) : isNull(tags.profileId),
          eq(tags.name, category),
        ),
      );

      console.log("Added to category: ", tag);

      tagId = tag[0].id;
    }

    await db.insert(notes).values(newNote);

    // create noteTag
    await db.insert(noteTags).values({
      noteId: newNote.id,
      tagId: tagId,
    });

    return new Response(
      JSON.stringify({ newNote }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), {
        status: 400,
      });
    }
    console.error(error);

    return new Response("Internal Server Error", { status: 500 });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/new-note' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
