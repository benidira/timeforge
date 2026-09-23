import type { ReactNode } from "react";
import type { Crumb } from "@/lib/seo";
import { Breadcrumb } from "./breadcrumb";

interface StaticPageProps {
  title: string;
  intro?: string;
  crumbs: Crumb[];
  path: string;
  children: ReactNode;
}

/** Layout for About, Privacy, Terms, Contact, Tools and Guides pages. */
export function StaticPage({ title, intro, crumbs, path, children }: StaticPageProps) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-10">
      <Breadcrumb crumbs={crumbs} path={path} />
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {intro ? <p className="mt-3 max-w-2xl text-lg text-muted">{intro}</p> : null}
      <div className="prose-tf mt-6">{children}</div>
    </div>
  );
}
