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
  /** Row number, e.g. "A1". Purely presentational. */
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
    /**
     * "featured" is the project folded into the first experience entry (thaw:
     * tour and receipts). "crate" is a project card with its own 3D scene.
     */
    kind: z.enum(['featured', 'crate']),
    order: z.number().int().nonnegative(),
    /** One-line descriptor shown under the title on a card. */
    tagline: z.string().min(1),
    /** One or two sentences. */
    summary: z.string().min(1),
    /** Short note under the summary. For an unreleased project, the release line. */
    note: z.string().optional(),
    /** One mono line under the card's 3D scene, saying what the scene shows. */
    caption: z.string().optional(),
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
    /**
     * Id of a project in `projects` to fold into this entry as the featured
     * one (its tagline, summary, credit, links, engineering tour and
     * receipts). At most one entry sets this; it renders first.
     */
    project: z.string().min(1).optional(),
  }),
});

/**
 * Leadership entries. The section and its nav link render only when this
 * collection has at least one file; ship it empty rather than invent one.
 * Files render in file-name order, so prefix them (01-, 02-).
 */
const leadership = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/leadership' }),
  schema: z.object({
    role: z.string().min(1),
    org: z.string().min(1),
    start: z.string().min(1),
    end: z.string().min(1),
    /** One sentence. Numbers here need a receipt; prefer none. */
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
    /**
     * The only thing about music on the site: the plain link beside
     * "Contact me" to the Spotify playlist, worded as the songs he is
     * listening to lately (DECISIONS.md, "Music, superseded"). No audio
     * plays on the site.
     */
    music: z.object({
      playlist: z.object({
        label: z.string().min(1),
        url: url,
      }),
    }),
    /**
     * The headshot's alt text. The file itself is src/assets/pro-headshot.jpg,
     * imported by Hero.astro so the image pipeline sizes and converts it.
     */
    photo: z.object({
      alt: z.string().min(1),
    }),
  }),
});

export const collections = { projects, experience, leadership, profile };
