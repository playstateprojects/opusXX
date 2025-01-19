import { AIRTABLE_TOKEN, AIRTABLE_BASE } from '$env/static/private';
import type { Composer } from './zodDefinitions';
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
const createComposer = async (composer: Composer) => {
    let sourceID = ''
    base('sources').create([
        {
            "fields": {
                "Name": "https://google.com",
                "Content": "stuff will go here",
                "Composer": [
                    "reccbgjZgmnLqf2Qe"
                ],
                "Raw HTML": "<html>\n<h1>here's a title</h1>\n</html>"
            }
        }
    ], function (err: any, records: any[]) {
        if (err) {
            console.error(err);
            return;
        }
        if (records.length) {
            sourceID = records[0].getId();
        }
    });
    base('Composer').create([
        {
            "fields": {
                "Name": "test x2",
                "Date of Birth": "1575",
                "Birth Location": "Ferrara, Italy",
                "Date of Death": "after 1620",
                "Death Location": "sample",
                "Active Locations": "test",
                "Status": "In progress",
                "Work": [
                    "rec8XrYn3OGHnDJlq"
                ],
                "sources": [
                    sourceID
                ]
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


export { composerByName, createComposer };


