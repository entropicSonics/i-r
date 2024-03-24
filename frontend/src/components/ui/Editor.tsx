import React from "react";

// import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";

interface Props {}

const theme = {};

function onError(error: Error): void {
  console.error(error);
}

const Editor: React.FC<Props> = () => {
  // Component logic goes here
  const initialConfig = {
    namespace: "editor",
    theme,
    onError,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <PlainTextPlugin
        contentEditable={<ContentEditable className="editor" />}
        placeholder={
          <div
            className="editor-placeholder text-gray-400"
            style={{ pointerEvents: "none" }}
          >
            Start typing...
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
    </LexicalComposer>
  );
};

export default Editor;
