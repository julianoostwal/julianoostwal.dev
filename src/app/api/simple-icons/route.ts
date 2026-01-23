import { NextResponse } from "next/server";
import * as simpleIcons from "simple-icons";
import { slugToVariableName, titleToSlug } from "simple-icons/sdk";
import type { SimpleIcon as SimpleIconsPkgIcon } from "simple-icons";

export const runtime = "nodejs";

type ApiSimpleIcon = {
  slug: string;
  path: string;
  hex: string;
  title: string;
};

function getIconBySlug(slug: string): SimpleIconsPkgIcon | undefined {
  const variableName = slugToVariableName(slug);
  return (simpleIcons as unknown as Record<string, SimpleIconsPkgIcon | undefined>)[
    variableName
  ];
}

function resolveIcon(input: string): { slug: string; icon: SimpleIconsPkgIcon } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const directSlug = trimmed.toLowerCase();
  const direct = getIconBySlug(directSlug);
  if (direct) return { slug: directSlug, icon: direct };

  const slugFromTitle = titleToSlug(trimmed);
  const fromTitle = getIconBySlug(slugFromTitle);
  if (fromTitle) return { slug: slugFromTitle, icon: fromTitle };

  return null;
}

const MAX_SLUGS = 250;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slugsParams = url.searchParams.getAll("slugs");

  const requested = slugsParams
    .flatMap((value) => value.split(","))
    .map((s) => s.trim())
    .filter(Boolean);

  if (requested.length === 0) {
    return NextResponse.json(
      { error: "Missing required query param: slugs" },
      { status: 400 },
    );
  }

  const uniqueRequested = Array.from(new Set(requested)).slice(0, MAX_SLUGS);

  const missing: string[] = [];
  const simpleIconsResponse: Record<string, ApiSimpleIcon> = {};
  const allIcon: Record<string, { title: string; hex: string; slug: string }> = {};

  for (const requestKey of uniqueRequested) {
    const resolved = resolveIcon(requestKey);
    if (!resolved) {
      missing.push(requestKey);
      continue;
    }

    const { slug, icon } = resolved;
    simpleIconsResponse[requestKey] = {
      slug,
      title: icon.title,
      hex: icon.hex,
      path: icon.path,
    };
    allIcon[slug] ??= { slug, title: icon.title, hex: icon.hex };
  }

  return NextResponse.json({
    simpleIcons: simpleIconsResponse,
    allIcon,
    missing,
  });
}

