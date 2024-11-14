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
  // "cypress",
  "docker",
  "git",
  "github",
  "gitlab",
  "visualstudiocode",
];

export default function IconCloudComponent() {
  return (
    <div className="flex h-full w-full max-w-[22rem] items-center justify-center overflow-hidden rounded-lg">
      <IconCloud iconSlugs={slugs} />
    </div>
  );
}
