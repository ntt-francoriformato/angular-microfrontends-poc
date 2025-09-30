/**
 * Type definitions for the micro frontend communication API
 * 
 * This file contains all the shared types for communication between micro frontends.
 * It is published as an NPM package that all micro frontends can depend on.
 */

// Message data that can be shared between micro frontends
export interface MicroFrontendMessage<T = unknown> {
  from: string;      // Source micro frontend
  to: string;        // Target micro frontend
  type: string;      // Message type for categorization
  payload: T;        // The actual message content
  timestamp: number; // When the message was sent
}

// Event detail for the message event
export interface ChangedDataEvent<T = unknown> {
  message: MicroFrontendMessage<T>;
  previous?: MicroFrontendMessage<T>;
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