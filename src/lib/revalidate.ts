import { revalidatePath } from "next/cache";

// The public pages are cached with ISR, so admin edits would otherwise only show
// up once their revalidate window expires. Bust the affected paths on every write
// so changes are visible immediately.
export function revalidateProjects(...slugs: (string | null | undefined)[]) {
  revalidatePath("/projects");
  revalidatePath("/sitemap.xml");

  for (const slug of slugs) {
    if (slug) {
      revalidatePath(`/projects/${slug}`);
    }
  }
}
