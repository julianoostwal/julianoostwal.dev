"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { toast } from "sonner";

interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  aboutContent: string | null;
  contactEmail: string | null;
  socialLinks: Record<string, string> | null;
  seoKeywords: string[];
  technologySlugs: string[];
}

interface SettingsFormProps {
  settings: SiteSettings;
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    siteName: settings.siteName || "",
    siteDescription: settings.siteDescription || "",
    heroTitle: settings.heroTitle || "",
    heroSubtitle: settings.heroSubtitle || "",
    aboutContent: settings.aboutContent || "",
    contactEmail: settings.contactEmail || "",
    github: (settings.socialLinks as Record<string, string>)?.github || "",
    linkedin: (settings.socialLinks as Record<string, string>)?.linkedin || "",
    twitter: (settings.socialLinks as Record<string, string>)?.twitter || "",
    seoKeywords: settings.seoKeywords?.join(", ") || "",
    technologySlugs: settings.technologySlugs?.join(", ") || "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        siteName: formData.siteName,
        siteDescription: formData.siteDescription,
        heroTitle: formData.heroTitle,
        heroSubtitle: formData.heroSubtitle,
        aboutContent: formData.aboutContent,
        contactEmail: formData.contactEmail,
        socialLinks: {
          github: formData.github,
          linkedin: formData.linkedin,
          twitter: formData.twitter,
        },
        seoKeywords: formData.seoKeywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        technologySlugs: formData.technologySlugs
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      };

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save settings");
      }

      toast.success("Settings saved successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardBody className="space-y-6 p-6">
          <h3 className="font-semibold text-lg">General</h3>
          <Input
            label="Site Name"
            value={formData.siteName}
            onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
            variant="bordered"
          />
          <Textarea
            label="Site Description"
            value={formData.siteDescription}
            onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
            variant="bordered"
            rows={3}
            description="Used for SEO meta description"
          />
          <Input
            label="Contact Email"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            variant="bordered"
          />
        </CardBody>
      </Card>

      {/* Hero Section */}
      <Card>
        <CardBody className="space-y-6 p-6">
          <h3 className="font-semibold text-lg">Hero Section</h3>
          <Input
            label="Hero Title"
            value={formData.heroTitle}
            onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
            variant="bordered"
            placeholder="Hi, I'm Julian Oostwal"
          />
          <Textarea
            label="Hero Subtitle"
            value={formData.heroSubtitle}
            onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
            variant="bordered"
            rows={3}
          />
        </CardBody>
      </Card>

      {/* About Content */}
      <Card>
        <CardBody className="space-y-6 p-6">
          <h3 className="font-semibold text-lg">About Page</h3>
          <Textarea
            label="About Content"
            value={formData.aboutContent}
            onChange={(e) => setFormData({ ...formData, aboutContent: e.target.value })}
            variant="bordered"
            rows={8}
            description='Content for the about page. You can use {{age:YYYY-MM-DD}} (e.g. {{age:2007-06-29}}).'
          />
        </CardBody>
      </Card>

      {/* Social Links */}
      <Card>
        <CardBody className="space-y-6 p-6">
          <h3 className="font-semibold text-lg">Social Links</h3>
          <Input
            label="GitHub"
            type="url"
            value={formData.github}
            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
            variant="bordered"
            placeholder="https://github.com/username"
          />
          <Input
            label="LinkedIn"
            type="url"
            value={formData.linkedin}
            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
            variant="bordered"
            placeholder="https://linkedin.com/in/username"
          />
          <Input
            label="Twitter / X"
            type="url"
            value={formData.twitter}
            onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
            variant="bordered"
            placeholder="https://twitter.com/username"
          />
        </CardBody>
      </Card>

      {/* SEO */}
      <Card>
        <CardBody className="space-y-6 p-6">
          <h3 className="font-semibold text-lg">SEO</h3>
          <Input
            label="Keywords"
            value={formData.seoKeywords}
            onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
            variant="bordered"
            description="Comma-separated SEO keywords"
            placeholder="Developer, Portfolio, Next.js"
          />
        </CardBody>
      </Card>

      {/* Technology Cloud */}
      <Card>
        <CardBody className="space-y-6 p-6">
          <h3 className="font-semibold text-lg">Technology Cloud</h3>
          <Textarea
            label="Technology Slugs"
            value={formData.technologySlugs}
            onChange={(e) => setFormData({ ...formData, technologySlugs: e.target.value })}
            variant="bordered"
            rows={6}
            description={
              <>
                Comma-separated icon slugs for the animated technology cloud on the homepage. 
                Find slugs at{" "}
                <a 
                  href="https://simpleicons.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  simpleicons.org
                </a>
              </>
            }
            placeholder="typescript, javascript, react, nextdotjs, laravel, dotnet"
          />
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" color="primary" size="lg" isLoading={loading}>
          Save Settings
        </Button>
      </div>
    </form>
  );
}
