"use client";

import Link from "next/link";
import Image from "next/image";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { SearchInput } from "./search-input";

export const Navbar = () => {

    return (
    <nav className="flex items-center justify-between h-full w-full">
      <div className="flex gap-3 items-center shrink-0 pr-6">
        <Link href="/" prefetch={false}>
          <div className="flex items-center gap-2">
            <Image
              src="/DoczFlow-logo.svg"
              alt="Logo"
              width={40}
              height={40}
              priority
            />
            <h3 className="text-xl"> DoczFlow </h3>
          </div>
        </Link>
      </div>
      <SearchInput />
      <div className="flex gap-3 items-center pl-6">
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
