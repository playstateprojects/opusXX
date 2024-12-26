const getEmbedding = async (text: string) => {
    const response = await fetch.post(
        `${OPENAI_API_URL}/v1/engines/davinci/completions`,
        {
            prompt: text,
            max_tokens: 1,
            n: 1,
            stop: ["\n"],
        },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
        }
    );
    return response.data.choices[0].logprobs.tokens;
}