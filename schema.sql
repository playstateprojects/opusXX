-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.composer_names (
  id bigint NOT NULL,
  name text,
  composer_id bigint,
  CONSTRAINT composer_names_pkey PRIMARY KEY (id),
  CONSTRAINT composer_names_composer_id_fkey FOREIGN KEY (composer_id) REFERENCES public.composers(id)
);
CREATE TABLE public.composers (
  New_Profile_Image text,
  Birth_Year bigint,
  id bigint NOT NULL,
  name text,
  birth_date text,
  death_date text,
  birth_location text,
  nationality text,
  death_location text,
  long_description text,
  short_description text,
  image_url text,
  media jsonb,
  links jsonb,
  tags jsonb,
  references jsonb,
  gender text,
  sources jsonb,
  notes text,
  sex_type text,
  sex_value text,
  active_locations text,
  composer_period text,
  composer_style text,
  Image text,
  created_at timestamp without time zone,
  updated_by character varying,
  updated_at timestamp without time zone,
  CONSTRAINT composers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.contributors (
  created_at timestamp without time zone,
  updated_at timestamp without time zone,
  created_by character varying,
  updated_by character varying,
  nc_order numeric,
  id integer NOT NULL DEFAULT nextval('contributors_id_seq'::regclass),
  name text,
  email character varying,
  url text,
  profile_image text,
  bio text,
  CONSTRAINT contributors_pkey PRIMARY KEY (id)
);
CREATE TABLE public.genres (
  works_id bigint UNIQUE,
  id smallint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  CONSTRAINT genres_pkey PRIMARY KEY (id),
  CONSTRAINT fk_works_genres_al8jop6ds2 FOREIGN KEY (works_id) REFERENCES public.works(id)
);
CREATE TABLE public.profile_images (
  id bigint NOT NULL,
  composer_id bigint,
  original_image_url text,
  cloudflare_image_url text,
  license text,
  attribution text,
  upload_status text,
  CONSTRAINT profile_images_pkey PRIMARY KEY (id),
  CONSTRAINT profile_images_composer_id_fkey FOREIGN KEY (composer_id) REFERENCES public.composers(id)
);
CREATE TABLE public.publishers (
  created_at timestamp without time zone,
  updated_at timestamp without time zone,
  created_by character varying,
  updated_by character varying,
  nc_order numeric,
  title text,
  id integer NOT NULL DEFAULT nextval('publishers_id_seq'::regclass),
  description text,
  link text,
  cf_image text,
  logo text,
  CONSTRAINT publishers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.subgenre_genre (
  subgenre_id integer NOT NULL,
  genre_id smallint NOT NULL,
  CONSTRAINT subgenre_genre_pkey PRIMARY KEY (subgenre_id, genre_id),
  CONSTRAINT subgenre_genre_subgenre_id_fkey FOREIGN KEY (subgenre_id) REFERENCES public.subgenres(id),
  CONSTRAINT subgenre_genre_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES public.genres(id)
);
CREATE TABLE public.subgenres (
  works_id bigint UNIQUE,
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  CONSTRAINT subgenres_pkey PRIMARY KEY (id),
  CONSTRAINT fk_works_subgenres_k0q91dhji_ FOREIGN KEY (works_id) REFERENCES public.works(id)
);
CREATE TABLE public.works (
  genre_id bigint,
  subgenre_id bigint,
  scoring text,
  name text,
  composer bigint,
  source text,
  publication_year text,
  first_performance text,
  duration text,
  availability text,
  link_to_score text,
  links text,
  status text,
  notes text,
  genre text,
  period text,
  instrumentation text,
  related_works text,
  long_description text,
  short_description text,
  tags text,
  catalog_number text,
  ismn text,
  publisher text,
  id bigint NOT NULL DEFAULT nextval('works_id_seq'::regclass),
  oclc text,
  iswc text,
  CONSTRAINT works_pkey PRIMARY KEY (id),
  CONSTRAINT works_composer_fkey FOREIGN KEY (composer) REFERENCES public.composers(id),
  CONSTRAINT works_subgenre_fkey FOREIGN KEY (subgenre_id) REFERENCES public.subgenres(id),
  CONSTRAINT works_genre_fkey FOREIGN KEY (genre_id) REFERENCES public.genres(id)
);