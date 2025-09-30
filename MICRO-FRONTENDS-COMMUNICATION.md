# Micro Frontends Communication

This document provides an in-depth explanation of the communication architecture implemented in our Angular micro frontends application. We'll cover the design patterns, implementation details, and best practices used to enable seamless communication between independently deployed micro frontends.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Shared Types Package](#shared-types-package)
- [Communication Service Implementation](#communication-service-implementation)
  - [Application Shell Implementation](#application-shell-implementation)
  - [Micro Frontend Implementation](#micro-frontend-implementation)
- [Angular Integration](#angular-integration)
- [ViewContainerRef and Component Loading](#viewcontainerref-and-component-loading)
- [Technical Challenges and Solutions](#technical-challenges-and-solutions)
- [Best Practices](#best-practices)

## Architecture Overview

Our micro frontends architecture consists of three main applications:

1. **Application Shell**: The container application that loads and orchestrates the micro frontends
2. **Feature One App**: A micro frontend for feature one functionality
3. **Feature Two App**: A micro frontend for feature two functionality

The communication architecture follows a hybrid approach where the application shell provides a centralized API infrastructure, but messages can flow directly between micro frontends without requiring the shell as an intermediary. Each micro frontend has access to a type-safe API for sending and receiving messages to/from any other application in the system.

### Key Components

- **Module Federation**: We use Webpack Module Federation to dynamically load micro frontends at runtime
- **Shared Types Package**: A common package containing TypeScript interfaces for type-safe communication
- **Communication Service**: Services in each application that handle message passing
- **Angular Signals**: For reactive state management and updates across micro frontends

### Communication Flow

The basic flow of communication is:

1. Application shell initializes a centralized API and makes it available through `window.CentralizedAPI`
2. Micro frontends access their respective APIs through this global object
3. Messages are sent directly to their target using a standard format with source, target, type, and payload
4. Custom events are dispatched to notify all applications about new messages
5. Each application filters for messages addressed to it and updates its state accordingly
6. Angular Signals update to reflect the latest messages, causing UI updates

### Communication Patterns

Our architecture supports three key communication patterns:

1. **Shell-to-Micro-Frontend**: The shell sends messages to individual micro frontends
2. **Micro-Frontend-to-Shell**: Micro frontends send messages to the shell
3. **Direct Micro-Frontend-to-Micro-Frontend**: Micro frontends communicate directly with each other

This flexibility allows for complex interactions between components while maintaining a consistent messaging protocol and type safety across boundaries.

## Shared Types Package

At the core of our communication architecture is a shared types package that ensures type safety across micro frontends. This package is published as an NPM module and imported by all micro frontends.

### Key Interfaces

```typescript
// Message data that can be shared between micro frontends
export interface MicroFrontendMessage<T = unknown> {
  from: string;      // Source micro frontend
  to: string;        // Target micro frontend
  type: string;      // Message type for categorization
  payload: T;        // The actual message content
  timestamp: number; // When the message was sent
}

// Type for the communication API provided to each micro frontend
export interface MicroFrontendApi {
  // Get all messages sent to this micro frontend
  getMessages<T = unknown>(filterType?: string): MicroFrontendMessage<T>[];
  
  // Get the latest message of a specific type sent to this micro frontend
  getLatestMessage<T = unknown>(type: string): MicroFrontendMessage<T> | undefined;
  
  // Send a message from this micro frontend to another
  sendMessage<T = unknown>(to: string, type: string, payload: T): void;
}

// Type for the centralized API that provides access to all micro frontends
export interface CentralizedApi {
  [microFrontendName: string]: MicroFrontendApi;
}
```

This type system enables:
- Generic payloads with type safety
- Clear message routing with source and target
- Message categorization with the type field
- Historical message tracking with timestamps

## Communication Service Implementation

### Application Shell Implementation

The application shell implements a comprehensive communication service (`MicroFrontendsCommunicationService`) that:

1. Initializes the centralized API
2. Creates a separate API instance for each micro frontend
3. Sets up event listeners for message passing
4. Manages message storage and retrieval
5. Provides reactive signals for UI updates

Key parts of the implementation:

```typescript
@Injectable({
  providedIn: 'root',
})
export class MicroFrontendsCommunicationService {
  // Message store for all micro frontends
  private readonly messageStore: MicroFrontendMessage<any>[] = [];
  
  // Signals to track messages by type and target
  readonly messageSignals = new Map<string, ReturnType<typeof signal<MicroFrontendMessage<any> | undefined>>>();

  /**
   * Initializes the communication API and makes it available to all micro frontends
   */
  init() {
    const centralizedApi: CentralizedApi = {};

    // Create API for each micro frontend and the shell itself
    this.microfrontends.forEach((mfName) => {
      centralizedApi[mfName] = this.createApiForMicroFrontend(mfName);
    });

    // Add API for the shell itself
    centralizedApi[this.SHELL_NAME] = this.createApiForMicroFrontend(this.SHELL_NAME);

    // Make the API accessible globally
    window.CentralizedAPI = centralizedApi;
    
    // Set up communication listeners
    this.setupCommunication();
  }

  /**
   * Creates a type-safe API for a specific micro frontend
   */
  private createApiForMicroFrontend(owner: string): MicroFrontendApi {
    return {
      getMessages: <T = unknown>(filterType?: string): MicroFrontendMessage<T>[] => {
        // Implementation...
      },
      
      getLatestMessage: <T = unknown>(type: string): MicroFrontendMessage<T> | undefined => {
        // Implementation...
      },
      
      sendMessage: <T = unknown>(to: string, type: string, payload: T): void => {
        // Implementation...
      }
    };
  }
  
  /**
   * Sets up the communication listeners for all micro frontends
   */
  private setupCommunication(): void {
    // Listen for message events
    window.addEventListener('message-event', ((event: Event) => {
      // Implementation...
    }) as EventListener);
  }
}
```

The shell service provides several important features:

1. **Message Storage**: All messages are stored in a central store for historical access
2. **Signal Management**: Creating and updating signals for reactive state
3. **Event-Based Communication**: Using custom events for cross-app messaging
4. **Type Safety**: Maintaining strong typing throughout the system

### Micro Frontend Implementation

Each micro frontend implements its own communication service that connects to the centralized API. The implementation is simpler than the shell's service, focusing on:

1. Accessing the centralized API
2. Sending messages to the shell or other micro frontends
3. Listening for messages directed to this micro frontend
4. Exposing a reactive messages list with helper methods

### Simplified Message Handling

Rather than maintaining individual signals for messages from different sources, we use a more scalable approach with a single messages list:

```typescript
// Signal to reactively track all messages directed to this app
readonly messages = signal<MicroFrontendMessage<string>[]>([]);

// In the message listener
private setupMessageListener() {
  window.addEventListener('message-event', ((event: Event) => {
    const customEvent = event as CustomEvent<ChangedDataEvent<unknown>>;
    const { message } = customEvent.detail;
    
    // If the message is directed to this app, add it to our messages list
    if (message && message.to === this.appName) {
      // Add the new message to our list
      this.messages.update(currentMessages => [
        ...(currentMessages || []),
        message as MicroFrontendMessage<string>
      ]);
      
      console.log(`Received message in ${this.appName} from ${message.from}:`, message);
    }
  }) as EventListener);
}
```

This approach provides several benefits:
1. **Scalability**: No need to add new signals when adding new communication partners
2. **Message History**: Maintains a record of all received messages
3. **Filtering Flexibility**: Can filter messages by any attribute (source, type, timestamp)
4. **Simplified UI Integration**: Components can derive specific message lists as needed

To make it easy to work with the messages list, we provide helper methods:

```typescript
/**
 * Gets messages from a specific source
 * @param source The source micro frontend name
 * @returns Array of messages from the specified source
 */
getMessagesFrom(source: string): MicroFrontendMessage<string>[] {
  return this.messages().filter(msg => msg.from === source);
}
```

In components, these can be used with computed properties to create reactive views of the message data:

```typescript
// Computed properties to get messages from specific sources
// Using environment.shellName for better maintainability
protected readonly messagesFromShell = computed(() =>
  this.communicationService.getMessagesFrom(environment.shellName)
);

protected readonly messagesFromFeatureTwo = computed(() =>
  this.communicationService.getMessagesFrom('feature-two-app')
);

// Computed value showing the communication status with shell
protected readonly communicationStatus = computed(() => {
  return this.messagesFromShell().length > 0 ? 'Active - Messages Received' : 'Waiting for message';
});

// Computed to get total message count
protected readonly totalMessageCount = computed(() => 
  this.allMessages().length
);
```

### Direct Communication Between Micro Frontends

Our architecture allows micro frontends to communicate directly with each other without requiring the shell to act as an intermediary. This is achieved through:  

1. **Named References**: Each micro frontend knows the names of other micro frontends it needs to communicate with
2. **Unified Message Store**: A single message list that captures all incoming messages
3. **Type-Safe API**: Leveraging the shared type system for consistent message formats
4. **Generic Messaging Method**: A universal method for sending messages to any target

Example implementation from Feature App showing direct communication with other micro frontends:

```typescript
@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  // The name of this micro frontend
  private readonly appName = environment.appName;
  
  // Signal to reactively track all messages directed to this app
  readonly messages = signal<MicroFrontendMessage<string>[]>([]);
  
  constructor() {
    // Set up the communication listener
    this.setupMessageListener();
  }

  /**
   * Sends a message to another micro frontend
   */
  sendMessageTo(message: string, to: string, type: string = 'default') {
    // Use the app API to send a message to another micro frontend
    const api = this.getAppApi();
    if (api) {
      api.sendMessage(to, type, message);
    } else {
      console.warn(
        `${this.appName} API not available. Make sure the application shell has initialized the communication API.`
      );
    }
  }

  /**
   * Sets up a listener for messages from the shell or other micro frontends
   */
  private setupMessageListener() {
    // Set up event listener for message events
    window.addEventListener('message-event', ((event: Event) => {
      // Cast to CustomEvent with our expected type
      const customEvent = event as CustomEvent<ChangedDataEvent<unknown>>;
      const { message } = customEvent.detail;
      
      // If the message is directed to this app, add it to our messages list
      if (message && message.to === this.appName) {
        // Add the new message to our list
        this.messages.update((currentMessages) => [
          ...(currentMessages || []),
          message as MicroFrontendMessage<string>,
        ]);
        
        console.log(`Received message in ${this.appName} from ${message.from}:`, message);
      }
    }) as EventListener);
  }
}
```

## Angular Integration

### Signals for Reactive State

We leverage Angular's signals for reactive state management. This provides several benefits:

1. **Fine-grained reactivity**: UI updates only when relevant data changes
2. **Type safety**: Signals are strongly typed with the message interface
3. **Integration with change detection**: Works seamlessly with Angular's rendering
4. **Developer experience**: Clean API for reading and reacting to state changes

Example signal usage:

```typescript
// In the communication service
readonly messageFromShell = signal<MicroFrontendMessage<string> | undefined>(undefined);

// In a component
const messageText = computed(() => {
  const message = this.communicationService.messageFromShell();
  return message ? message.payload : 'No messages yet';
});
```

## ViewContainerRef and Component Loading

One key technical challenge was properly loading micro frontend components in the combined view. Initially, we tried creating components directly, but this approach didn't properly integrate with Angular's dependency injection system.

The solution was to use `ViewContainerRef` to create components:

```typescript
@Component({
  selector: 'app-all-micro-frontends',
  standalone: true,
  template: `
    <div class="all-mfe-container">
      <div #featureOneContainer class="mfe-content"></div>
      <div #featureTwoContainer class="mfe-content"></div>
    </div>
  `,
})
export class AllMicroFrontendsComponent implements OnInit, AfterViewInit {
  @ViewChild('featureOneContainer', { read: ViewContainerRef }) featureOneContainer!: ViewContainerRef;
  @ViewChild('featureTwoContainer', { read: ViewContainerRef }) featureTwoContainer!: ViewContainerRef;
  
  private environmentInjector = inject(EnvironmentInjector);
  
  private async loadFeatureOne() {
    try {
      // Load Feature One App
      const featureOneModule = await loadRemoteModule({
        type: 'manifest',
        remoteName: 'feature-one-app',
        exposedModule: './ComponentOne'
      });
      
      // Create the component using the ViewContainerRef to ensure proper Angular integration
      const componentRef = this.featureOneContainer.createComponent(featureOneModule.FeatureOneApp, {
        environmentInjector: this.environmentInjector
      });
      
      // Detect changes to ensure the component renders properly
      componentRef.changeDetectorRef.detectChanges();
    } catch (error) {
      console.error('Error loading Feature One App:', error);
    }
  }
}
```

Key benefits of this approach:
1. **Proper dependency injection**: Components receive the correct injector
2. **Change detection**: Components are properly integrated with Angular's change detection
3. **Service integration**: Components can access services from the shell or their own micro frontend
4. **Event handling**: Events bubble up correctly through the component hierarchy

## UI Implementation for Direct Communication

The UI components in both micro frontends were enhanced to support direct communication. Each micro frontend includes:

1. **Dual Communication Panels**: Separate UI panels for shell communication and direct micro frontend communication
2. **Reactive UI Elements**: Using signals to automatically update the UI when messages are received
3. **Message Input Forms**: Dedicated input fields and buttons for sending messages to different targets
4. **Message List Display**: Showing all received messages with metadata and timestamps

Here's an example of the UI template from Feature One App showing the message list for communications:

```html
<div class="communication-panel feature-two-communication">
  <h2>Feature Two Communication Status: {{ featureTwoCommunicationStatus() }}</h2>
  <div class="message-count">Messages from Feature Two: {{ messagesFromFeatureTwo().length }}</div>
  
  <div class="message-list">
    <h3>Messages from Feature Two App:</h3>
    
    @if (messagesFromFeatureTwo().length === 0) {
      <div class="no-messages">No messages received yet</div>
    } @else {
      @for (message of messagesFromFeatureTwo(); track message.timestamp) {
        <div class="message-item">
          <div class="message-content">{{ message.payload }}</div>
          <div class="message-metadata">
            <h4>Message Details:</h4>
            <ul>
              <li><strong>From:</strong> {{ message.from }}</li>
              <li><strong>To:</strong> {{ message.to }}</li>
              <li><strong>Type:</strong> {{ message.type }}</li>
              <li><strong>Sent:</strong> {{ message.timestamp | date:'medium' }}</li>
            </ul>
          </div>
        </div>
      }
    }
  </div>
  
  <div class="message-sender">
    <h3>Send Message to Feature Two:</h3>
    <div class="input-group">
      <input [ngModel]="messageToFeatureTwo()" (ngModelChange)="messageToFeatureTwo.set($event)" placeholder="Enter message..." />
      <button (click)="sendMessageToFeatureTwo()">Send</button>
    </div>
  </div>
</div>
```

This enhanced UI approach provides:

1. **Message History**: Shows all messages received instead of just the latest one
2. **Message Sorting**: Messages are displayed in the order they were received
3. **Empty State Handling**: Shows a helpful message when no messages have been received
4. **Clean Visual Design**: Each message is displayed in a card-like container with clear metadata
5. **Message Counts**: Shows the total number of messages received from each source

The approach is consistent across all micro frontends, making the UI intuitive and providing a comprehensive view of the communication between applications.

## Technical Challenges and Solutions

### Challenge 1: Type Safety Across Boundaries

**Problem**: Ensuring type safety across independent applications that are built and deployed separately.

**Solution**: We created a shared types package published as an NPM module. This provides consistent type definitions across all applications, enabling the TypeScript compiler to catch type errors during development.

### Challenge 2: Service Initialization Order

**Problem**: Ensuring the communication service is initialized before micro frontends try to use it.

**Solution**: We implemented a lazy initialization approach in the micro frontend services that gracefully handles cases where the centralized API is not yet available. This prevents errors and ensures messages are sent once the API is ready.

```typescript
ngOnInit() {
  // Make sure communication service is initialized
  if (!window.CentralizedAPI) {
    console.log('Initializing Communication Service in All Micro Frontends View');
    this.communicationService.init();
  }
}
```

### Challenge 3: Component Integration

**Problem**: Components created dynamically weren't properly integrated with Angular's dependency injection system.

**Solution**: We used `ViewContainerRef.createComponent()` with an explicit `environmentInjector` to ensure components had access to the correct providers.

### Challenge 4: Message Routing

**Problem**: Ensuring messages are delivered to the correct micro frontend without tight coupling.

**Solution**: We implemented a message routing system based on explicit `from` and `to` fields in each message, with a centralized store that all micro frontends can access.

## Best Practices

Based on our implementation, we recommend the following best practices for micro frontend communication:

1. **Shared Types**: Use a shared types package for interfaces used across micro frontends
2. **Clear Ownership**: Each message has an explicit source and target
3. **Event-Based Communication**: Use custom events for cross-boundary communication
4. **Reactive Patterns**: Use signals or observables for reactive UI updates
5. **Loose Coupling**: Micro frontends should not have direct references to each other's internal implementation
6. **Error Handling**: Gracefully handle cases where services or APIs are not yet available
7. **ViewContainerRef**: Use ViewContainerRef for dynamic component creation
8. **Explicit Initialization**: Check and initialize communication services when needed
9. **Dependency Injection**: Provide proper injectors for dynamically created components
10. **Change Detection**: Call detectChanges() after dynamic component creation
11. **Named Endpoints**: Use consistent naming conventions for micro frontends, preferably with environment variables

## Conclusion

The communication architecture described in this document provides a robust, type-safe, and maintainable way for micro frontends to communicate. By leveraging Angular's latest features like signals, standalone components, and modern dependency injection, we've created a system that is both powerful and developer-friendly.

Our implementation supports three key communication patterns:

1. Shell-to-micro frontend communication
2. Micro frontend-to-shell communication
3. Direct micro frontend-to-micro frontend communication

This flexibility enables complex interactions between components while maintaining clean separation of concerns and preserving the independent nature of micro frontends.

This architecture can be extended with additional features such as:

- Message filtering and prioritization
- Complex state synchronization across micro frontends
- Advanced error handling and retry mechanisms
- Broadcast messaging to multiple recipients
- Message acknowledgment and response tracking

The patterns and practices described here can be adapted to various micro frontend architectures beyond Module Federation, such as iframes, Web Components, or custom element integrations.