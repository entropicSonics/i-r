// import { useState } from 'react'
import './App.css'
// import the Editor component
import Editor from './Editor.tsx'
import { Button } from "@/components/ui/button"

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <div className = "app-wrapper">
          <div className = "editor-controls flex justify-end">
            <Button className = "rounded-full border-2 bg-gray-100 text-slate-900 hover:text-slate-200">Categorize</Button>
          </div>
          <div className = "editor-wrapper">
            <Editor />
          </div>
        </div>
    </>
  )
}

export default App
