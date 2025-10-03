import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MicroFrontendsCommunicationService } from './services/mf-communication.service';
import { MicroFrontendMessage } from '@angular-microfrontends-poc/shared-types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly mfeCommunicationService = inject(MicroFrontendsCommunicationService);
  protected readonly title = signal('application-shell');
  
  // The names of the target micro frontends
  private readonly featureOneName = 'feature-one-app';
  private readonly featureTwoName = 'feature-two-app';
  
  // Signals for communication demo
  protected readonly messageToFeatureOne = signal<string>('Hello from Shell to Feature One!');
  protected readonly messageToFeatureTwo = signal<string>('Hello from Shell to Feature Two!');
  
  // Get message signals from the service
  protected readonly messageFromFeatureOne = this.mfeCommunicationService.getMessageSignal(
    this.featureOneName,  // from
    'application-shell',  // to
    'default'             // type
  );
  
  protected readonly messageFromFeatureTwo = this.mfeCommunicationService.getMessageSignal(
    this.featureTwoName,  // from
    'application-shell',  // to
    'default'             // type
  );
  
  // Computed value showing status of messaging system
  protected readonly communicationStatus = computed(() => {
    return this.messageFromFeatureOne() ? 'Active - Message Received' : 'Waiting for message';
  });
  
  // Computed value to extract the message payload for display
  protected readonly messageContent = computed(() => {
    const message = this.messageFromFeatureOne();
    return message ? message.payload : undefined;
  });
  
  // Computed value for displaying message metadata for Feature One
  protected readonly messageMetadata = computed(() => {
    const message = this.messageFromFeatureOne();
    if (!message) return null;
    
    return {
      from: message.from,
      to: message.to,
      type: message.type,
      timestamp: new Date(message.timestamp).toLocaleString()
    };
  });
  
  // Computed value for displaying message metadata for Feature Two
  protected readonly messageMetadataTwo = computed(() => {
    const message = this.messageFromFeatureTwo();
    if (!message) return null;
    
    return {
      from: message.from,
      to: message.to,
      type: message.type,
      timestamp: new Date(message.timestamp).toLocaleString()
    };
  });

  constructor() {
    this.mfeCommunicationService.init();
  }
  
  /**
   * Sends a message to the feature-one micro frontend
   */
  sendMessageToFeatureOne(): void {
    this.mfeCommunicationService.sendMessageToMicroFrontend(
      this.featureOneName, // target micro frontend
      'default',          // message type
      this.messageToFeatureOne() // message payload
    );
  }
  
  /**
   * Sends a message to the feature-two micro frontend
   */
  sendMessageToFeatureTwo(): void {
    this.mfeCommunicationService.sendMessageToMicroFrontend(
      this.featureTwoName, // target micro frontend
      'default',          // message type
      this.messageToFeatureTwo() // message payload
    );
  }
}