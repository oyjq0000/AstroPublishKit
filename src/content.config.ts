import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import {
  DEFAULT_POST_CATEGORY,
  DEFAULT_POST_LANG,
  POST_DESCRIPTION_MAX_LENGTH,
  POST_DESCRIPTION_MIN_LENGTH,
  POST_TITLE_MAX_LENGTH,
  POST_TITLE_MIN_LENGTH,
} from "./lib/content-rules.mjs";

const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string().min(POST_TITLE_MIN_LENGTH).max(POST_TITLE_MAX_LENGTH),
    description: z.string().min(POST_DESCRIPTION_MIN_LENGTH).max(POST_DESCRIPTION_MAX_LENGTH),
    date: z.coerce.date(),
    lastModified: z.coerce.date().optional(),
    category: z.string().min(1).default(DEFAULT_POST_CATEGORY),
    tags: z.array(z.string().min(1)).default([]),
    draft: z.boolean().default(false),
    noindex: z.boolean().default(false),
    featured: z.boolean().default(false),
    author: z.string().min(1).optional(),
    lang: z.string().min(1).default(DEFAULT_POST_LANG),
    cover: z
      .object({
        src: z.string().min(1),
        alt: z.string().min(1),
      })
      .optional(),
  }),
});

export const collections = { posts };
