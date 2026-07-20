import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

import ThemeToggle from "@/app/theme-toggle";
import { getDocList, readDocContent } from "@/lib/docs";

export async function generateStaticParams() {
  return getDocList().map((doc) => ({ slug: doc.slug }));
}

export default async function DocDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await readDocContent(slug);

  if (!doc) {
    notFound();
  }

  return (
    <div className="page-shell">
      <header className="hero docs-hero">
        <nav className="topbar">
          <div className="brand">
            <span className="brand-mark">TD</span>
            <div>
              <p className="brand-name">TrendDrop</p>
              <p className="brand-sub">Research library</p>
            </div>
          </div>
          <div className="link-cluster">
            <Link className="ghost-button link-button" href="/docs">
              문서 목록
            </Link>
            <Link className="ghost-button link-button" href="/">
              홈으로 돌아가기
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className="dashboard">
        <section className="panel docs-panel">
          <div className="panel-heading docs-panel-heading">
            <div>
              <p className="section-kicker">DOCUMENT VIEWER</p>
              <h2>{doc.title}</h2>
            </div>
          </div>
          <article className="markdown-body">
            <ReactMarkdown>{doc.content}</ReactMarkdown>
          </article>
        </section>
      </main>
    </div>
  );
}

