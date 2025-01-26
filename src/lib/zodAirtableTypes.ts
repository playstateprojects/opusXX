import { z } from 'zod'

export const AirtableThumbnailSchema = z.object({
  url: z.string(),
  width: z.number(),
  height: z.number(),
})

export const AirtableAttachmentSchema = z.object({
  id: z.string(),
  url: z.string(),
  filename: z.string(),
  size: z.number(),
  type: z.string(),
  thumbnails: z.object({
    small: AirtableThumbnailSchema,
    large: AirtableThumbnailSchema,
    full: AirtableThumbnailSchema,
  }).optional(),
})

export const AirtableCollaboratorSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
})

export const WorkStatus = z.enum([
  'Todo',
  'In progress',
  'Done',
])

export const WorkSchema = z.object({
  'Name': z.string().optional(),
  'Assignee': AirtableCollaboratorSchema.optional(),
  'Source/Collection': z.string().optional(),
  'Publication Year': z.string().optional(),
  'First Performance': z.string().optional(),
  'Duration': z.number().optional(),
  'Availability': z.string().optional(),
  'Link to Score': z.string().optional(),
  'Status': WorkStatus.optional(),
  'Notes': z.string().optional(),
  'Composer': z.array(z.string()).optional(),
  'Genre': z.array(z.string()).optional(),
  'sub-genre': z.array(z.string()).optional(),
  'Style': z.array(z.string()).optional(),
  'Period': z.array(z.string()).optional(),
  'Instrumentation': z.array(z.string()).optional(),
  'Name (from Composer)': z.union([z.array(z.string()), z.array(z.boolean()), z.array(z.number()), z.array(z.record(z.unknown()))]),
  'Name (from Genre)': z.union([z.array(z.string()), z.array(z.boolean()), z.array(z.number()), z.array(z.record(z.unknown()))]),
  'Name (from sub-genre)': z.union([z.array(z.string()), z.array(z.boolean()), z.array(z.number()), z.array(z.record(z.unknown()))]),
  'Name (from Period)': z.union([z.array(z.string()), z.array(z.boolean()), z.array(z.number()), z.array(z.record(z.unknown()))]),
  'Name (from Style)': z.union([z.array(z.string()), z.array(z.boolean()), z.array(z.number()), z.array(z.record(z.unknown()))]),
  'Name (from Instrumentation)': z.union([z.array(z.string()), z.array(z.boolean()), z.array(z.number()), z.array(z.record(z.unknown()))]),
  'instruments': z.string().or(z.number()),
  'Created By': AirtableCollaboratorSchema,
  'Created': z.coerce.date(),
  'Last Modified By': AirtableCollaboratorSchema,
  'Last Modified': z.coerce.date(),
  'Related Works': z.array(z.string()).optional(),
  'Long Description': z.string().optional(),
  'Short Description': z.string().optional(),
  'sources': z.array(z.string()).optional(),
})
export type Work = z.infer<typeof WorkSchema>

export const ComposerSex = z.enum([
  'Female',
  'Male',
  'Other',
])

export const ComposerStatus = z.enum([
  'Todo',
  'In progress',
  'Done',
])

export const ComposerSchema = z.object({
  'Name': z.string().optional(),
  'Profile Image': z.array(AirtableAttachmentSchema).optional(),
  'Short Description': z.string().optional(),
  'Notes': z.string().optional(),
  'Sex': z.array(ComposerSex).optional(),
  'Date of Birth': z.string().optional(),
  'Birth Location': z.string().optional(),
  'Date of Death': z.string().optional(),
  'Death Location': z.string().optional(),
  'Active Locations': z.string().optional(),
  'Status': ComposerStatus.optional(),
  'Created By': AirtableCollaboratorSchema,
  'Created': z.coerce.date(),
  'Last Modified By': AirtableCollaboratorSchema,
  'Last Modified': z.coerce.date(),
  'Work': z.array(z.string()).optional(),
  'Alernate Names': z.array(z.string()).optional(),
  'sources': z.array(z.string()).optional(),
  'Long Description': z.string().optional(),
})
export type Composer = z.infer<typeof ComposerSchema>

export const SourcesSchema = z.object({
  'URL': z.string().optional(),
  'Content': z.string().optional(),
  'Composer': z.array(z.string()).optional(),
  'Raw HTML': z.string().optional(),
  'Work': z.array(z.string()).optional(),
})
export type Sources = z.infer<typeof SourcesSchema>

export const GenreStatus = z.enum([
  'Todo',
  'In progress',
  'Done',
])

export const GenreSchema = z.object({
  'Name': z.string().optional(),
  'Work': z.array(z.string()).optional(),
})
export type Genre = z.infer<typeof GenreSchema>

export const SubGenreStatus = z.enum([
  'Todo',
  'In progress',
  'Done',
])

export const SubGenreSchema = z.object({
  'Name': z.string().optional(),
  'Notes': z.string().optional(),
  'Assignee': AirtableCollaboratorSchema.optional(),
  'Status': SubGenreStatus.optional(),
  'Work': z.array(z.string()).optional(),
})
export type SubGenre = z.infer<typeof SubGenreSchema>

export const StyleStatus = z.enum([
  'Todo',
  'In progress',
  'Done',
])

export const StyleSchema = z.object({
  'Name': z.string().optional(),
  'Notes': z.string().optional(),
  'weight': z.number().positive().optional(),
  'Assignee': AirtableCollaboratorSchema.optional(),
  'Status': StyleStatus.optional(),
  'Created': z.coerce.date(),
  'Last Modified': z.coerce.date(),
  'Created By': AirtableCollaboratorSchema,
  'Last Modified By': AirtableCollaboratorSchema,
  'Work': z.array(z.string()).optional(),
})
export type Style = z.infer<typeof StyleSchema>

