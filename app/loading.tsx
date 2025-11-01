import { PageSkeleton } from "@/components/loaders/page-skeleton";

export default function RootLoading() {
  return (
    <div className="container mx-auto px-4 py-10">
      <PageSkeleton />
    </div>
  );
}
