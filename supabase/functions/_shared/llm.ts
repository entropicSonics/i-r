import MistralClient from "npm:@mistralai/mistralai";
import type { ResponseFormats } from "npm:@mistralai/mistralai";

const client = new MistralClient("TWfVrlX659GSTS9hcsgUcPZ8uNzfoQsg");

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
    model: "mistral-small-latest",
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

export async function getCategoryLabel(
  text: string,
  existingLabels: string[],
): Promise<string> {
  const response = await client.chat({
    messages: [
      {
        role: "system",
        content:
          "Please return just the `category` key of the following categories: " +
          existingLabels.join(", ") +
          ". If the text does not match any of the categories, return a new, hyper-specific 2-3 word category name",
      },
      { role: "user", content: text },
    ],
    model: "mistral-large-latest",
    responseFormat: { "type": "json_object" },
  });

  const category = JSON.parse(response.choices[0].message.content).category;

  return category.split().map((word: string) =>
    word[0].toUpperCase() + word.slice(1)
  ).join(" ");
}

if (import.meta.main) {
  const savedCategories = ["school", "work", "personal"];

  const category = await getCategoryLabel(
    "Brahman: This is the ultimate reality or absolute truth. It's impersonal, transcendent, and immanent. It's the cause and essence of the universe, being itself uncaused.",
    savedCategories,
  );

  if (!savedCategories.includes(category)) {
    savedCategories.push(category);
  }

  console.log(category);
}
