"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { templates } from "@/constants/templates";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

import { JSONContent } from "@/types/editor";

export const TemplatesGallery = () => {
  const router = useRouter();
  const create = useMutation(api.documents.create);

  const [isCreating, setIsCreating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // ✅ ONLY used for DOCX import
  const convertHtmlToJson = (html: string): JSONContent => {
    const editor = new Editor({
      extensions: [StarterKit],
      content: html,
    });

    return editor.getJSON() as JSONContent;
  };

  // ✅ CLEAN: JSON only (no string anymore)
  const onTemplateClick = async (
    title: string,
    initialContent: JSONContent,
    templateId?: string
  ) => {
    // 🔴 IMPORT DOCX CASE
    if (templateId === "import-docx") {
      document.getElementById("docx-upload")?.click();
      return;
    }

    try {
      setIsCreating(true);

      const documentId = await create({
        title,
        initialContent,
      });

      toast.success("Document created! Redirecting...");
      router.push(`/documents/${documentId}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsCreating(false);
    }
  };

  const handleImport = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ FILE SIZE LIMIT
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsCreating(true);

      const res = await fetch("/api/import-docx", {
        method: "POST",
        body: formData,
      });

      const data: { html?: string } = await res.json();

      if (!data.html) throw new Error("Conversion failed");

      // ✅ HTML → JSON
      const jsonContent = convertHtmlToJson(data.html);

      const documentId = await create({
        title: file.name.replace(".docx", ""),
        initialContent: jsonContent,
      });

      toast.success("Document imported!");
      router.push(`/documents/${documentId}`);
    } catch (err) {
      console.error(err);
      toast.error("Import failed");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-[#F1F3F4]">
      <div className="max-w-screen-xl mx-auto px-16 py-6 flex flex-col gap-y-4">
        <h3 className="font-medium">Start a new document</h3>

        <Carousel>
          <CarouselContent className="-ml-4">
            {templates.map((template) => (
              <CarouselItem
                key={template.id}
                className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 2xl:basis-[14.285714%] pl-4"
              >
                <div
                  className={cn(
                    "aspect-[3/4] flex flex-col gap-y-2.5",
                    isCreating && "pointer-events-none opacity-50"
                  )}
                >
                  <button
                    disabled={isCreating}
                    onClick={() =>
                      onTemplateClick(
                        template.label,
                        template.initialContent,
                        template.id
                      )
                    }
                    style={{
                      backgroundImage: `url(${template.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                    className="size-full hover:border-blue-500 rounded-sm border hover:bg-blue-50 transition flex flex-col items-center justify-center gap-y-4 bg-white"
                  />
                  <p className="text-sm font-medium truncate">
                    {template.label}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        {/* ✅ Hidden file input */}
        <input
          type="file"
          accept=".docx"
          id="docx-upload"
          className="hidden"
          onChange={handleImport}
        />
      </div>
    </div>
  );
};