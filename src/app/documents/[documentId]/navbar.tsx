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
    ImageIcon,
    ItalicIcon,
    LoaderIcon,
    PrinterIcon,
    Redo2Icon,
    RemoveFormattingIcon,
    SearchIcon,
    StrikethroughIcon,
    TableIcon,
    TextIcon,
    TrashIcon,
    UnderlineIcon,
    Undo2Icon,
    UploadIcon
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

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
import { useImageUpload } from "@/hooks/use-image-upload";

interface NavbarProps {
    data: Doc<"documents">;
}

export const Navbar = ({ data }: NavbarProps) => {
    const router = useRouter();
    const { editor } = useEditorStore();
    const mutation = useMutation(api.documents.create);
    const { uploadImage } = useImageUpload();

    // Table State
    const [rows, setRows] = useState(0);
    const [cols, setCols] = useState(0);
    const [customRows, setCustomRows] = useState(3);
    const [customCols, setCustomCols] = useState(3);

    // Image State
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);

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

    /* Table insert functionalities */
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

    /* Image functionalities */
    const onUploadImage = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            // 🔥 FIX: Start a persistent loading toast right after file selection
            const toastId = toast.loading("Uploading image...");

            try {
                setIsUploading(true);
                const uploadedUrl = await uploadImage(file);
                
                if (!uploadedUrl) throw new Error("Upload failed");
                
                // Insert into editor
                if (editor) editor.chain().focus().setImage({ src: uploadedUrl }).run();
                
                // 🔥 FIX: Turn the loading toast into a success message
                toast.success("Image uploaded successfully!", { id: toastId });
            } catch (err) {
                console.error("Upload failed:", err);
                // 🔥 FIX: Turn the loading toast into an error message
                toast.error("Image upload failed. Please try again.", { id: toastId });
            } finally {
                setIsUploading(false);
            }
        };

        input.click();
    };

    const onInsertImageUrl = () => {
        const trimmed = imageUrl.trim();
        if (!trimmed || !editor) return;
        editor.chain().focus().setImage({ src: trimmed }).run();
        setImageUrl("");
        setIsImageDialogOpen(false);
    };

    /* Download functionalities */
    const onDownload = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const onSaveJSON = () => {
        if (!editor) return;
        const content = editor.getJSON();
        const blob = new Blob([JSON.stringify(content)], { type: "application/json" });
        onDownload(blob, `${data.title}.json`);
    }

    const onSaveHTML = () => {
        if (!editor) return;
        const content = editor.getHTML();
        const blob = new Blob([content], { type: "text/html" });
        onDownload(blob, `${data.title}.html`);
    }

    const onSaveText = () => {
        if (!editor) return;
        const content = editor.getText();
        const blob = new Blob([content], { type: "text/plain" });
        onDownload(blob, `${data.title}.txt`);
    }

   const onSaveDocx = async () => {
        if (!editor) return;
        
        // 🔥 FIX: Start a loading toast that blocks the user from thinking it's broken
        const toastId = toast.loading("Exporting document to DOCX. Please wait..."); 
        
        try {
            const html = editor.getHTML();
            const res = await fetch("/api/export-docx", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ html }),
            });
            
            if (!res.ok) throw new Error();
            
            const blob = await res.blob();
            onDownload(blob, `${data.title}.docx`);
            
            // 🔥 FIX: Update the toast to success!
            toast.success("Document exported successfully!", { id: toastId }); 
        } catch (err) {
            console.error(err);
            // 🔥 FIX: Update the toast to error
            toast.error("DOCX export failed. Try again.", { id: toastId }); 
        }
    };

    return (
        <>
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
                                            <MenubarItem onClick={(e) => e.stopPropagation()} onSelect={(e) => e.preventDefault()}>
                                                <FilePenIcon className="size-4 mr-2" />
                                                Rename
                                            </MenubarItem>
                                        </RenameDialog>
                                        <RemoveDialog documentId={data._id}>
                                            <MenubarItem onClick={(e) => e.stopPropagation()} onSelect={(e) => e.preventDefault()}>
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

                                {/* Edit Menu */}
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

                                {/* Insert Menu */}
                                <MenubarMenu>
                                    <MenubarTrigger className="text-sm font-normal py-0.5 px-[7px] rounded-sm hover:bg-muted h-auto">
                                        Insert
                                    </MenubarTrigger>
                                    <MenubarContent>
                                        {/* TABLE SUBMENU */}
                                        <MenubarSub>
                                            <MenubarSubTrigger>
                                                <TableIcon className="size-4 mr-2" />
                                                Table
                                            </MenubarSubTrigger>
                                            <MenubarSubContent>
                                                <div className="flex flex-col p-2">
                                                    <div className="grid grid-cols-5 gap-[2px] mb-2 justify-center">
                                                        {Array.from({ length: 5 }).map((_, rIndex) =>
                                                            Array.from({ length: 5 }).map((_, cIndex) => (
                                                                <div
                                                                    key={`${rIndex}-${cIndex}`}
                                                                    onMouseEnter={() => {
                                                                        setRows(rIndex + 1);
                                                                        setCols(cIndex + 1);
                                                                    }}
                                                                    onClick={() => handleInsertTable(rIndex + 1, cIndex + 1)}
                                                                    className={`w-5 h-5 border rounded-sm cursor-pointer ${rIndex < rows && cIndex < cols ? "bg-blue-500" : "bg-muted"}`}
                                                                />
                                                            ))
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground text-center mb-2">
                                                        {rows} x {cols}
                                                    </p>
                                                    <MenubarSeparator />
                                                    {/* Custom Table Input */}
                                                    <div className="flex flex-col gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
                                                        <p className="text-[11px] font-medium text-muted-foreground px-1">Custom Size</p>
                                                        <div className="flex items-center gap-2">
                                                            <Input 
                                                                type="number" 
                                                                min={1} 
                                                                value={customRows} 
                                                                onChange={(e) => setCustomRows(Number(e.target.value) || 1)}
                                                                className="h-7 w-14 text-xs" 
                                                            />
                                                            <span className="text-xs text-muted-foreground">x</span>
                                                            <Input 
                                                                type="number" 
                                                                min={1} 
                                                                value={customCols} 
                                                                onChange={(e) => setCustomCols(Number(e.target.value) || 1)}
                                                                className="h-7 w-14 text-xs" 
                                                            />
                                                            <Button 
                                                                size="sm" 
                                                                className="h-7 px-2 text-xs" 
                                                                onClick={() => handleInsertTable(customRows, customCols)}
                                                            >
                                                                Add
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </MenubarSubContent>
                                        </MenubarSub>

                                        {/* IMAGE SUBMENU */}
                                        <MenubarSub>
                                            <MenubarSubTrigger>
                                                {isUploading ? <LoaderIcon className="size-4 mr-2 animate-spin" /> : <ImageIcon className="size-4 mr-2" />}
                                                Image
                                            </MenubarSubTrigger>
                                            <MenubarSubContent>
                                                <MenubarItem onClick={onUploadImage} disabled={isUploading}>
                                                    <UploadIcon className="size-4 mr-2" />
                                                    Upload from computer
                                                </MenubarItem>
                                                <MenubarItem onClick={() => setIsImageDialogOpen(true)}>
                                                    <SearchIcon className="size-4 mr-2" />
                                                    Paste URL
                                                </MenubarItem>
                                            </MenubarSubContent>
                                        </MenubarSub>

                                    </MenubarContent>
                                </MenubarMenu>

                                {/* Format Menu */}
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
                                                    <StrikethroughIcon className="size-4 mr-2" /> <span>Strikethrough &nbsp;&nbsp;</span>
                                                    <MenubarShortcut>Ctrl + Shift + X</MenubarShortcut>
                                                </MenubarItem>
                                            </MenubarSubContent>
                                        </MenubarSub>
                                        <MenubarItem onClick={() => editor?.chain().focus().unsetAllMarks().run()}>
                                            <RemoveFormattingIcon className="size-4 mr-2" />
                                            Clear Formatting
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

            {/* ✅ Render the Dialog safely outside the Menubar tree */}
            <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Insert Image URL</DialogTitle>
                    </DialogHeader>
                    <Input
                        placeholder="https://example.com/image.png"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") onInsertImageUrl();
                        }}
                    />
                    <DialogFooter>
                        <Button onClick={onInsertImageUrl}>
                            Insert
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};