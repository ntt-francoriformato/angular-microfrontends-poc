import { Injectable, signal } from '@angular/core';
import {
  ChangedDataEvent,
  MicroFrontendApi,
  MicroFrontendMessage,
} from '@angular-microfrontends-poc/shared-types';
import { environment } from '../../environments/environment';

/**
 * Service responsible for handling communication between micro frontends
 */
@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  // The name of this micro frontend
  private readonly appName = environment.appName;

  // Signal to reactively track all messages directed to this app
  readonly messages = signal<MicroFrontendMessage<string>[]>([]);

  /**
   * Gets the API for this micro frontend from the centralized API
   * @returns The API for this micro frontend or undefined if not available
   */
  private getAppApi(): MicroFrontendApi | undefined {
    return window.CentralizedAPI?.[this.appName];
  }

  constructor() {
    // Set up the communication listener
    this.setupMessageListener();
  }

  /**
   * Sends a message to another micro frontend
   */
  sendMessageTo(message: string, to: string, type: string = 'default') {
    // Use the feature-one API to send a message to another micro frontend
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

  /**
   * Gets messages from a specific source
   * @param source The source micro frontend name
   * @returns Array of messages from the specified source
   */
  getMessagesFrom(source: string): MicroFrontendMessage<string>[] {
    return this.messages().filter((msg) => msg.from === source);
  }
}
