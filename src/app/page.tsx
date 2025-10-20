import Link from "next/link";

const Home = () => {
  return (
    <div className = 'flex min-h-screen items-center justify-center bg-red-300'>
      Click <Link href="/documents/123"><span className="text-blue-500 underline">&nbsp;here&nbsp;</span></Link> to go document id 123
    </div>
  );
}

export default Home;