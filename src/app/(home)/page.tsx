"use client";

import dynamic from "next/dynamic";
import { Navbar } from "./navbar";

const TemplatesGallery = dynamic(
  () => import("./templates-gallery").then((mod) => mod.TemplatesGallery),
  { ssr: false }
);

const HomeClient = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-10 h-16 bg-white p-4">
        <Navbar />
      </div>
      <div className="mt-16">
        <TemplatesGallery />
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(HomeClient), { ssr: false });
