import { notFound } from "next/navigation";
import { getGroupByCode } from "@/actions/groups";
import { GroupNav } from "@/components/layout/GroupNav";

export default async function GroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ groupCode: string }>;
}) {
  const { groupCode } = await params;
  const group = await getGroupByCode(groupCode);
  if (!group) notFound();

  return (
    <div className="min-h-screen flex">
      <GroupNav group={group} />
      <main className="flex-1 md:ml-60 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
