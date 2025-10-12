export function track(e: string, p?: Record<string, any>) {
  console.log("[analytics]", e, p ?? {});
}
