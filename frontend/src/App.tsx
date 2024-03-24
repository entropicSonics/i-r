// import { useState } from 'react'
import "./App.css";
// import the Editor component
import Editor from "@/components/ui/Editor.tsx";
// Import the Button component
import { Button } from "@/components/ui/button";
// Import the Input component
import { Input } from "@/components/ui/input";
// Import the Drawer component
import { Drawer } from "vaul";
// Import the router
import {
  BrowserRouter as Router,
  Route,
  Link,
  useNavigate,
  Routes,
} from "react-router-dom";
// Import the Metatopic List component
import MetatopicList from "@/components/pages/MetatopicList.tsx";

import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "./lib/utils";
import { useEffect, useMemo, useState } from "react";
import NoteCollapsed from "./components/ui/NoteCollapsed";

function SearchInput(props: {
  question: string;
  setQuestion: (question: string) => void;
  triggerQuery: () => void;
}) {
  const navigate = useNavigate();

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      props.triggerQuery();
      navigate(`/search/${event.currentTarget.value}`);
    }
  };

  return (
    <Input
      className="mb-4"
      placeholder="Search for a database"
      onKeyDown={handleSearch}
      value={props.question}
      onChange={(event) => props.setQuestion(event.currentTarget.value)}
    />
  );
}

function App() {
  const [content, setContent] = useState("{}");
  const [question, setQuestion] = useState("");
  const { title, textContent } = useMemo(() => {
    const decoded = JSON.parse(content);
    if (!decoded.root) return { title: undefined, textContent: undefined };
    const title = decoded.root.children[0]?.children[0]?.text;
    const cArray: string[] = [];
    decoded.root.children[0]?.children?.forEach((a: any, index: number) => {
      if (a.type !== "text" || index === 0) return;
      if (!a.text) return;
      cArray.push(a.text);
    });
    return {
      title: title,
      textContent: cArray.length !== 0 ? cArray.join("\n") : undefined,
    };
  }, [content]);

  const saveNoteMutation = useMutation({
    mutationKey: ["saveNote"],
    mutationFn: async ({
      title,
      content,
    }: {
      title: string;
      content: string;
    }) => {
      if (title === undefined || content === undefined)
        throw new Error("Invalid note");
      const res = await supabase.functions.invoke("new-note", {
        body: { title, content },
      });

      return true;
    },
  });

  const ragQuery = useMutation({
    mutationKey: ["rag"],
    mutationFn: async (question: string) => {
      const res = await supabase.functions.invoke("query", {
        body: { question },
      });

      return res.data as { questionAnswer: string; top3Notes: any[] };
    },
  });

  function triggerQuery() {
    if (!question) return;
    ragQuery.mutate(question);
  }

  // useEffect(() => {

  // }, [question, ragQuery]);

  return (
    <>
      <div className="app-wrapper">
        <div className="editor-controls flex justify-end gap-2">
          <Button
            onClick={async () => {
              if (saveNoteMutation.isPending || !title || !textContent) return;
              await saveNoteMutation.mutateAsync({
                title: title,
                content: textContent,
              });
            }}
            className="rounded-full border-2 bg-gray-100 text-slate-900 hover:text-slate-200"
          >
            Categorize
          </Button>

          <Drawer.Root>
            <Drawer.Trigger className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90 h-10 px-4 py-2 rounded-full border-2 bg-gray-100 text-slate-900 hover:text-slate-200">
              View Notes
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/40" />
              <Drawer.Content className="bg-gray-100 flex flex-col rounded-t-[10px] h-full mt-24 max-h-[96%] fixed bottom-0 left-0 right-0">
                <div className="p-4 bg-white rounded-t-[10px] flex-1">
                  <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
                  <Router>
                    <SearchInput
                      question={question}
                      setQuestion={setQuestion}
                      triggerQuery={triggerQuery}
                    />
                    <Routes>
                      <Route path="/" element={<MetatopicList />} />
                      <Route
                        path="/search/:query"
                        element={
                          <>
                            {ragQuery.isPending && <div>Loading...</div>}
                            {ragQuery.isSuccess && (
                              <>
                                <div>{ragQuery.data.questionAnswer}</div>
                                <div>
                                  {ragQuery.data.top3Notes.map((note) => (
                                    <NoteCollapsed
                                      title={note.title}
                                      activity={note.createdAt}
                                    />
                                  ))}
                                </div>
                              </>
                            )}
                            <div></div>
                          </>
                        }
                      />
                    </Routes>
                  </Router>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
        <div className="editor-wrapper">
          <Editor setContent={setContent} />
        </div>
      </div>
    </>
  );
}

export default App;
