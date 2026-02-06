import { RouteClient } from "@/components/RouteClient";

type PageProps = {
  params: { slug: string };
};

// Allow routes not in generateStaticParams to be rendered dynamically in dev
// For production build with output: export, only listed routes are generated
export const dynamicParams = true;

// Generate static paths for all known routes
// Add any new routes here when you create them in Firestore
export async function generateStaticParams() {
  return [
    { slug: 'siliguri-kurseong-darjeeling' },
    // Add more routes here when they have assets:
    // { slug: 'siliguri-darjeeling' },
    // { slug: 'kolkata-sundarbans' },
  ];
}

// tid query param is handled client-side in RouteClient via useSearchParams
export default function RoutePage({ params }: PageProps) {
  return <RouteClient slug={params.slug} />;
}