export const PeriodStatus = z.enum([
  'Todo',
  'In progress',
  'Done',
])

export const PeriodSchema = z.object({
  'Name': z.string().optional(),
  'Notes': z.string().optional(),
  'Assignee': AirtableCollaboratorSchema.optional(),
  'Status': PeriodStatus.optional(),
  'Work': z.array(z.string()).optional(),
})
export type Period = z.infer<typeof PeriodSchema>

export const RelatedComposersStatus = z.enum([
  'Todo',
  'In progress',
  'Done',
])

export const RelatedComposersSchema = z.object({
  'Name': z.string().optional(),
  'Notes': z.string().optional(),
  'Assignee': AirtableCollaboratorSchema.optional(),
  'Status': RelatedComposersStatus.optional(),
})
export type RelatedComposers = z.infer<typeof RelatedComposersSchema>

export const InstrumentationStatus = z.enum([
  'Todo',
  'In progress',
  'Done',
])

export const InstrumentationSchema = z.object({
  'Name': z.string().optional(),
  'Parent Item': z.array(z.string()).optional(),
  'Notes': z.string().optional(),
  'Assignee': AirtableCollaboratorSchema.optional(),
  'Status': InstrumentationStatus.optional(),
  'Instruments': z.array(z.string()).optional(),
  'Number': z.number().int().positive().optional(),
  'Abbreviation (from Instruments)': z.union([z.array(z.string()), z.array(z.boolean()), z.array(z.number()), z.array(z.record(z.unknown()))]),
  'Work': z.string().optional(),
  'Count (Instruments)': z.number().int().nonnegative(),
  'Created': z.coerce.date(),
  'Last Modified': z.coerce.date(),
  'Created By': AirtableCollaboratorSchema,
  'Last Modified By': AirtableCollaboratorSchema,
  'instrumentation_instruments': z.array(z.string()).optional(),
  'Work 2': z.array(z.string()).optional(),
  'Name (from Instrumentation) (from Parent Item)': z.union([z.array(z.string()), z.array(z.boolean()), z.array(z.number()), z.array(z.record(z.unknown()))]),
})
export type Instrumentation = z.infer<typeof InstrumentationSchema>

export const InstrumentsStatus = z.enum([
  'Todo',
  'In progress',
  'Done',
])

export const InstrumentsSchema = z.object({
  'Abbreviation': z.string().optional(),
  'Name (EN)': z.string().optional(),
  'Name (FR)': z.string().optional(),
  'Name (DE)': z.string().optional(),
  'Name (IT)': z.string().optional(),
  'Name (ES)': z.string().optional(),
  'Notes': z.string().optional(),
  'Status': InstrumentsStatus.optional(),
  'Instrumentation': z.array(z.string()).optional(),
  'Created': z.coerce.date(),
  'Last Modified': z.coerce.date(),
  'Created By': AirtableCollaboratorSchema,
  'Last Modified By': AirtableCollaboratorSchema,
  'instrumentation_instruments': z.array(z.string()).optional(),
  'Instrumentation 2': z.string().optional(),
})
export type Instruments = z.infer<typeof InstrumentsSchema>

export const MediaSchema = z.object({
  'URL': z.string().optional(),
  'Notes': z.string().optional(),
})
export type Media = z.infer<typeof MediaSchema>

export const InstrumentationInstrumentsStatus = z.enum([
  'Todo',
  'In progress',
  'Done',
])

export const InstrumentationInstrumentsSchema = z.object({
  'Name': z.string().or(z.number()),
  'Notes': z.string().optional(),
  'Assignee': AirtableCollaboratorSchema.optional(),
  'Status': InstrumentationInstrumentsStatus.optional(),
  'Instruments': z.array(z.string()).optional(),
  'Name (EN) (from Instruments)': z.union([z.array(z.string()), z.array(z.boolean()), z.array(z.number()), z.array(z.record(z.unknown()))]),
  'Instrumentation': z.array(z.string()).optional(),
  'Name (from Instrumentation)': z.union([z.array(z.string()), z.array(z.boolean()), z.array(z.number()), z.array(z.record(z.unknown()))]),
  'Number': z.number().int().positive().optional(),
  'Work': z.string().optional(),
  'Instrumentation 2': z.array(z.string()).optional(),
})
export type InstrumentationInstruments = z.infer<typeof InstrumentationInstrumentsSchema>

export const AternateNamesStatus = z.enum([
  'Todo',
  'In progress',
  'Done',
])

export const AternateNamesSchema = z.object({
  'Name': z.string().optional(),
  'Notes': z.string().optional(),
  'Assignee': AirtableCollaboratorSchema.optional(),
  'Status': AternateNamesStatus.optional(),
  'Composer': z.array(z.string()).optional(),
})
export type AternateNames = z.infer<typeof AternateNamesSchema>

export const Table_14Status = z.enum([
  'Todo',
  'In progress',
  'Done',
])

export const Table_14Schema = z.object({
  'URL': z.string().optional(),
  'Content': z.string().optional(),
  'Assignee': AirtableCollaboratorSchema.optional(),
  'Status': Table_14Status.optional(),
  'Created': z.coerce.date(),
  'Created By': AirtableCollaboratorSchema,
})
export type Table_14 = z.infer<typeof Table_14Schema>
