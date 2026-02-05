import { RouteClient } from "@/components/RouteClient";

type PageProps = {
  params: { slug: string };
};

// Generate static paths for all routes
export async function generateStaticParams() {
  // For now, just export the siliguri-kurseong-darjeeling route
  // Add more routes here as needed
  return [
    { slug: 'siliguri-kurseong-darjeeling' }
  ];
}

export default function RoutePage({ params }: PageProps) {
  return <RouteClient slug={params.slug} />;
}
