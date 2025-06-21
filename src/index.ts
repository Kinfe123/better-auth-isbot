import { APIError, type BetterAuthPlugin, type AuthPluginSchema } from "better-auth";
import { z } from "zod";
import { isbot } from "isbot";
import { mergeSchema } from "better-auth/db";
import {
    createAuthEndpoint,
    createAuthMiddleware,
    getSessionFromCtx,
} from "better-auth/api";




export const IsBot = (
): BetterAuthPlugin => {

    return {
        id: "event",
        hooks: {
            after: [
                {
                    matcher: (ctx) => {
                        return (
                            ctx.method === "POST" ||
                            ctx.method === "GET");
                    },
                    handler: createAuthMiddleware(async (ctx) => {
                        const session = await getSessionFromCtx(ctx);
                        if (isbot(ctx.headers["user-agent"])) {
                            throw new APIError("BAD_REQUEST", {
                                message: 'BOT_DETECTED',
                            });
                        }
                        return ctx;
                    }),
                },
            ],
        },
        $ERROR_CODES: {
            BOT_DETECTED: "BOT_DETECTED",
        }
    } satisfies BetterAuthPlugin;
};
