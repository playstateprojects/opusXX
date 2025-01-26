import { AIRTABLE_TOKEN, AIRTABLE_BASE } from '$env/static/private';
import type { Work as AirTableWork, Composer as AirtableComposer } from './zodAirtableTypes';
import type { Composer, Source, Work } from './zodDefinitions';
import Airtable from 'airtable';

var base = new Airtable({ apiKey: AIRTABLE_TOKEN }).base(AIRTABLE_BASE);

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
const createSource = async (source: Source): Promise<string> => {
    console.log("html len", source.RawHTML?.length)
    const html = source.RawHTML ? encodeURIComponent(source.RawHTML) : ''
    const md = source.Content ? encodeURIComponent(source.Content) : ''
    console.log(md)
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
    const fields: AirTableWork = {
        Name: work.title,
        Composer: [composerId],
        "Publication Year": work.publicationYear,
        "Short Description": work.shortDescription,
        "Long Description": work.longDescription,
        "sources": sources

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
    console.log('comp', composer)
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


export { composerByName, createComposer, createSource, createWork, getGenres };


