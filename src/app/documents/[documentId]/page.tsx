import { auth } from "@clerk/nextjs/server"; 
import { preloadQuery } from "convex/nextjs";
import { redirect } from "next/navigation"; // 🔥 IMPORT REDIRECT

import { Document } from "./document";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface DocumentIdPageProps {
    params: Promise<{ documentId: Id<"documents">}>;
};

const DocumentIdPage = async ({ params }: DocumentIdPageProps) => {
    // 1. Resolve Params
    const { documentId } = await params;

    // 2. Resolve Auth
    const { getToken } = await auth();
    const token = await getToken({ template: "convex"}) ?? undefined;

    if(!token){
        throw new Error("Unauthorized");
    }

    // 3. SAFE FETCHING: The Try-Catch Boundary
    try {
        const preloadedDocument = await preloadQuery(
            api.documents.getById,
            { id: documentId },
            { token }
        );

        if(!preloadedDocument){
            // If somehow null is returned, trigger the catch block
            throw new Error("Document not found");
        }

        return <Document preloadedDocument={preloadedDocument}/>

    } catch (error) {
        // 🔥 THIS IS WHERE YOUR CODE WAS DYING SILENTLY
        console.error("Server Component Render Error: Failed to load document ->", error);
        
        // Gracefully kick the user back to the dashboard instead of crashing the app
        redirect("/");
    }
}

export default DocumentIdPage;