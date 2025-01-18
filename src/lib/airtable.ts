import { AIRTABLE_TOKEN, AIRTABLE_BASE } from '$env/static/private';
import type { Composer } from './zodDefinitions';

var Airtable = require('airtable');
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
    base('Composer').create([
        {
            "fields": {
                "Name": "demo, composer"
            }
        }
    ], function (err, records) {
        if (err) {
            console.error(err);
            return;
        }
        records.forEach(function (record) {
            console.log(record.getId());
        });
    });

}


export { composerByName };


