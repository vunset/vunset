// Dev-only branches use `process.env.NODE_ENV`, which the app's bundler replaces.
declare const process: { env: { NODE_ENV?: string } };
