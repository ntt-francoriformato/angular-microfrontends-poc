import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { CommunicationService } from './services/communication-service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-one',
  standalone: true,
  imports: [RouterOutlet, FormsModule, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class FeatureOneApp {
  protected readonly title = signal('feature-one-app');

  private readonly communicationService = inject(CommunicationService);

  // Message to send to the shell
  protected readonly messageToSend = signal<string>('');

  // Message to send to feature-two-app
  protected readonly messageToFeatureTwo = signal<string>('Hello from Feature One!');

  // Access to all messages
  protected readonly allMessages = this.communicationService.messages;

  // Computed properties to get messages from specific sources
  protected readonly messagesFromShell = computed(() =>
    this.communicationService.getMessagesFrom(environment.shellName)
  );

  protected readonly messagesFromFeatureTwo = computed(() =>
    this.communicationService.getMessagesFrom('feature-two-app')
  );

  // Computed value showing the communication status with shell
  protected readonly communicationStatus = computed(() => {
    return this.messagesFromShell().length > 0
      ? 'Active - Messages Received'
      : 'Waiting for message';
  });

  // Computed value showing the communication status with feature-two
  protected readonly featureTwoCommunicationStatus = computed(() => {
    return this.messagesFromFeatureTwo().length > 0
      ? 'Active - Messages Received'
      : 'Waiting for message';
  });

  // Computed to get total message count
  protected readonly totalMessageCount = computed(() => this.allMessages().length);

  /**
   * Sends a message to the application shell
   */
  sendMessageToShell(): void {
    this.communicationService.sendMessageTo(this.messageToSend(), environment.shellName);
  }

  /**
   * Sends a message to feature-two-app
   */
  sendMessageToFeatureTwo(): void {
    this.communicationService.sendMessageTo(this.messageToFeatureTwo(), 'feature-two-app');
  }
}
