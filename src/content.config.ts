import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const url = z.string().url();

/** A link rendered on the site. */
const link = z.object({
  label: z.string().min(1),
  href: url,
});

/**
 * One bullet. The text is the resume wording, verbatim. An optional link is
 * printed after the text as its own anchor (a receipt, a write-up), so a
 * bullet never carries markup.
 */
const bullet = z.object({
  text: z.string().min(1),
  link: link.optional(),
});

/**
 * Projects, four posters on equal footing. `tone` picks the poster's fill
 * from the palette in DESIGN.md section 2; use each tone once. `order` sets
 * the reading order in the grid.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/projects' }),
  schema: z.object({
    title: z.string().min(1),
    order: z.number().int().nonnegative(),
    tone: z.enum(['red', 'blue', 'yellow', 'paper', 'ink']),
    /** Mono eyebrow over the title, e.g. the resume's category. */
    eyebrow: z.string().min(1),
    /** The date stamp in the corner. For an unreleased project, its status. */
    when: z.string().min(1),
    /** One bold sentence under the title. */
    sub: z.string().min(1),
    bullets: z.array(bullet).min(1),
    /** Empty when the code is not public yet; the poster then prints `soon`. */
    links: z.array(link).default([]),
    /** Footer text for a poster with no links. */
    soon: z.string().optional(),
  }),
});

/** Work history. Bullets are the resume wording. */
const experience = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/experience' }),
  schema: z.object({
    order: z.number().int().nonnegative(),
    role: z.string().min(1),
    org: z.string().min(1),
    location: z.string().min(1),
    start: z.string().min(1),
    end: z.string().min(1),
    bullets: z.array(bullet).min(1),
  }),
});

/** Leadership roles, rendered after the work history in the same list. */
const leadership = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/leadership' }),
  schema: z.object({
    order: z.number().int().nonnegative(),
    role: z.string().min(1),
    org: z.string().min(1),
    start: z.string().min(1),
    end: z.string().min(1),
    bullets: z.array(bullet).min(1),
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
    /** The three stamps under the intro: the roles being looked for. */
    targets: z.array(z.string().min(1)).min(1),
    education: z.string().min(1),
    coursework: z.string().optional(),
    contact: z.object({
      email: z.string().email(),
      github: url,
      linkedin: url,
      /** Site-relative path to the PDF. */
      resume: z.string().startsWith('/'),
    }),
    /**
     * The only thing about music on the site: a plain link in the "Off the
     * clock" section to the Spotify playlist, worded as the songs he is
     * listening to lately (DECISIONS.md, "Music, superseded"). No audio
     * plays on the site.
     */
    music: z.object({
      playlist: z.object({
        label: z.string().min(1),
        url: url,
      }),
    }),
    /** The headshot's alt text. The file is src/assets/pro-headshot.jpg. */
    photo: z.object({
      alt: z.string().min(1),
      /** The small stamp on the photo's corner. */
      stamp: z.string().min(1),
    }),
    /** The skill groups from the resume, three boxes. */
    skills: z.array(z.object({ title: z.string().min(1), items: z.string().min(1) })).min(1),
    /** The "Off the clock" strip: file names in src/assets/photos without the extension, with alt text, and the line under them. */
    life: z.object({
      photos: z.array(z.object({ file: z.string().min(1), alt: z.string().min(1) })).min(1),
      line: z.string().min(1),
    }),
  }),
});

export const collections = { projects, experience, leadership, profile };
