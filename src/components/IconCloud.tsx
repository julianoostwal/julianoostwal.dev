import IconCloud from "@/components/magicui/icon-cloud";

const slugs = [
  "typescript",
  "javascript",
  "react",
  "html5",
  "css3",
  "nodedotjs",
  "nextdotjs",
  "supabase",
  "postgresql",
  "firebase",
  "nginx",
  "vercel",
  "netlify",
  "tailwindcss",
  "nextui",
  "shadcn",
  "railway",
  "docker",
  "git",
  "github",
  "gitlab",
  "visualstudiocode",
  "express",
  "framer"
];

export default function IconCloudComponent() {
  return (
    <div className="flex h-full w-full max-w-88 items-center justify-center overflow-hidden rounded-lg">
      <IconCloud iconSlugs={slugs} />
    </div>
  );
}
