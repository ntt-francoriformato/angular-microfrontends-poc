import Microfrontends from '../../assets/mf.manifest.json';
import { Injectable, signal } from '@angular/core';
import { CentralizedApi, ChangedDataEvent, MicroFrontendApi, MicroFrontendMessage } from '@angular-microfrontends-poc/shared-types';

/**
 * Service responsible for managing communication between the application shell and micro frontends
 */
@Injectable({
  providedIn: 'root',
})
export class MicroFrontendsCommunicationService {
  private readonly microfrontends = Object.keys(Microfrontends);
  private readonly SHELL_NAME = 'application-shell';
  
  // Message store for all micro frontends
  private readonly messageStore: MicroFrontendMessage<any>[] = [];
  
  // Signals to track messages by type and target
  readonly messageSignals = new Map<string, ReturnType<typeof signal<MicroFrontendMessage<any> | undefined>>>();
  
  constructor() {
    // Initialize signals for common message types
    this.initializeSignals();
  }

  /**
   * Initialize the message signals for tracking different message types
   */
  private initializeSignals(): void {
    // Add signals for all micro frontends by default message type
    this.microfrontends.forEach((mfName) => {
      // Signal for tracking messages from each micro frontend to the shell
      this.messageSignals.set(`${mfName}:default`, signal<MicroFrontendMessage<any> | undefined>(undefined));
      
      // Signal for tracking messages from the shell to each micro frontend
      this.messageSignals.set(`${this.SHELL_NAME}:${mfName}:default`, signal<MicroFrontendMessage<any> | undefined>(undefined));
    });
  }

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

    console.log('MicroFrontendsCommunicationService initialized');
  }

  /**
   * Creates a type-safe API for a specific micro frontend
   * @param owner The name of the micro frontend owner
   * @returns A type-safe API for the micro frontend
   */
  private createApiForMicroFrontend(owner: string): MicroFrontendApi {
    return {
      getMessages: <T = unknown>(filterType?: string): MicroFrontendMessage<T>[] => {
        return this.messageStore
          .filter(msg => msg.to === owner && (!filterType || msg.type === filterType))
          .map(msg => msg as MicroFrontendMessage<T>);
      },
      
      getLatestMessage: <T = unknown>(type: string): MicroFrontendMessage<T> | undefined => {
        // Find the latest message of the given type sent to this owner
        const messages = this.messageStore
          .filter(msg => msg.to === owner && msg.type === type)
          .sort((a, b) => b.timestamp - a.timestamp);
          
        return messages[0] as MicroFrontendMessage<T> | undefined;
      },
      
      sendMessage: <T = unknown>(to: string, type: string, payload: T): void => {
        // Create a new message
        const message: MicroFrontendMessage<T> = {
          from: owner,
          to,
          type,
          payload,
          timestamp: Date.now()
        };
        
        // Add to the message store
        this.messageStore.push(message);
        
        // Dispatch event to notify listeners
        window.dispatchEvent(new CustomEvent<ChangedDataEvent<T>>('message-event', {
          detail: {
            message: message as MicroFrontendMessage<any>,
          }
        }));
        
        console.log(`Message sent from ${owner} to ${to}:`, message);
      }
    };
  }
  
  /**
   * Sets up the communication listeners for all micro frontends
   */
  private setupCommunication(): void {
    // Listen for message events
    window.addEventListener('message-event', ((event: Event) => {
      const customEvent = event as CustomEvent<ChangedDataEvent<any>>;
      const { message } = customEvent.detail;
      
      // Update the appropriate signal based on the message
      if (message) {
        const { from, to, type } = message;
        
        // Create signal key based on from, to and type
        const signalKey = `${from}:${to}:${type}`;
        let signalRef = this.messageSignals.get(signalKey);
        
        if (!signalRef) {
          // Create a new signal if one doesn't exist for this message pattern
          signalRef = signal<MicroFrontendMessage<any> | undefined>(undefined);
          this.messageSignals.set(signalKey, signalRef);
        }
        
        // Update the signal value
        signalRef.set(message);
        
        // Also update a generic signal for this source-target pair
        const defaultSignalKey = `${from}:${to}:default`;
        const defaultSignal = this.messageSignals.get(defaultSignalKey) || 
                              signal<MicroFrontendMessage<any> | undefined>(undefined);
        this.messageSignals.set(defaultSignalKey, defaultSignal);
        defaultSignal.set(message);
        
        console.log(`Received message from ${from} to ${to}:`, message);
      }
    }) as EventListener);
  }
  
  /**
   * Sends a message from the shell to a specific micro frontend
   * @param targetMf The name of the target micro frontend
   * @param type The message type
   * @param payload The message payload
   */
  sendMessageToMicroFrontend<T = unknown>(targetMf: string, type: string, payload: T): void {
    const shellApi = window.CentralizedAPI?.[this.SHELL_NAME];
    if (shellApi) {
      shellApi.sendMessage(targetMf, type, payload);
    } else {
      console.warn('Shell API not available. Make sure the communication service is initialized.');
    }
  }
  
  /**
   * Gets a signal for messages of a specific type between two micro frontends
   * @param fromMf The source micro frontend
   * @param toMf The target micro frontend
   * @param type The message type
   * @returns A signal with the latest message
   */
  getMessageSignal<T = unknown>(fromMf: string, toMf: string, type: string = 'default'): ReturnType<typeof signal<MicroFrontendMessage<T> | undefined>> {
    const signalKey = `${fromMf}:${toMf}:${type}`;
    let signalRef = this.messageSignals.get(signalKey);
    
    if (!signalRef) {
      signalRef = signal<MicroFrontendMessage<T> | undefined>(undefined);
      this.messageSignals.set(signalKey, signalRef);
    }
    
    return signalRef as ReturnType<typeof signal<MicroFrontendMessage<T> | undefined>>;
  }
}
