import { AIRTABLE_TOKEN, AIRTABLE_BASE } from '$env/static/private';
import type { Composer } from './zodDefinitions';



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
}


export { composerByName };


