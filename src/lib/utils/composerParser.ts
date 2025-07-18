import type { Composer } from '$lib/zodAirtableTypes';
import type { CardComposer } from '$lib/types';

export interface RawComposerData {
    id: number;
    name: string;
    composer_id: number;
    composers: {
        id: number;
        name: string;
        tags: string;
        work: string;
        Image: null;
        links: string;
        media: string;
        notes: string;
        gender: string;
        sources: string;
        sex_type: string;
        image_url: string;
        sex_value: string;
        birth_date: string;
        created_at: null;
        death_date: string;
        references: string;
        updated_at: null;
        updated_by: null;
        nationality: string;
        birth_location: string;
        composer_style: string;
        death_location: string;
        profile_images: Array<{
            id: number;
            license: string;
            attribution: string;
            composer_id: number;
            upload_status: string;
            original_image_url: string;
            cloudflare_image_url: string;
        }>;
        composer_period: string;
        active_locations: string;
        long_description: string;
        short_description: string;
    };
}

// Helper functions
function safeParseJSON<T>(str: any, defaultValue: T): T {
    if (typeof str === 'string') {
        try {
            return JSON.parse(str);
        } catch {
            return defaultValue;
        }
    }
    return Array.isArray(str) ? str as T : defaultValue;
}

function safeString(val: any): string {
    return typeof val === 'string' ? val : '';
}

function createImageObject(img: any, composerName: string) {
    const imageUrl = img.cloudflare_image_url || img.original_image_url || img.url || '';
    return {
        id: (img.id || '0').toString(),
        url: imageUrl,
        filename: `${composerName}_profile.jpg`,
        size: 0,
        type: 'image/jpeg' as const,
        thumbnails: {
            small: { url: imageUrl, width: 150, height: 150 },
            large: { url: imageUrl, width: 400, height: 400 },
            full: { url: imageUrl, width: 800, height: 800 }
        }
    };
}

// Main parser function - handles both complete and partial data
export function parseRawComposerToComposer(rawData: RawComposerData | any): Composer {
    const composers = rawData.composers || rawData;

    const tags = safeParseJSON(composers.tags, []);
    const work = safeParseJSON(composers.work, []);
    const sources = safeParseJSON(composers.sources, []);
    const profileImages = composers.profile_images || [];
    const composerName = safeString(composers.name);
    console.log(profileImages)
    return {
        'Name': composerName,
        'Short Description': safeString(composers.short_description),
        'Long Description': safeString(composers.long_description),
        'Notes': safeString(composers.notes),
        'Date of Birth': safeString(composers.birth_date),
        'Birth Location': safeString(composers.birth_location),
        'Date of Death': safeString(composers.death_date) || undefined,
        'Death Location': safeString(composers.death_location) || undefined,
        'Active Locations': safeString(composers.active_locations),
        'Sex': [safeString(composers.gender) as 'Female' | 'Male' | 'Other'],
        imageURL: profileImages[0]?.cloudflare_image_url ||
            profileImages[0]?.original_image_url ||
            fallbackImageUrl,
        profileImages: profileImages.map((img: any) => ({
            url: img.cloudflare_image_url || img.original_image_url || img.url || fallbackImageUrl
        })),
        'sources': sources,
        'Work': work,
        'Created By': {
            id: 'system',
            email: 'system@opusxx.com',
            name: 'System'
        },
        'Created': new Date(),
        'Last Modified By': {
            id: 'system',
            email: 'system@opusxx.com',
            name: 'System'
        },
        'Last Modified': new Date()
    };
}

// Card-specific parser with simpler return type
export function parseRawComposerToCardComposer(rawData: RawComposerData | any): CardComposer {
    const composers = rawData.composers || rawData;
    const profileImages = composers.profile_images || [];
    const fallbackImageUrl = composers.image_url || composers.imageURL || '';

    return {
        imageURL: profileImages[0]?.cloudflare_image_url ||
            profileImages[0]?.original_image_url ||
            fallbackImageUrl,
        profileImages: profileImages.map((img: any) => ({
            url: img.cloudflare_image_url || img.original_image_url || img.url || fallbackImageUrl
        })),
        name: safeString(composers.name),
        birthDate: safeString(composers.birth_date),
        deathDate: safeString(composers.death_date),
        shortDescription: safeString(composers.short_description),
        longDescription: safeString(composers.long_description),
        tags: safeParseJSON(composers.tags, [])
    };
}