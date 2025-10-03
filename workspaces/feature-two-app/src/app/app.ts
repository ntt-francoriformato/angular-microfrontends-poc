import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { CommunicationService } from './services/communication-service';

@Component({
  selector: 'app-two',
  standalone: true,
  imports: [RouterOutlet, FormsModule, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class FeatureTwoApp {
  protected readonly title = signal('feature-two-app');
  
  private readonly communicationService = inject(CommunicationService);
  
  // Message to send to the shell
  protected readonly messageToSend = signal<string>('Hello from Feature Two!');
  
  // Message to send to feature-one-app
  protected readonly messageToFeatureOne = signal<string>('Hello from Feature Two!');
  
  // Access to all messages
  protected readonly allMessages = this.communicationService.messages;
  
  // Computed properties to get messages from specific sources
  protected readonly messagesFromShell = computed(() => 
    this.communicationService.getMessagesFrom('application-shell')
  );
  
  protected readonly messagesFromFeatureOne = computed(() => 
    this.communicationService.getMessagesFrom('feature-one-app')
  );
  
  // Computed value showing the communication status with shell
  protected readonly communicationStatus = computed(() => {
    return this.messagesFromShell().length > 0 ? 'Active - Messages Received' : 'Waiting for message';
  });
  
  // Computed value showing the communication status with feature-one
  protected readonly featureOneCommunicationStatus = computed(() => {
    return this.messagesFromFeatureOne().length > 0 ? 'Active - Messages Received' : 'Waiting for message';
  });
  
  // Computed to get total message count
  protected readonly totalMessageCount = computed(() => 
    this.allMessages().length
  );

  constructor() {
    // Initialize by sending a default message
    this.sendMessageToShell();
  }
  
  /**
   * Sends a message to the application shell
   */
  sendMessageToShell(): void {
    this.communicationService.sendMessageTo(this.messageToSend(), 'application-shell');
  }
  
  /**
   * Sends a message to feature-one-app
   */
  sendMessageToFeatureOne(): void {
    this.communicationService.sendMessageTo(this.messageToFeatureOne(), 'feature-one-app');
  }
}
