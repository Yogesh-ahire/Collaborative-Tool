import { create } from "zustand";
import { type Editor } from "@tiptap/react";

interface EditoreState {
    editor: Editor | null;
    setEditor: (editor: Editor | null) => void;
};

export const useEditorStore = create<EditoreState>((set) => ({
    editor: null,
    setEditor: (editor) => set({ editor }),
}));