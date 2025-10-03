# Shared Types for Angular Micro Frontends

This package contains shared TypeScript interfaces and types for communication between Angular micro frontends.

## Installation

```bash
npm install @angular-microfrontends-poc/shared-types --save
```

## Usage

Import the types in your micro frontend:

```typescript
import { 
  MicroFrontendMessage, 
  MicroFrontendApi, 
  CentralizedApi 
} from '@angular-microfrontends-poc/shared-types';
```

## Types

### MicroFrontendMessage

Message format for communication between micro frontends:

```typescript
interface MicroFrontendMessage<T = unknown> {
  from: string;      // Source micro frontend
  to: string;        // Target micro frontend
  type: string;      // Message type for categorization
  payload: T;        // The actual message content
  timestamp: number; // When the message was sent
}
```

### MicroFrontendApi

Interface for the API exposed by each micro frontend:

```typescript
interface MicroFrontendApi {
  getMessages<T = unknown>(filterType?: string): MicroFrontendMessage<T>[];
  getLatestMessage<T = unknown>(type: string): MicroFrontendMessage<T> | undefined;
  sendMessage<T = unknown>(to: string, type: string, payload: T): void;
}
```

### CentralizedApi

Interface for the centralized API available on window:

```typescript
interface CentralizedApi {
  [microFrontendName: string]: MicroFrontendApi;
}
```

## Development

To build the package:

```bash
npm run build
```

## Publishing

To publish a new version:

```bash
npm version [patch|minor|major]
npm publish
```