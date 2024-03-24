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
import { BrowserRouter as Router, Route, Link, useNavigate, Routes } from 'react-router-dom';
// Import the Metatopic List component
import MetatopicList from "@/components/pages/MetatopicList.tsx";

function SearchInput() {
  const navigate = useNavigate();

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      navigate(`/search/${event.currentTarget.value}`);
    }
  };

  return (
    <Input
      className="mb-4"
      placeholder="Search for a database"
      onKeyDown={handleSearch}
    />
  );

}

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <div className="app-wrapper">
        <div className="editor-controls flex justify-end">
          <Drawer.Root>
            <Drawer.Trigger>
              <Button className="rounded-full border-2 bg-gray-100 text-slate-900 hover:text-slate-200">
                Categorize
              </Button>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/40" />
              <Drawer.Content className="bg-gray-100 flex flex-col rounded-t-[10px] h-full mt-24 max-h-[96%] fixed bottom-0 left-0 right-0">
                <div className="p-4 bg-white rounded-t-[10px] flex-1">
                  <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />                    
                    <Router>
                      <SearchInput />
                      <Routes>
                        <Route path="/" element={<MetatopicList />} />
                      </Routes>
                    </Router>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
        <div className="editor-wrapper">
          <Editor />
        </div>
      </div>
    </>
  );
}

export default App;
