import ComposerCard from "$lib/components/cards/ComposerCard.svelte"
import { Composer } from "$lib/types"

const getComposerByName = async (composerName: string): Promise<Composer> => {
    const response = await fetch(`api/base/composers?name=${composerName}`)
    if (!response.ok) {
        throw new Error(`Failed to fetch composer: ${response.status}`)
    }
    const data = await response.json()
    console.log(data[0])
    return data[0] as Composer
}


export { getComposerByName }
