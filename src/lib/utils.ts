export const randomDelay = (): Promise<boolean> => {
    const delay = 500 + Math.random() * (2000 - 500); // Between 500ms and 4000ms
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), delay);
    });
};