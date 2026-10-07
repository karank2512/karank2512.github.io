import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const url = z.string().url();

/** A link rendered on the site. */
const link = z.object({
  label: z.string().min(1),
  href: url,
});

/**
 * A measured number. `source` is required on purpose: a value with no
 * receipt cannot build. Keep the hardware and model in `setup`, which is
 * printed as a small caption next to the value.
 */
const metric = z.object({
  /** Vinyl-style track number, e.g. "A1". Purely presentational. */
  no: z.string().regex(/^[A-Z]\d$/),
  label: z.string().min(1),
  value: z.string().min(1),
  unit: z.string().optional(),
  setup: z.string().min(1),
  source: url,
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/projects' }),
  schema: z.object({
    title: z.string().min(1),
    /** "featured" renders as the liner-notes section; "crate" as a sleeve. */
    kind: z.enum(['featured', 'crate']),
    order: z.number().int().nonnegative(),
    /** One-line descriptor shown under the title on a sleeve. */
    tagline: z.string().min(1),
    /** One or two sentences. */
    summary: z.string().min(1),
    /** Short italic note under the summary. */
    note: z.string().optional(),
    /** Who it was built with, if anyone. */
    credit: z.string().optional(),
    /** Empty when the code is not public yet. */
    links: z.array(link).default([]),
    metrics: z.array(metric).default([]),
    /** Printed once as a caption under the metrics. */
    hardware: z.string().optional(),
  }),
});

const experience = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/experience' }),
  schema: z.object({
    order: z.number().int().nonnegative(),
    role: z.string().min(1),
    org: z.string().min(1),
    location: z.string().min(1),
    start: z.string().min(1),
    end: z.string().min(1),
    /** One sentence. Numbers here need a receipt too; prefer none. */
    line: z.string().min(1),
  }),
});

const profile = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/profile' }),
  schema: z.object({
    name: z.string().min(1),
    /** The one line under the name. Approved wording, do not edit casually. */
    tagline: z.string().min(1),
    /** Approved intro bullets, verbatim. */
    intro: z.array(z.string().min(1)).min(1),
    education: z.string().min(1),
    contact: z.object({
      email: z.string().email(),
      github: url,
      linkedin: url,
      /** Site-relative path to the PDF. */
      resume: z.string().startsWith('/'),
    }),
    music: z.object({
      playlistId: z.string().min(1),
      playlistTitle: z.string().min(1),
      openingTrack: z.string().min(1),
      openingArtist: z.string().min(1),
    }),
    photo: z.object({
      src: z.string().startsWith('/'),
      alt: z.string().min(1),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    }),
  }),
});

export const collections = { projects, experience, profile };
