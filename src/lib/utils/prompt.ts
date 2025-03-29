function generateInterfaceString(name: string, obj: Record<string, any>): string {
    const properties = Object.entries(obj)
        .map(([key, value]) => `  ${key}: ${typeof value};`)
        .join("\n");
    return `interface ${name} {\n${properties}\n}`;
}
