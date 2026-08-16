import { loadGuide } from "~/lib/content.server";
import { pageMeta } from "~/lib/meta";
import "~/styles/prose.css";
import type { Route } from "./+types/guide";

export function loader() {
  return loadGuide();
}

export function meta({ loaderData }: Route.MetaArgs) {
  return pageMeta({
    title: "Organizer guide",
    description: loaderData.description,
    path: "/guide",
  });
}

export default function Guide({ loaderData }: Route.ComponentProps) {
  const { title, description, html } = loaderData;
  return (
    <article className="max-w-4xl mx-auto py-12">
      <header className="mb-12 pb-8 border-b-2 border-border">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{title}</h1>
        {description && (
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            {description}
          </p>
        )}
      </header>

      <div className="prose-content" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
