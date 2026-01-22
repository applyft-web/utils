# <div align="center">Project Documentation</div>

## <div align="center">Overview</div>
This project is built using **TypeScript**, **React**, and **npm**. It provides utilities and hooks for managing configurations, flows, and traffic splitting in onboarding projects.

## <div align="center">Features</div>
- **Traffic Splitting**: Dynamically assigns landing types based on configuration and random values.
- **Configuration Management**: Fetches and manages JSON-based configurations.
- **Flow Management**: Retrieves and manages flow steps based on predefined or remote configurations.
- **Utility Functions**: Includes safe URI decoding, query parsing, and environment-specific logging.

## <div align="center">Usage</div>

### <u>CLI</u>

Two CLI commands are available to generate screens list from a pages config:

- `generate-screens` — universal Node CLI. Works in Node projects out of the box.

Examples:

```
npx @applyft-web/utils generate-screens -c src/pages.config.ts -o public/screens.json

npx @applyft-web/utils generate-screens -c pages.config.json -o public
```

### <u>Hooks</u>

#### `useSplitFlow`
Determines the landing type and flow type based on configuration and randomization.

**Parameters**:
- `landingParam` (string): The initial landing parameter from pathname.
- `options` (object): Additional settings for splitting. For example, Optional.

**Returns**:
- `{ landingType, flowType }`

#### `useLandingTypeV2`
Deprecated.

#### `useFlow`
Retrieves and manages a flow configuration based on the flow type.

**Parameters**:
- `flowType` (string): The type of the flow to retrieve.
- `flowsList` (Record<string, string[]>): A record of predefined flows.

**Returns**:
- The flow configuration.

#### `useConf`
Fetches and manages configuration data from a JSON file.

**Parameters**:
- `name` (string): The name of the configuration file (without extension).

**Returns**:
- Configuration data or `null` if loading fails.

### <u>Utilities</u>

#### `queryParser`
Parses a query string into an object.

**Parameters**:
- `str` (string): The query string to parse (e.g., `"?key=value"`).

**Returns**:
- An object representing the parsed query parameters.

## <div align="center">Folder Structure</div>
- `src/split-traffic`: Contains logic for traffic splitting.
- `src/utils`: Includes utility functions and hooks.
- `src/flows`: Manages flow configurations.
