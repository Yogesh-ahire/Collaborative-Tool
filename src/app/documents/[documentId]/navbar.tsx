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
import { RenameDialog } from "@/components/rename-dialog";
import { RemoveDialog } from "@/components/remove-dialog";

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

import { useState } from "react";
import { useMutation } from "convex/react";
import { useEditorStore } from "@/store/use-editor-store";

import { Inbox } from "./inbox";
import { Avatars } from "./avatars";
import { DocumentInput } from "./document-input";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface NavbarProps {
    data: Doc<"documents">;
}

export const Navbar = ({ data }: NavbarProps) => {
    const router = useRouter();
    const { editor } = useEditorStore();
    const mutation = useMutation(api.documents.create);

    const onNewDocument = () => {
        mutation({
            title: "Untitled document",
            initialContent: {
                type: "doc",
                content: [],
            }
        })
            .catch(() => toast.error("Something went wrong"))
            .then((id) => {
                toast.success("Document created! Redirecting...")
                router.push(`/documents/${id}`);
            })
    }

    /*table insert fuctinalities */
    const [rows, setRows] = useState(0);
    const [cols, setCols] = useState(0);

    const insertTable = ({ rows, cols }: { rows: number, cols: number }) => {
        editor
            ?.chain()
            .focus()
            .insertTable({ rows, cols, withHeaderRow: false })
            .run()
    };

    const handleInsertTable = (r: number, c: number) => {
        insertTable({ rows: r, cols: c });
    };

    const onDownload = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url); // ✅ FIX
    };

    const onSaveJSON = () => {
        if (!editor) return;

        const content = editor.getJSON();
        const blob = new Blob([JSON.stringify(content)], {
            type: "application/json",
        });
        onDownload(blob, `${data.title}.json`)
    }
    const onSaveHTML = () => {
        if (!editor) return;

        const content = editor.getHTML();
        const blob = new Blob([content], {
            type: "text/html",
        });
        onDownload(blob, `${data.title}.html`)
    }

    const onSaveText = () => {
        if (!editor) return;

        const content = editor.getText();
        const blob = new Blob([content], {
            type: "text/plain",
        });
        onDownload(blob, `${data.title}.txt`)
    }

    const onSaveDocx = async () => {
        if (!editor) return;

        try {
            const html = editor.getHTML();

            const res = await fetch("/api/export-docx", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ html }),
            });

            if (!res.ok) throw new Error();

            const blob = await res.blob();

            onDownload(blob, `${data.title}.docx`);
        } catch (err) {
            console.error(err);
            toast.error("DOCX export failed");
        }
    };


    return (
        <nav className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
                <Link href="/">
                    <Image src="/DoczFlow-logo.svg" alt="logo" width={36} height={36} />
                </Link>
                <div className="flex flex-col">
                    <DocumentInput title={data.title} id={data._id} />
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
                                            <MenubarItem onClick={() => window.print()}><BsFilePdf className="size-4 mr-2" /> PDF</MenubarItem>
                                            <MenubarItem onClick={onSaveText}><FileTextIcon className="size-4 mr-2" /> Text</MenubarItem>
                                            <MenubarItem onClick={onSaveDocx}>
                                                <FileIcon className="size-4 mr-2" />
                                                DOCX
                                            </MenubarItem>
                                        </MenubarSubContent>
                                    </MenubarSub>
                                    <MenubarItem onClick={onNewDocument}>
                                        <FilePlusIcon className="size-4 mr-2" />
                                        New Document
                                    </MenubarItem>
                                    <MenubarSeparator />
                                    <RenameDialog documentId={data._id} initialTitle={data.title}>
                                        <MenubarItem
                                            onClick={(e) => e.stopPropagation()}
                                            onSelect={(e) => e.preventDefault()}
                                        >
                                            <FilePenIcon className="size-4 mr-2" />
                                            Rename
                                        </MenubarItem>
                                    </RenameDialog>
                                    <RemoveDialog documentId={data._id}>
                                        <MenubarItem
                                            onClick={(e) => e.stopPropagation()}
                                            onSelect={(e) => e.preventDefault()}
                                        >
                                            <TrashIcon className="size-4 mr-2" />
                                            Remove
                                        </MenubarItem>
                                    </RemoveDialog>
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
                                            <MenubarItem onClick={() => editor?.chain().focus().toggleBold().run()}>
                                                <BoldIcon className="size-4 mr-2" /> Bold
                                                <MenubarShortcut>Ctrl + B</MenubarShortcut>
                                            </MenubarItem>

                                            <MenubarItem onClick={() => editor?.chain().focus().toggleItalic().run()}>
                                                <ItalicIcon className="size-4 mr-2" /> Italic
                                                <MenubarShortcut>Ctrl + I</MenubarShortcut>
                                            </MenubarItem>

                                            <MenubarItem onClick={() => editor?.chain().focus().toggleUnderline().run()}>
                                                <UnderlineIcon className="size-4 mr-2" /> Underline
                                                <MenubarShortcut>Ctrl + U</MenubarShortcut>
                                            </MenubarItem>

                                            <MenubarItem onClick={() => editor?.chain().focus().toggleStrike().run()}>
                                                <StrikethroughIcon className="size-4 mr-2" /> <span>Strikethroug &nbsp;&nbsp;</span>
                                                <MenubarShortcut>Ctrl + Shift + X</MenubarShortcut>
                                            </MenubarItem>
                                        </MenubarSubContent>
                                    </MenubarSub>
                                    <MenubarItem onClick={() => editor?.chain().focus().unsetAllMarks().run()}>
                                        <RemoveFormattingIcon className="size-4 rm-2" />
                                        Clear Formating
                                    </MenubarItem>
                                </MenubarContent>
                            </MenubarMenu>
                        </Menubar>
                    </div>
                </div>
            </div>
            <div className="flex gap-3 items-center pl-6">
                <Avatars />
                <Inbox />
                <OrganizationSwitcher
                    afterCreateOrganizationUrl="/"
                    afterLeaveOrganizationUrl="/"
                    afterSelectOrganizationUrl="/"
                    afterSelectPersonalUrl="/"
                />
                <UserButton />
            </div>
        </nav>
    );
};

