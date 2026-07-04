import { notFound } from "next/navigation";
import { getDomains, getDomain } from "@/lib/curriculum";
import DomainDetail from "@/components/DomainDetail";

export async function generateStaticParams() {
  return getDomains().map((domain) => ({ domain: domain.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain: domainId } = await params;
  const domain = getDomain(domainId);
  return { title: domain ? `${domain.name} — Polymath Hub` : "Not found" };
}

export default async function DomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain: domainId } = await params;
  const domain = getDomain(domainId);

  if (!domain) {
    notFound();
  }

  return <DomainDetail domain={domain} />;
}
