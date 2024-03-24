import MistralClient from "npm:@mistralai/mistralai";
import calendarJSON from "./calendar.json" with { type: "json" };

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
  const prompt = `Given the following categories: ${
    existingLabels.join(", ")
  }, what category does the following text belong to? You can invent new categories but they should be specific to the topic but generic to the text. Use the reply key 'category'`;

  // console.log("Prompt: ", prompt);

  const response = await client.chat({
    messages: [
      {
        role: "system",
        content:
          // make the llm return the category biased toward exsiting categories but able to create new ones
          prompt,
      },
      { role: "user", content: text },
    ],
    model: "mistral-large-latest",
    responseFormat: { "type": "json_object" },
  });

  const reply = response.choices[0].message.content;

  // console.log("Reply: ", reply);

  const category = JSON.parse(reply).category;

  // console.log("Category: ", category);

  return category.split().map((word: string) =>
    word[0].toUpperCase() + word.slice(1)
  ).join(" ");
}

if (import.meta.main) {
  const savedCategories = [];
  const notes = [];

  console.log("Events: ", calendarJSON);

  const events = calendarJSON.events;

  for (const event of events) {
    // get stdin
    const newNote = event[2];

    if (!newNote) {
      break;
    }

    const category = await getCategoryLabel(
      newNote,
      savedCategories,
    );

    if (!savedCategories.includes(category)) {
      savedCategories.push(category);

      console.log("New category added: ", category);
    } else {
      console.log("Added to category: ", category);
    }

    notes.push({
      note: newNote,
      category,
      date: new Date(),
    });

    // Pretty print notes by category
    console.log("==========\nNotes:\n==========");

    savedCategories.forEach((category) => {
      console.log(`Category: ${category}`);
      notes
        .filter((note) => note.category === category)
        .forEach((note) => {
          console.log(`- ${note.note}`);
        });
    });
  }
}
