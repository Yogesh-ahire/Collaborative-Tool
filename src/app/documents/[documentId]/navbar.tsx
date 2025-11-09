"use client"
import Link from "next/link";
import Image from "next/image";
import {
    BoldIcon,
    FileIcon,
    FileJsonIcon,
    FilePenIcon,
    FilePlusIcon,
    FileTextIcon,
    GlobeIcon,
    ItalicIcon,
    PrinterIcon,
    Redo2Icon,
    RemoveFormattingIcon,
    StrikethroughIcon,
    TableIcon,
    TextIcon,
    TrashIcon,
    UnderlineIcon,
    Undo2Icon
} from "lucide-react";
import { BsFilePdf } from "react-icons/bs";

import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from "@/components/ui/menubar";

import { DocumentInput } from "./document-input";
import { useState } from "react";
import { useEditorStore } from "@/store/use-editor-store";


export const Navbar = () => {

    const { editor } = useEditorStore();

    /*table insert fuctinalities */
    const [rows, setRows] = useState(0);
    const [cols, setCols] = useState(0);

    const insertTable = ({rows, cols}: {rows: number, cols: number}) =>{
        editor
        ?.chain()
        .focus()
        .insertTable({ rows, cols, withHeaderRow: false})
        .run()
    };

    const handleInsertTable = (r: number, c: number) => {
        insertTable({rows:r, cols:c});
    };

    const onDownload = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
    };

    const onSaveJSON = () =>{
        if(!editor) return;

        const content = editor.getJSON();
        const blob = new Blob([JSON.stringify(content)], {
            type: "application/json",
        });
        onDownload(blob, `document.json`) //TODO : Use document name
    }
    
    const onSaveHTML = () =>{
        if(!editor) return;

        const content = editor.getHTML();
        const blob = new Blob([content], {
            type: "text/html",
        });
        onDownload(blob, `document.html`) //TODO : Use document name
    }
    
    const onSaveText = () =>{
        if(!editor) return;

        const content = editor.getText();
        const blob = new Blob([content], {
            type: "text/plain",
        });
        onDownload(blob, `document.txt`) //TODO : Use document name
    }



    return (
        <nav className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
                <Link href="/">
                    <Image src="/DoczFlow-logo.svg" alt="logo" width={36} height={36} />
                </Link>
                <div className="flex flex-col">
                    <DocumentInput />
                    <div className="flex">
                        <Menubar className="border-none bg-transparent shadow-none h-auto p-0">
                            {/* File Menu */}
                            <MenubarMenu>
                                <MenubarTrigger className="text-sm font-normal py-0.5 px-[7px] rounded-sm hover:bg-muted h-auto">
                                    File
                                </MenubarTrigger>
                                <MenubarContent className="print:hidden">
                                    <MenubarSub>
                                        <MenubarSubTrigger>
                                            <FileIcon className="size-4 mr-2" />
                                            Save
                                        </MenubarSubTrigger>
                                        <MenubarSubContent>
                                            <MenubarItem onClick={onSaveJSON}><FileJsonIcon className="size-4 mr-2" /> JSON</MenubarItem>
                                            <MenubarItem onClick={onSaveHTML}><GlobeIcon className="size-4 mr-2" /> HTML</MenubarItem>
                                            <MenubarItem onClick={()=> window.print()}><BsFilePdf className="size-4 mr-2" /> PDF</MenubarItem>
                                            <MenubarItem onClick={onSaveText}><FileTextIcon className="size-4 mr-2" /> Text</MenubarItem>
                                        </MenubarSubContent>
                                    </MenubarSub>
                                    <MenubarItem>
                                        <FilePlusIcon className="size-4 mr-2" />
                                        New Document
                                    </MenubarItem>
                                    <MenubarSeparator />
                                    <MenubarItem>
                                        <FilePenIcon className="size-4 mr-2" />
                                        Rename
                                    </MenubarItem>
                                    <MenubarItem>
                                        <TrashIcon className="size-4 mr-2" />
                                        Remove
                                    </MenubarItem>
                                    <MenubarSeparator />
                                    <MenubarItem onClick={() => window.print()}>
                                        <PrinterIcon className="size-4 mr-2" />
                                        Print <MenubarShortcut>ctrl + p</MenubarShortcut>
                                    </MenubarItem>
                                </MenubarContent>
                            </MenubarMenu>

                            {/*Edit Menu */}
                            <MenubarMenu>
                                <MenubarTrigger className="text-sm font-normal py-0.5 px-[7px] rounded-sm hover:bg-muted h-auto">
                                    Edit
                                </MenubarTrigger>
                                <MenubarContent>
                                    <MenubarItem onClick={() => editor?.chain().focus().undo().run()}>
                                        <Undo2Icon className="size-4 mr-2" />
                                        Undo <MenubarShortcut> ctrl + z</MenubarShortcut>
                                    </MenubarItem>
                                    <MenubarItem onClick={() => editor?.chain().focus().redo().run()}>
                                        <Redo2Icon className="size-4 mr-2" />
                                        Redo <MenubarShortcut> ctrl + y</MenubarShortcut>
                                    </MenubarItem>
                                </MenubarContent>
                            </MenubarMenu>

                            {/*Insert Menu*/}
                            <MenubarMenu>
                                <MenubarTrigger className="text-sm font-normal py-0.5 px-[7px] rounded-sm hover:bg-muted h-auto">
                                    Insert
                                </MenubarTrigger>
                                <MenubarContent>
                                    <MenubarSub>
                                        <MenubarSubTrigger>
                                            <TableIcon className="size-4 mr-2" />
                                            Table
                                        </MenubarSubTrigger>
                                        <MenubarSubContent>
                                            <div className="flex flex-col items-center p-2">
                                                {/* 5x5 dynamic grid */}
                                                <div className="grid grid-cols-5 gap-[2px]">
                                                    {Array.from({ length: 5 }).map((_, rIndex) =>
                                                        Array.from({ length: 5 }).map((_, cIndex) => (
                                                            <div
                                                                key={`${rIndex}-${cIndex}`}
                                                                onMouseEnter={() => {
                                                                    setRows(rIndex + 1);
                                                                    setCols(cIndex + 1);
                                                                }}
                                                                onClick={() => handleInsertTable(rIndex + 1, cIndex + 1)}
                                                                className={`w-5 h-5 border rounded-sm cursor-pointer ${rIndex < rows && cIndex < cols ? "bg-blue-500" : "bg-muted"
                                                                    }`}
                                                            />
                                                        ))
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    {rows} x {cols} table
                                                </p>
                                            </div>
                                        </MenubarSubContent>
                                    </MenubarSub>
                                </MenubarContent>

                            </MenubarMenu>

                            {/*Format Menu */}
                            <MenubarMenu>
                                <MenubarTrigger className="text-sm font-normal py-0.5 px-[7px] rounded-sm hover:bg-muted h-auto">
                                    Format
                                </MenubarTrigger>
                                <MenubarContent>
                                    <MenubarSub>
                                        <MenubarSubTrigger>
                                            <TextIcon className="size-4 mr-2" />
                                            Text
                                        </MenubarSubTrigger>
                                        <MenubarSubContent>
                                            <MenubarItem onClick={()=> editor?.chain().focus().toggleBold().run()}>
                                                <BoldIcon className="size-4 mr-2" /> Bold
                                                <MenubarShortcut>Ctrl + B</MenubarShortcut>
                                            </MenubarItem>

                                            <MenubarItem onClick={()=> editor?.chain().focus().toggleItalic().run()}>
                                                <ItalicIcon className="size-4 mr-2" /> Italic
                                                <MenubarShortcut>Ctrl + I</MenubarShortcut>
                                            </MenubarItem>

                                            <MenubarItem onClick={()=> editor?.chain().focus().toggleUnderline().run()}>
                                                <UnderlineIcon className="size-4 mr-2" /> Underline
                                                <MenubarShortcut>Ctrl + U</MenubarShortcut>
                                            </MenubarItem>

                                            <MenubarItem onClick={()=> editor?.chain().focus().toggleStrike().run()}>
                                                <StrikethroughIcon className="size-4 mr-2" /> <span>Strikethroug &nbsp;&nbsp;</span>
                                                <MenubarShortcut>Ctrl + Shift + X</MenubarShortcut>
                                            </MenubarItem>
                                        </MenubarSubContent>
                                    </MenubarSub>
                                    <MenubarItem onClick={()=> editor?.chain().focus().unsetAllMarks().run()}>
                                        <RemoveFormattingIcon className="size-4 rm-2"/>
                                        Clear Formating
                                    </MenubarItem>
                                </MenubarContent>
                            </MenubarMenu>
                        </Menubar>
                    </div>
                </div>
            </div>
        </nav>
    );
};





{/* <MenubarTrigger className="text-sm font-normal py-0.5 px-[7px] rounded-sm hover:bg-muted h-auto">
    Insert
</MenubarTrigger>
<MenubarContent>
    <MenubarSub>
        <MenubarSubTrigger>
            Teble
        </MenubarSubTrigger>
        <MenubarSubContent>
            <MenubarItem>
                1 x 1
            </MenubarItem>
            <MenubarItem>
                2 x 2
            </MenubarItem>
            <MenubarItem>
                3 x 3
            </MenubarItem>
            <MenubarItem>
                4 x 4
            </MenubarItem>
        </MenubarSubContent>
    </MenubarSub>
</MenubarContent> */}

