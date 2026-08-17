// `server-only` exists to make a build fail if server code is imported into a
// client bundle. Under vitest there is no client bundle, so it stands in as a
// no-op rather than the module that throws on import.
export {};
