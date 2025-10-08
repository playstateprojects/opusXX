import { z } from 'zod';

// PostgreSQL Database Types based on schema.sql

export const ComposerDatabaseSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  birth_date: z.string().nullable(),
  death_date: z.string().nullable(),
  birth_location: z.string().nullable(),
  nationality: z.string().nullable(),
  death_location: z.string().nullable(),
  long_description: z.string().nullable(),
  short_description: z.string().nullable(),
  image_url: z.string().nullable(),
  media: z.any().nullable(), // jsonb
  links: z.any().nullable(), // jsonb
  tags: z.any().nullable(), // jsonb
  references: z.any().nullable(), // jsonb
  gender: z.string().nullable(),
  sources: z.any().nullable(), // jsonb
  notes: z.string().nullable(),
  sex_type: z.string().nullable(),
  sex_value: z.string().nullable(),
  active_locations: z.string().nullable(),
  composer_period: z.string().nullable(),
  composer_style: z.string().nullable(),
  New_Profile_Image: z.string().nullable(),
  Birth_Year: z.number().nullable(),
  Image: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_by: z.string().nullable(),
  updated_at: z.date().nullable(),
});

export const WorkDatabaseSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  composer: z.number().nullable(), // foreign key to composers.id
  source: z.string().nullable(),
  publication_year: z.string().nullable(),
  first_performance: z.string().nullable(),
  duration: z.string().nullable(),
  availability: z.string().nullable(),
  link_to_score: z.string().nullable(),
  links: z.string().nullable(),
  status: z.string().nullable(),
  notes: z.string().nullable(),
  period: z.string().nullable(),
  instrumentation: z.string().nullable(),
  related_works: z.string().nullable(),
  long_description: z.string().nullable(),
  short_description: z.string().nullable(),
  tags: z.string().nullable(),
  catalog_number: z.string().nullable(),
  ismn: z.string().nullable(),
  publisher: z.string().nullable(),
  oclc: z.string().nullable(),
  iswc: z.string().nullable(),
  genre_id: z.number().nullable(),
  subgenre_id: z.number().nullable(),
  scoring: z.string().nullable(),
});

export const GenreDatabaseSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  works_id: z.number().nullable(),
});

export const SubgenreDatabaseSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  works_id: z.number().nullable(),
});

export const ComposerNameDatabaseSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  composer_id: z.number().nullable(),
});

export const ProfileImageDatabaseSchema = z.object({
  id: z.number(),
  composer_id: z.number().nullable(),
  original_image_url: z.string().nullable(),
  cloudflare_image_url: z.string().nullable(),
  license: z.string().nullable(),
  attribution: z.string().nullable(),
  upload_status: z.string().nullable(),
});

export const PublisherDatabaseSchema = z.object({
  id: z.number(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  link: z.string().nullable(),
  cf_image: z.string().nullable(),
  logo: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
  created_by: z.string().nullable(),
  updated_by: z.string().nullable(),
  nc_order: z.number().nullable(),
});

export const ContributorDatabaseSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  url: z.string().nullable(),
  profile_image: z.string().nullable(),
  bio: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
  created_by: z.string().nullable(),
  updated_by: z.string().nullable(),
  nc_order: z.number().nullable(),
});

// Inferred types
export type ComposerDatabase = z.infer<typeof ComposerDatabaseSchema>;
export type WorkDatabase = z.infer<typeof WorkDatabaseSchema>;
export type GenreDatabase = z.infer<typeof GenreDatabaseSchema>;
export type SubgenreDatabase = z.infer<typeof SubgenreDatabaseSchema>;
export type ComposerNameDatabase = z.infer<typeof ComposerNameDatabaseSchema>;
export type ProfileImageDatabase = z.infer<typeof ProfileImageDatabaseSchema>;
export type PublisherDatabase = z.infer<typeof PublisherDatabaseSchema>;
export type ContributorDatabase = z.infer<typeof ContributorDatabaseSchema>;

// Joined/expanded types for API responses
export const ComposerWithRelationsSchema = ComposerDatabaseSchema.extend({
  profile_images: z.array(ProfileImageDatabaseSchema).optional(),
  composer_names: z.array(ComposerNameDatabaseSchema).optional(),
  works: z.array(WorkDatabaseSchema).optional(),
});

export const WorkWithRelationsSchema = WorkDatabaseSchema.extend({
  composer_details: ComposerDatabaseSchema.optional(),
  genre_details: GenreDatabaseSchema.optional(),
  subgenre_details: SubgenreDatabaseSchema.optional(),
});

export type ComposerWithRelations = z.infer<typeof ComposerWithRelationsSchema>;
export type WorkWithRelations = z.infer<typeof WorkWithRelationsSchema>;