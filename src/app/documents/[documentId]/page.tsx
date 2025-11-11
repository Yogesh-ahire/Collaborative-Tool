import { Toolbar } from "./Toolbar";
import { Editor } from "./Editor";
import { Navbar } from "./navbar";
import { Room } from "./room";
interface DocumentIdPageProps {
    params: Promise<{ documentId: string }>;
};

const DocumentIdPage = async ({ params }: DocumentIdPageProps) => {
    const { documentId } = await params;

    return (
        <div className='min-h-screen bg-[#FAFBFD]'>
            <div className="flex flex-col px-4 pt-4 gap-y-2 fixed top-0 left-0 right-0 z-10 bg-[#FAFBFD] print:hidden">
                <Navbar />
                <Toolbar />
            </div>
            <div className="pt-[122px] print:pt-0">
                <Room>
                    <Editor />
                </Room>
            </div>
            <h1>document is {documentId}</h1>
        </div>
    );
}

export default DocumentIdPage;