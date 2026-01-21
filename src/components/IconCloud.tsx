import IconCloud from "@/components/magicui/icon-cloud";
import { prisma } from "@/lib/db/prisma";

async function getTechnologySlugs(): Promise<string[]> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
    select: { technologySlugs: true },
  });

  return settings?.technologySlugs ?? [];
}

export default async function IconCloudComponent() {
  const slugs = await getTechnologySlugs();

  if (slugs.length === 0) {
    return null;
  }

  return (
    <div className="flex h-full w-full max-w-88 items-center justify-center overflow-hidden rounded-lg">
      <IconCloud iconSlugs={slugs} />
    </div>
  );
}
