import { AIRTABLE_TOKEN, AIRTABLE_BASE } from '$env/static/private';
import type { Work as AirTableWork, Composer as AirtableComposer } from './zodAirtableTypes';
import type { Composer, Genres, Source, Work } from './zodDefinitions';
import Airtable from 'airtable';

let base = new Airtable({ apiKey: AIRTABLE_TOKEN }).base(AIRTABLE_BASE);
let genres: Genres = [];
let subGenres: Genres = [];
let styles: Genres = [];
let periods: Genres = [];

const composerByName = async (fieldValue: string) => {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/Composer?filterByFormula=${encodeURIComponent(`{Name}='${fieldValue}'`)}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        },
    })
    const data = await response.json();
    return data.records ?? [];
}
const getGenres = async () => {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/Genre`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        },
    })
    const data = await response.json();
    return data.records.map((record: any) => { return { id: record.id, name: record.fields.Name } }) ?? [];
}
const getSubGenres = async () => {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/Sub-Genre`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        },
    })
    const data = await response.json();
    return data.records.map((record: any) => { return { id: record.id, name: record.fields.Name } }) ?? [];
}
const getStyles = async () => {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/Style`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        },
    })
    const data = await response.json();
    return data.records.map((record: any) => { return { id: record.id, name: record.fields.Name } }) ?? [];
}
const getPeriods = async () => {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/Period`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        },
    })
    const data = await response.json();
    return data.records.map((record: any) => { return { id: record.id, name: record.fields.Name } }) ?? [];
}
const createSource = async (source: Source): Promise<string> => {
    console.log("html len", source.RawHTML?.length)
    const html = source.RawHTML ? encodeURIComponent(source.RawHTML) : ''
    const md = source.Content ? encodeURIComponent(source.Content) : ''
    return new Promise((resolve, reject) => {
        base('sources').create([
            {
                "fields": {
                    "URL": source.URL
                }
            }
        ], (err: any, records: any[]) => {
            if (err) {
                console.error("Airtable create error:", err);
                reject(err);
                return;
            }
            if (records.length) {
                resolve(records[0].getId());
            } else {
                reject(new Error("No records created"));
            }
        });
    });
};

const createWork = async (work: Work, composerId: string, sources: string[] = []) => {
    if (!genres.length) {
        genres = await getGenres();
    }
    if (!subGenres.length) {
        subGenres = await getSubGenres();
    }
    if (!styles.length) {
        styles = await getStyles();
    }
    if (!periods.length) {
        periods = await getPeriods();
    }
    console.log("genres", genres)
    console.log(work.genre)
    const fields: AirTableWork = {
        Name: work.title,
        Composer: [composerId],
        "Publication Year": work.publicationYear,
        "Short Description": work.shortDescription,
        "Long Description": work.longDescription,
        "sources": sources,
        "Genre": [genres.find((genre) => genre.name === work.genre)?.id as string],
        "Sub-Genre": [subGenres.find((subGenre) => subGenre.name === work.subGenre)?.id as string],
        "Style": [styles.find((style) => style.name === work.style)?.id as string],
        "Period": [periods.find((period) => period.name === work.period)?.id as string]
    }

    base('Work').create([
        {
            fields: {
                ...fields
            }
        },
    ], function (err: any, records: any[]) {
        if (err) {
            console.error(err);
            return;
        }
        records.forEach(function (record: any) {
            console.log(record.getId());
        });
    });

}
const createComposer = async (composer: Composer) => {

    let fields = {
        "Name": composer.name,
        "Date of Birth": composer.birthDate,
        "Birth Location": composer.birthLocation,
        "Date of Death": composer.deathDate,
        "Death Location": composer.deathLocation,
        "Short Description": composer.shortDescription,
        "Long Description": composer.longDescription,
        "sources": composer.sources,
        "Sex": composer.Sex,
        'Active Locations': composer['Active Locations'],
    }
    if (composer.imageURL) {
        fields["Profile Image"] = [{ url: composer.imageURL }]
    }
    base('Composer').create([
        {
            "fields": { ...fields }

        }
    ], function (err: any, records: any[]) {
        if (err) {
            console.error(err);
            return;
        }
        records.forEach(function (record: any) {
            const recordId = record.getId();
            console.log(recordId);
            composer.works.forEach((work) => {

                createWork(work, recordId, composer.sources);
            });
        });

    });
}


export { composerByName, createComposer, createSource, createWork, getGenres, getSubGenres, getStyles, getPeriods };


