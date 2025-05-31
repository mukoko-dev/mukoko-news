# Feed Aggregator

This project is a feed aggregation site built using Cloudflare Workers. It collects and aggregates feeds from various sources, providing a unified interface for users to access content.

## Project Structure

- **src/**: Contains the source code for the application.
  - **index.ts**: The main entry point for the application.
  - **types/**: TypeScript definitions for the application.
    - **feed.ts**: Type definitions related to feed data.
  - **handlers/**: Contains request handlers for processing feeds and errors.
    - **feedHandler.ts**: Logic for handling feed requests.
    - **errorHandler.ts**: Logic for handling errors.
  - **utils/**: Utility functions used throughout the application.
    - **parser.ts**: Functions for parsing feed data.
    - **cache.ts**: Functions for caching feed data.

- **dist/**: Contains the built files for deployment.
  - **client/**: Client-side code and assets.
    - **index.js**: Main JavaScript file for the client.
    - **assets/**: Static assets for the client.
  - **worker/**: Cloudflare Worker code.
    - **index.ts**: Main entry point for the Cloudflare Worker.

- **tests/**: Contains unit tests for the application.
  - **index.test.ts**: Test cases for the application.

- **wrangler.toml**: Configuration file for deploying the Cloudflare Worker.

- **package.json**: Project metadata and dependencies.

- **tsconfig.json**: TypeScript configuration file.

## Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   cd feed-aggregator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the project:
   ```
   npm run build
   ```

4. Deploy to Cloudflare Workers:
   ```
   npx wrangler publish
   ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.