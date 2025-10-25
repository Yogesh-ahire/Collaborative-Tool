import { Toolbar } from "./Toolbar";
import { Editor } from "./Editor";
interface DocumentIdPageProps {
    params: Promise<{ documentId: string}>;
};

const DocumentIdPage = async ({params}: DocumentIdPageProps) => {
    const {documentId} = await params;
    
    return ( 
        <div className = 'min-h-screen bg-[#FAFBFD]'>
            <Toolbar/>
            <Editor />
            <h1>document is {documentId}</h1>
        </div>
     );
}
 
export default DocumentIdPage;