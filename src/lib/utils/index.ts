// Export all utility functions
export { parseRawComposerToComposer, parseRawComposerToCardComposer, parseRawComposerToComposerSafe } from './composerParser.js';
export type { RawComposerData } from './composerParser.js';

// Import the functions directly
import { parseRawComposerToComposer, parseRawComposerToCardComposer } from './composerParser.js';

// Helper function to parse an array of raw composer data
export function parseComposersArray(rawData: any[]) {
    return rawData.map(item => parseRawComposerToComposer(item));
}

// Helper function to parse an array to CardComposer format
export function parseCardComposersArray(rawData: any[]) {
    return rawData.map(item => parseRawComposerToCardComposer(item));
}

// Quick parser for single composer
export function parseSingleComposer(rawData: any) {
    return parseRawComposerToComposer(rawData);
}

// Quick parser for single card composer
export function parseSingleCardComposer(rawData: any) {
    return parseRawComposerToCardComposer(rawData);
}
