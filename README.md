# better-auth-is-bot

A **better-auth** plugin to detect and block bots from accessing your application routes.

## Features

- 🤖 **Bot Detection**: Uses the [`isbot`](https://www.npmjs.com/package/isbot) library to identify bots by user agent
- 🛡️ **Selective Protection**: Protect all routes or specific endpoints with wildcard support
- 📝 **Custom Error Messages**: Customize the error message returned to blocked bots
- ⚡ **Zero Configuration**: Works out of the box with sensible defaults
- 🎯 **Method Filtering**: Only applies to POST and GET requests by default

## Installation

```bash
npm install better-auth-is-bot
# or
pnpm add better-auth-is-bot
# or
yarn add better-auth-is-bot
```

## Basic Usage

```typescript
import { betterAuth } from "better-auth";
import { IsBot } from "better-auth-is-bot";

const auth = betterAuth({
  // ... your other better-auth configuration
  plugins: [
    IsBot() // Protects all POST and GET routes by default
  ],
});
```

## Configuration Options

The `IsBot` plugin accepts an optional configuration object:

```typescript
export interface IsBotOptions {
  protectedEndpoints?: string[];
  errorMessage?: string;
}
```

### Protect Specific Routes

You can specify which routes should be protected from bots:

```typescript
const auth = betterAuth({
  plugins: [
    IsBot({
      protectedEndpoints: ["/login", "/register", "/api/auth/*"]
    })
  ],
});
```

### Wildcard Support

Use wildcards to protect entire route groups:

```typescript
const auth = betterAuth({
  plugins: [
    IsBot({
      protectedEndpoints: [
        "/auth/*",        // Protects /auth/login, /auth/register, etc.
        "/admin/*",       // Protects all admin routes
        "/api/private/*", // Protects private API routes
      ]
    })
  ],
});
```

### Custom Error Messages

Customize the error message returned to blocked bots:

```typescript
const auth = betterAuth({
  plugins: [
    IsBot({
      errorMessage: "Access denied for automated requests."
    })
  ],
});
```

## Examples

### Protect All Routes (Default Behavior)

```typescript
import { betterAuth } from "better-auth";
import { IsBot } from "better-auth-is-bot";

const auth = betterAuth({
  baseURL: "http://localhost:3000",
  database: /* your database config */,
  plugins: [
    IsBot() // All POST and GET routes are protected
  ],
});
```

### Protect Only Authentication Routes

```typescript
const auth = betterAuth({
  baseURL: "http://localhost:3000",
  database: /* your database config */,
  plugins: [
    IsBot({
      protectedEndpoints: ["/sign-in", "/sign-up", "/reset-password"]
    })
  ],
});
```

### Complete Configuration Example

```typescript
const auth = betterAuth({
  baseURL: "http://localhost:3000",
  database: /* your database config */,
  plugins: [
    IsBot({
      protectedEndpoints: [
        "/auth/*",
        "/admin/*", 
        "/api/protected/*"
      ],
      errorMessage: "This endpoint does not allow automated requests. Please use a regular browser."
    })
  ],
});
```

## Response Format

When a bot is detected on a protected route, the plugin returns a `400 Bad Request` response with the following JSON body:

```json
{
  "message": "BOT_DETECTED", // or your custom error message
  "error": "BAD_REQUEST"
}
```

## How It Works

1. **Request Filtering**: Only POST and GET requests are checked (other methods pass through)
2. **Route Matching**: If `protectedEndpoints` is specified, the request path is matched against the patterns
3. **Bot Detection**: The `User-Agent` header is analyzed using the `isbot` library
4. **Response**: If a bot is detected on a protected route, a 400 error is returned

## Supported Bot Detection

This plugin uses the [`isbot`](https://www.npmjs.com/package/isbot) library, which can detect:

- Search engine crawlers (Googlebot, Bingbot, etc.)
- Social media bots (Facebook, Twitter, etc.)
- Monitoring and testing tools
- And many more automated user agents

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

