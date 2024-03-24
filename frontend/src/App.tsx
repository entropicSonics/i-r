// import { useState } from 'react'
import './App.css'
// import the Editor component
import Editor from './Editor.tsx'
import { Button } from "@/components/ui/button"
import { Drawer } from 'vaul';

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <div className = "app-wrapper">
        <div className = "editor-controls flex justify-end">
          <Drawer.Root>
            <Drawer.Trigger>
              <Button className = "rounded-full border-2 bg-gray-100 text-slate-900 hover:text-slate-200">Categorize</Button>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/40" />
              <Drawer.Content className="bg-gray-100 flex flex-col rounded-t-[10px] h-full mt-24 max-h-[96%] fixed bottom-0 left-0 right-0">
                <div className="p-4 bg-white rounded-t-[10px] flex-1">
                  <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
                  <div className="max-w-md mx-auto">
                    <Drawer.Title className="font-medium mb-4">Database</Drawer.Title>
                    <p className="text-gray-600 mb-2">
                      Boom boom info
                    </p>
                  </div>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
        <div className = "editor-wrapper">
          <Editor />
        </div>

      </div>
    </>
  )
}

export default App
