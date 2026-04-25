import { ReadOnlyDocument } from "./read-only-document";

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <ReadOnlyDocument token={resolvedParams.token} />;
}