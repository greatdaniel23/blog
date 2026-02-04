/// <reference path="../.astro/types.d.ts" />

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
    interface Locals extends Runtime {
        user?: {
            id: number;
            email: string;
            name: string;
            role: string;
        };
    }
}

interface Env {
    DB: D1Database;
    IMAGES: R2Bucket;
}
