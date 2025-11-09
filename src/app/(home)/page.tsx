"use client";

import { usePaginatedQuery } from "convex/react";
import { useSearchParam } from "@/hooks/use-search-param";

import dynamic from "next/dynamic";

import { Navbar } from "./navbar";
import { DocumentsTable } from "./documents-table";
import { api } from "../../../convex/_generated/api";

const TemplatesGallery = dynamic(
  () => import("./templates-gallery").then((mod) => mod.TemplatesGallery),
  { ssr: false }
);

const HomeClient = () => {
  const [search] = useSearchParam("search");
  const { 
    results, 
    status, 
    loadMore 
  } = usePaginatedQuery(api.documents.get, {search}, { initialNumItems: 5 }); 

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-10 h-16 bg-white p-4">
        <Navbar />
      </div>
      <div className="mt-16">
        <TemplatesGallery />
        <DocumentsTable
          documents = {results}
          loadmore = {loadMore}
          status = {status}
        />
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(HomeClient), { ssr: false });
