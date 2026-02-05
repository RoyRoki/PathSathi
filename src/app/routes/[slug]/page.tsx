import { RouteClient } from "@/components/RouteClient";

type PageProps = {
  params: { slug: string };
  searchParams: { tid?: string };
};

export default function RoutePage({ params, searchParams }: PageProps) {
  return <RouteClient slug={params.slug} tid={searchParams.tid} />;
}
