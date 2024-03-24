// console.log("Hello from Functions!");
import { z } from "https://deno.land/x/zod/mod.ts";
import { ZodError } from "https://deno.land/x/zod@v3.22.4/ZodError.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import MistralClient from "npm:@mistralai/mistralai";
import { notes } from "../_shared/schema.ts";
import { drizzle } from "npm:drizzle-orm/postgres-js";
import { InferSelectModel } from "npm:drizzle-orm";
import postgres from "npm:postgres";
import { uuid } from "https://esm.sh/v135/@supabase/gotrue-js@2.62.2/dist/module/lib/helpers.js";
import { corsHeaders } from "../_shared/cors.ts";

const databaseUrl = Deno.env.get("SUPABASE_DB_URL")!;
const pool = postgres(databaseUrl);
const db = drizzle(pool);

type Note = InferSelectModel<typeof notes>;

const body = z.object({
  title: z.string(),
  content: z.string(),
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

    const { title, content } = body.parse(await req.json());

    const { data } = await supabaseClient.auth.getUser();
    const user = data.user;

    const client = new MistralClient(Deno.env.get("MISTRAL_API_KEY") ?? "");
    const embedding = await client.embeddings({
      model: "mistral-embed",
      input: `${title}\n${content}`,
    });
    // const chatResponse = await client.chat({
    //   model: "mistral-small",
    //   messages: [
    //     {
    //       role: "system",
    //       content:
    //         "Your task is to return a one sentence summary of the note the user provides.",
    //     },
    //     {
    //       role: "user",
    //       content: note,
    //     },
    //   ],
    // });

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

    await db.insert(notes).values(newNote);

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
