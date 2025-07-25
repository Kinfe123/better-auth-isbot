import { IsBot } from "./index";
import type { IsBotOptions } from "./index";
import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { describe, it, expect } from "vitest";

function testUtils(options?: IsBotOptions) {
	const auth = betterAuth({
		baseURL: "http://localhost:3000",
		database: new Database(":memory:"),
		plugins: [IsBot(options)],
	});

	return { auth };
}

describe("IsBot Plugin", () => {
	const botUserAgent = "Googlebot/2.1 (+http://www.google.com/bot.html)";
	const realUserAgent =
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36";

	describe("Default behavior", () => {
		const { auth } = testUtils();

		it("should block bot on POST request", async () => {
			const request = new Request("http://localhost:3000/any-route", {
				method: "POST",
				headers: { "User-Agent": botUserAgent },
			});
			const response = await auth.handler(request);
			expect(response.status).toBe(400);
		});

		it("should allow non-bot on POST request", async () => {
			const request = new Request("http://localhost:3000/any-route", {
				method: "POST",
				headers: { "User-Agent": realUserAgent },
			});
			const response = await auth.handler(request);
			expect(response.status).toBe(404);
		});
	});

	describe("With protectedEndpoints", () => {
		const { auth } = testUtils({
			protectedEndpoints: ["/auth/*", "/login"],
		});

		it("should block bot on a protected route", async () => {
			const request = new Request("http://localhost:3000/login", {
				method: "POST",
				headers: { "User-Agent": botUserAgent },
			});
			const response = await auth.handler(request);
			expect(response.status).toBe(400);
		});

		it("should block bot on a wildcard protected route", async () => {
			const request = new Request("http://localhost:3000/auth/register", {
				method: "POST",
				headers: { "User-Agent": botUserAgent },
			});
			const response = await auth.handler(request);
			expect(response.status).toBe(400);
		});

		it("should allow bot on an unprotected route", async () => {
			const request = new Request("http://localhost:3000/dashboard", {
				method: "POST",
				headers: { "User-Agent": botUserAgent },
			});
			const response = await auth.handler(request);
			expect(response.status).toBe(404);
		});
	});

	describe("Custom Error Message", () => {
		it("should return the default error message when none is provided", async () => {
			const { auth } = testUtils();
			const request = new Request("http://localhost:3000/any-route", {
				method: "POST",
				headers: { "User-Agent": botUserAgent },
			});
			const response = await auth.handler(request);
			const json = await response.json();
			expect(json.message).toBe("BOT_DETECTED");
		});

		it("should return the custom error message when provided", async () => {
			const customMessage = "Access denied for bots.";
			const { auth } = testUtils({ errorMessage: customMessage });
			const request = new Request("http://localhost:3000/any-route", {
				method: "POST",
				headers: { "User-Agent": botUserAgent },
			});
			const response = await auth.handler(request);
			const json = await response.json();
			expect(json.message).toBe(customMessage);
		});
	});
});
