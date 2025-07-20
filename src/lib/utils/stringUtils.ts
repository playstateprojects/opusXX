const extractJSON = (str: string) => {
    // Handle code blocks
    const codeBlockMatch = str.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (codeBlockMatch) return codeBlockMatch[1];

    // Handle potential wrapped JSON
    const jsonMatch = str.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : str;
};

export { extractJSON };
