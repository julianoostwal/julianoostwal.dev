import { cache } from "react";
import { prisma } from "@/lib/db/prisma";

export const getSiteSettings = cache(async () => {
  return prisma.siteSettings.findUnique({
    where: { id: "default" },
  });
});

