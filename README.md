# Angular Micro Frontends POC

This project demonstrates an Angular micro frontend architecture with type-safe communication between micro frontends.

## Structure

The project is structured as follows:

- `workspaces/application-shell`: The main application shell that hosts micro frontends
- `workspaces/feature-one-app`: A micro frontend application
- `workspaces/feature-two-app`: Another micro frontend application
- `workspaces/shared-types`: Shared TypeScript definitions for micro frontend communication

## Setup

### Install Dependencies

```bash
# Install dependencies for each workspace
cd workspaces/application-shell && npm install
cd ../feature-one-app && npm install
cd ../feature-two-app && npm install
cd ../shared-types && npm install
```

### Setup Shared Types

For local development, run the setup script to build and link the shared types package:

```bash
./setup-shared-types.sh
```

This script:
1. Builds the shared-types package
2. Creates npm links for the package
3. Links the package to each micro frontend

## Running the Applications

```bash
# Start the application shell
cd workspaces/application-shell && npm start

# In a separate terminal, start feature-one-app
cd workspaces/feature-one-app && npm start

# In a separate terminal, start feature-two-app
cd workspaces/feature-two-app && npm start
```

## Micro Frontend Communication

The applications communicate with each other using a type-safe message passing system. The types for this system are defined in the `shared-types` package.

### Communication Features

- Type-safe message passing with strong TypeScript interfaces
- Support for different message types with unified message handling
- Signal-based reactive updates using Angular's latest signal API
- Complete message history with timestamp tracking
- Direct micro-frontend to micro-frontend communication
- Environment-based configuration for app names
- Message filtering by source and type

## Recent Improvements

The micro frontend communication system has been enhanced with several improvements:

1. **Simplified Message Handling**: Using a unified messages list instead of separate signals for different communication channels
2. **Message History**: All applications now display complete message history instead of just the latest message
3. **Consistent API**: Standardized communication methods across all micro frontends
4. **Environment Configuration**: App names are now configured through environment variables
5. **Enhanced UI**: Improved visual display of messages with status indicators and message counts

For a more detailed explanation of the communication architecture, see [MICRO-FRONTENDS-COMMUNICATION.md](./MICRO-FRONTENDS-COMMUNICATION.md).

## Development in Separate Repositories

In a real-world scenario, each micro frontend would be developed in its own repository. To achieve this:

1. Publish the shared-types package to a private npm registry
2. Each micro frontend repository would include it as a dependency
3. The application shell would handle loading the micro frontends at runtime

## License

[MIT](LICENSE)