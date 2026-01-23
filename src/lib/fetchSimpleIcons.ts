import type { SimpleIcon } from "react-icon-cloud";

type FetchSimpleIconsResponse = {
  simpleIcons: Record<string, SimpleIcon>;
  allIcon: Record<string, { title: string; hex: string; slug: string }>;
  missing?: string[];
};

const iconCache: Record<string, SimpleIcon> = {};
const metaCache: Record<string, { title: string; hex: string; slug: string }> =
  {};

export async function fetchSimpleIcons({
  slugs,
}: {
  slugs: string[];
}): Promise<{
  simpleIcons: Record<string, SimpleIcon>;
  allIcon: Record<string, { title: string; hex: string; slug: string }>;
}> {
  const missing: string[] = [];
  const simpleIcons: Record<string, SimpleIcon> = {};
  const allIcon: Record<string, { title: string; hex: string; slug: string }> =
    {};

  const requested = slugs.map((s) => s.trim()).filter(Boolean);
  const uncached = Array.from(new Set(requested)).filter((k) => !iconCache[k]);

  if (uncached.length > 0) {
    const url = `/api/simple-icons?slugs=${encodeURIComponent(uncached.join(","))}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `Failed to fetch Simple Icons (${res.status} ${res.statusText})`,
      );
    }

    const data = (await res.json()) as FetchSimpleIconsResponse;
    for (const [key, icon] of Object.entries(data.simpleIcons ?? {})) {
      iconCache[key] = icon;
    }
    for (const [slug, meta] of Object.entries(data.allIcon ?? {})) {
      metaCache[slug] = meta;
    }
  }

  for (const requestKey of requested) {
    const icon = iconCache[requestKey];
    if (!icon) {
      missing.push(requestKey);
      continue;
    }
    simpleIcons[requestKey] = icon;
    allIcon[icon.slug] = metaCache[icon.slug] ?? {
      title: icon.title,
      hex: icon.hex,
      slug: icon.slug,
    };
  }

  if (missing.length > 0) {
    console.warn(
      `[IconCloud] Missing Simple Icons keys: ${missing.sort().join(", ")}`,
    );
  }

  return { simpleIcons, allIcon };
}
