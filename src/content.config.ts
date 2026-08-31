import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string().min(1).max(120),
    description: z.string().min(20).max(240),
    date: z.coerce.date(),
    lastModified: z.coerce.date().optional(),
    category: z.string().min(1).default("General"),
    tags: z.array(z.string().min(1)).default([]),
    draft: z.boolean().default(false),
    noindex: z.boolean().default(false),
    featured: z.boolean().default(false),
    author: z.string().optional(),
    lang: z.string().default("en"),
    cover: z
      .object({
        src: z.string(),
        alt: z.string().min(1)
      })
      .optional()
  })
});

export const collections = { posts };
