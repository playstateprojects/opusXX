function extractJson(input: string): unknown {
    console.log(input)
    const start = input.indexOf('{');
    const end = input.lastIndexOf('}');

    if (start === -1 || end === -1 || end <= start) {
        throw new Error('Valid JSON boundaries not found');
    }

    const jsonString = input.substring(start, end + 1);
    return JSON.parse(jsonString);
}

export { extractJson };