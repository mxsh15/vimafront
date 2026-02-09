export function normalizeSlugParam(input: string): string {
    let s = (input ?? "").trim();
    for (let i = 0; i < 2; i++) {
        if (!s.includes("%")) break;
        try {
            const d = decodeURIComponent(s);
            if (d === s) break;
            s = d;
        } catch {
            break;
        }
    }

    return s;
}
