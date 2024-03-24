/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import{useLexicalComposerContext as e}from"@lexical/react/LexicalComposerContext";import{CLEAR_EDITOR_COMMAND as o,$getRoot as t,$getSelection as n,$createParagraphNode as r,COMMAND_PRIORITY_EDITOR as l}from"lexical";import{useLayoutEffect as i,useEffect as a}from"react";var c="undefined"!=typeof window&&void 0!==window.document&&void 0!==window.document.createElement?i:a;function d({onClear:i}){const[a]=e();return c((()=>a.registerCommand(o,(e=>(a.update((()=>{if(null==i){const e=t(),o=n(),l=r();e.clear(),e.append(l),null!==o&&l.select()}else i()})),!0)),l)),[a,i]),null}export{d as ClearEditorPlugin};
