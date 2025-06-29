import { APIError, type BetterAuthPlugin, type AuthPluginSchema } from "better-auth";
import { z } from "zod";
import { isbot } from "isbot";
export interface IsBotOptions {
    protectedEndpoints?: string[];
}

const escapeRegex = (str: string) => {
    // eslint-disable-next-line no-useless-escape
    return str.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, "\\$&");
}

const pathToRegexp = (path: string) => {
    const pattern = escapeRegex(path).replace(/\*/g, ".*");
    return new RegExp(`^${pattern}$`);
}

export const IsBot = (
    options: IsBotOptions = {}
): BetterAuthPlugin => {
    return {
        id: "is-bot",
        onRequest: async (request) => {
            if (!request) return;

            const { method, url } = request;
            if (method !== "POST" && method !== "GET") {
                return;
            }

            const { protectedEndpoints } = options;
            const pathname = new URL(url).pathname;

            if (protectedEndpoints && protectedEndpoints.length > 0) {
                const isProtected = protectedEndpoints.some(endpoint =>
                    pathToRegexp(endpoint).test(pathname)
                );
                if (!isProtected) {
                    return;
                }
            }
            if (isbot(request.headers.get("user-agent") ?? "")) {
                const response = new Response(
                    JSON.stringify({
                        message: "BOT_DETECTED",
                        error: "BAD_REQUEST"
                    }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    }
                );
                return { response };
            }
        },
        $ERROR_CODES: {
            BOT_DETECTED: "You are a bot",
        }
    } satisfies BetterAuthPlugin;
};
