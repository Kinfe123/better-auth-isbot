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
        id: "is-bot",
        hooks: {
            after: [
                {
                    matcher: (ctx) => {
                        return (
                            ctx.method === "POST" ||
                            ctx.method === "GET");
                    },
                    handler: createAuthMiddleware(async (ctx) => {
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
            BOT_DETECTED: "You are a bot",
        }
    } satisfies BetterAuthPlugin;
};
