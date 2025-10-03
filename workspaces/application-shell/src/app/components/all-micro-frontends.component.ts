import { 
  Component, 
  ViewChild, 
  ViewContainerRef, 
  AfterViewInit,
  OnInit,
  EnvironmentInjector,
  inject
} from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { MicroFrontendsCommunicationService } from '../services/mf-communication.service';

@Component({
  selector: 'app-all-micro-frontends',
  standalone: true,
  template: `
    <div class="all-mfe-container">
      <h2>All Micro Frontends</h2>
      
      <div class="mfe-wrapper">
        <div class="mfe-container feature-one">
          <h3>Feature One App</h3>
          <div #featureOneContainer class="mfe-content"></div>
        </div>
        
        <div class="mfe-container feature-two">
          <h3>Feature Two App</h3>
          <div #featureTwoContainer class="mfe-content"></div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .all-mfe-container {
      padding: 20px;
    }
    
    h2 {
      color: #3f51b5;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .mfe-wrapper {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .mfe-container {
      flex: 1;
      min-width: 300px;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .feature-one {
      border-top: 4px solid #4caf50;
    }
    
    .feature-two {
      border-top: 4px solid #9c27b0;
    }
    
    h3 {
      margin-top: 0;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
  `
})
export class AllMicroFrontendsComponent implements OnInit, AfterViewInit {
  @ViewChild('featureOneContainer', { read: ViewContainerRef }) featureOneContainer!: ViewContainerRef;
  @ViewChild('featureTwoContainer', { read: ViewContainerRef }) featureTwoContainer!: ViewContainerRef;
  
  private environmentInjector = inject(EnvironmentInjector);
  private communicationService = inject(MicroFrontendsCommunicationService);
  
  ngOnInit() {
    // Make sure communication service is initialized
    if (!window.CentralizedAPI) {
      console.log('Initializing Communication Service in All Micro Frontends View');
      this.communicationService.init();
    }
  }
  
  async ngAfterViewInit() {
    await this.loadFeatureOne();
    await this.loadFeatureTwo();
  }
  
  private async loadFeatureOne() {
    try {
      // Load Feature One App
      const featureOneModule = await loadRemoteModule({
        type: 'manifest',
        remoteName: 'feature-one-app',
        exposedModule: './ComponentOne'
      });
      
      // Clear container just in case
      this.featureOneContainer.clear();
      
      // Create the component using the ViewContainerRef to ensure proper Angular integration
      const componentRef = this.featureOneContainer.createComponent(featureOneModule.FeatureOneApp, {
        environmentInjector: this.environmentInjector
      });
      
      // Detect changes to ensure the component renders properly
      componentRef.changeDetectorRef.detectChanges();
      
      console.log('Feature One App loaded successfully');
    } catch (error) {
      console.error('Error loading Feature One App:', error);
    }
  }
  
  private async loadFeatureTwo() {
    try {
      // Load Feature Two App
      const featureTwoModule = await loadRemoteModule({
        type: 'manifest',
        remoteName: 'feature-two-app',
        exposedModule: './ComponentTwo'
      });
      
      // Clear container just in case
      this.featureTwoContainer.clear();
      
      // Create the component using the ViewContainerRef to ensure proper Angular integration
      const componentRef = this.featureTwoContainer.createComponent(featureTwoModule.FeatureTwoApp, {
        environmentInjector: this.environmentInjector
      });
      
      // Detect changes to ensure the component renders properly
      componentRef.changeDetectorRef.detectChanges();
      
      console.log('Feature Two App loaded successfully');
    } catch (error) {
      console.error('Error loading Feature Two App:', error);
    }
  }
}