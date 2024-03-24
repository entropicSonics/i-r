import MistralClient from "npm:@mistralai/mistralai";
import { notes } from "./schema.ts";

const client = new MistralClient(Deno.env.get("MISTRAL_API_KEY") || "");

// Function to generate text embeddings
export async function getTextEmbedding(text: string): Promise<number[]> {
  const embeddingResponse = await client.embeddings({
    model: "mistral-embed",
    input: [text],
  });
  return embeddingResponse.data[0].embedding;
}

// // Function to calculate Euclidean distance between two vectors
// function euclideanDistance(a: number[], b: number[]): number {
//   const squaredDiffs = a.map((x, i) => (x - b[i]) ** 2);
//   return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0));
// }

// Function to find the closest semantic match
// async function findClosestMatch(
//   query: string,
//   notes: [string, Date, string][],
// ): Promise<string[]> {
//   const queryEmbedding = await getTextEmbedding(query);
//   const distances = await Promise.all(
//     notes.map(async ([_, __, description]) => {
//       const noteEmbedding = await getTextEmbedding(description);
//       return {
//         description,
//         distance: euclideanDistance(noteEmbedding, queryEmbedding),
//       };
//     }),
//   );

//   distances.sort((a, b) => a.distance - b.distance);
//   return distances.slice(0, 3).map(({ description }) => description);
// }

// Function to answer questions using RAG based on notes
export async function answerQuestion(
  question: string,
  context: string[],
): Promise<string> {
  const prompt = `Information from my notes is below.
---------------------
${context.join("\n---------------------\n")}
---------------------
Given only my notes and not any prior knowledge, answer the query.
If you cannot answer with my notes, reply: "I'm sorry, I don't have an answer to that question."
Query: ${question}
Answer:`;

  const chatResponse = await client.chat({
    model: "mistral-medium-latest",
    messages: [
      { role: "user", content: prompt },
    ],
  });
  const answer = chatResponse.choices[0].message.content;

  if (answer.startsWith("I'm sorry")) {
    return answer;
  }

  return answer.trim();
}
