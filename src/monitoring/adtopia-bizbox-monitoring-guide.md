# AdTopia.io and BizBox.AI Monitoring Guide

This guide details the specific adaptations necessary to monitor AdTopia.io's ad generation and BizBox.AI's landing page generation services.

## AdTopia.io Metrics

### Key Metrics to Monitor

1. **Ad Generation Performance**
   - Generation time by ad type
   - Success/failure rates
   - Resource consumption during generation

2. **Ad Effectiveness**
   - Click-through rates by ad type
   - Conversion rates
   - Impression counts

3. **User Engagement**
   - Popular ad types
   - Average session duration
   - Session counts by user segment

### Implementing AdTopia-Specific Instrumentation

#### 1. Ad Generation Service

```typescript
// In services/ad-generation.service.ts

import { metricsService } from './metrics.service';

export class AdGenerationService {
  async generateAd(options: AdGenerationOptions): Promise<AdResult> {
    const startTime = Date.now();
    const adType = options.type || 'standard';

    // Record that this ad type was used
    metricsService.adTypeUsage.inc({ ad_type: adType });

    try {
      // Existing ad generation logic
      const result = await this.processAdGeneration(options);
      
      // Record successful generation time
      const duration = (Date.now() - startTime) / 1000;
      metricsService.adGenerationDuration.observe({ ad_type: adType }, duration);
      
      return result;
    } catch (error) {
      // Record failure
      const duration = (Date.now() - startTime) / 1000;
      metricsService.adGenerationDuration.observe({ ad_type: adType }, duration);
      
      // You might also want a specific failure counter
      // This could be added to metrics.service.ts
      metricsService.adGenerationFailures.inc({ ad_type: adType });
      
      throw error;
    }
  }
}
```

#### 2. Ad Analytics Service

```typescript
// In services/ad-analytics.service.ts

import { metricsService } from './metrics.service';

export class AdAnalyticsService {
  // Called when a user views an ad
  recordImpression(adId: string, adType: string): void {
    // Normal database recording logic
    
    // Update metrics
    metricsService.adImpressions.inc({ ad_type: adType });
  }
  
  // Called when a user clicks an ad
  recordClick(adId: string, adType: string): void {
    // Normal database recording logic
    
    // Update metrics
    metricsService.adClicks.inc({ ad_type: adType });
    
    // Recalculate and update CTR
    this.updateClickThroughRate(adType);
  }
  
  // Update the click-through rate metric
  private async updateClickThroughRate(adType: string): Promise<void> {
    // Get counts from database or cache
    const impressions = await this.getImpressionCount(adType);
    const clicks = await this.getClickCount(adType);
    
    if (impressions > 0) {
      const rate = clicks / impressions;
      metricsService.adClickRate.set({ ad_type: adType }, rate);
    }
  }
}
```

## BizBox.AI Metrics

### Key Metrics to Monitor

1. **Landing Page Generation**
   - Generation time by template type
   - Success/failure rates
   - Resource consumption

2. **Landing Page Performance**
   - Conversion rates by template
   - Time on page
   - Bounce rates

3. **CRM Activity**
   - Task queue size
   - Task completion rates
   - User engagement with CRM

### Implementing BizBox-Specific Instrumentation

#### 1. Landing Page Service

```typescript
// In services/landing-page.service.ts

import { metricsService } from './metrics.service';

export class LandingPageService {
  async generateLandingPage(options: LandingPageOptions): Promise<LandingPageResult> {
    const startTime = Date.now();
    const templateType = options.template || 'standard';

    // Record template usage
    metricsService.landingPageTemplateUsage.inc({ template_type: templateType });

    try {
      // Existing landing page generation logic
      const result = await this.processLandingPageGeneration(options);
      
      // Record successful generation time
      const duration = (Date.now() - startTime) / 1000;
      metricsService.landingPageGenerationDuration.observe({ template_type: templateType }, duration);
      
      return result;
    } catch (error) {
      // Record failure
      const duration = (Date.now() - startTime) / 1000;
      metricsService.landingPageGenerationDuration.observe({ template_type: templateType }, duration);
      
      throw error;
    }
  }
}
```

#### 2. Landing Page Analytics

```typescript
// In services/landing-page-analytics.service.ts

import { metricsService } from './metrics.service';

export class LandingPageAnalyticsService {
  // Record a page view
  recordPageView(pageId: string, templateType: string): void {
    // Normal database recording logic
    
    // Update metrics
    metricsService.landingPageViews.inc({ template_type: templateType });
  }
  
  // Record a conversion
  recordConversion(pageId: string, templateType: string): void {
    // Normal database recording logic
    
    // Update metrics
    metricsService.landingPageConversions.inc({ template_type: templateType });
    
    // Recalculate and update conversion rate
    this.updateConversionRate(templateType);
  }
  
  // Update the conversion rate metric
  private async updateConversionRate(templateType: string): Promise<void> {
    // Get counts from database or cache
    const views = await this.getViewCount(templateType);
    const conversions = await this.getConversionCount(templateType);
    
    if (views > 0) {
      const rate = conversions / views;
      metricsService.landingPageConversionRate.set({ template_type: templateType }, rate);
    }
  }
}
```

#### 3. CRM Service

```typescript
// In services/crm.service.ts

import { metricsService } from './metrics.service';

export class CrmService {
  // Called when adding a new task
  async addTask(task: CrmTask): Promise<void> {
    // Normal database insertion logic
    
    // Update queue size metric after adding the task
    const queueSize = await this.getQueueSize();
    metricsService.crmTaskQueueSize.set(queueSize);
  }
  
  // Called when completing a task
  async completeTask(taskId: string): Promise<void> {
    // Normal database update logic
    
    // Update queue size metric after completing the task
    const queueSize = await this.getQueueSize();
    metricsService.crmTaskQueueSize.set(queueSize);
    
    // Record task completion
    metricsService.crmTaskCompletions.inc();
  }
  
  // Calculate task processing time
  calculateAverageProcessingTime(): Promise<number> {
    // Logic to calculate average processing time
    
    // Update the metric
    const avgTime = await this.getAverageProcessingTimeFromDb();
    metricsService.crmTaskAverageProcessingTime.set(avgTime);
    
    return avgTime;
  }
}
```

## Image Generation Metrics (Common to Both Services)

Both AdTopia.io and BizBox.AI utilize image generation services from various sources (ComfyUI, Unsplash, Pexels). These should be monitored:

```typescript
// In services/image-service.ts

import { metricsService } from './metrics.service';

export class ImageService {
  async generateImage(prompt: string, source: string = 'comfyui'): Promise<ImageResult> {
    const startTime = Date.now();
    
    // Record attempt
    metricsService.imageGenerationAttempts.inc({ source });
    
    try {
      // Existing image generation logic
      const result = await this.processImageGeneration(prompt, source);
      
      // Record successful generation time
      const duration = (Date.now() - startTime) / 1000;
      metricsService.imageGenerationDuration.observe({ source }, duration);
      
      return result;
    } catch (error) {
      // Record failure
      metricsService.imageGenerationFailures.inc({ source });
      
      const duration = (Date.now() - startTime) / 1000;
      metricsService.imageGenerationDuration.observe({ source }, duration);
      
      throw error;
    }
  }
  
  async fetchStockImage(query: string, source: string = 'unsplash'): Promise<ImageResult> {
    const startTime = Date.now();
    
    // Record attempt
    metricsService.stockImageFetchAttempts.inc({ source });
    
    try {
      // Existing stock image fetch logic
      const result = await this.processStockImageFetch(query, source);
      
      // Record successful fetch time
      const duration = (Date.now() - startTime) / 1000;
      metricsService.stockImageFetchDuration.observe({ source }, duration);
      
      return result;
    } catch (error) {
      // Record failure
      metricsService.stockImageFetchFailures.inc({ source });
      
      const duration = (Date.now() - startTime) / 1000;
      metricsService.stockImageFetchDuration.observe({ source }, duration);
      
      throw error;
    }
  }
}
```

## Alert Rules Specific to AdTopia.io and BizBox.AI

### AdTopia.io Alert Rules

```yaml
- alert: HighAdGenerationTime
  expr: ad_generation_duration_seconds > 30
  for: 5m
  labels:
    severity: warning
    service: adtopia
  annotations:
    summary: "Ad generation taking too long"
    description: "Ad generation for type {{ $labels.ad_type }} is taking more than 30 seconds consistently."

- alert: LowAdClickThroughRate
  expr: ad_click_rate < 0.01
  for: 24h
  labels:
    severity: warning
    service: adtopia
  annotations:
    summary: "Low ad click-through rate"
    description: "Ad type {{ $labels.ad_type }} has a click-through rate below 1% for the past 24 hours."
```

### BizBox.AI Alert Rules

```yaml
- alert: HighLandingPageGenerationTime
  expr: landing_page_generation_duration_seconds > 60
  for: 5m
  labels:
    severity: warning
    service: bizbox
  annotations:
    summary: "Landing page generation taking too long"
    description: "Landing page generation for template {{ $labels.template_type }} is taking more than 60 seconds consistently."

- alert: LowLandingPageConversionRate
  expr: landing_page_conversion_rate < 0.02
  for: 24h
  labels:
    severity: warning
    service: bizbox
  annotations:
    summary: "Low landing page conversion rate"
    description: "Landing page template {{ $labels.template_type }} has a conversion rate below 2% for the past 24 hours."

- alert: HighCrmTaskBacklog
  expr: crm_task_queue_size > 100
  for: 30m
  labels:
    severity: warning
    service: bizbox
  annotations:
    summary: "Large CRM task backlog"
    description: "The CRM task queue has more than 100 pending tasks for over 30 minutes."
```

## Combined Custom Dashboard for AdTopia.io and BizBox.AI

For optimal monitoring, create a custom dashboard that shows metrics from both services in relevant groupings:

### Dashboard Sections

1. **Overview Section**
   - System health indicators
   - Service uptime
   - Active users
   - Error rates

2. **Ad Generation Performance**
   - Generation times by ad type
   - Success rates
   - Popular ad types
   - Click-through rates

3. **Landing Page Performance**
   - Generation times by template
   - Conversion rates
   - Popular templates
   - User engagement metrics

4. **Image Generation**
   - Generation times by source
   - Success rates
   - API quota usage
   - Generation volume

5. **CRM Activity**
   - Task queue size
   - Task completion rate
   - Average processing time
   - User engagement

## Deployment Considerations

When deploying the monitoring stack:

1. **Resource Allocation**
   - Allocate adequate resources to Prometheus and Grafana based on metrics volume
   - Use persistent storage for long-term metrics retention

2. **Security**
   - Restrict access to the metrics endpoint with proper authentication
   - Use TLS for all monitoring traffic
   - Implement appropriate RBAC in Grafana

3. **Integration with Third-Party Services**
   - Configure alert notifications to relevant Slack channels
   - Consider integrating with PagerDuty or similar for critical alerts

4. **Scalability**
   - Plan for metrics volume growth as the userbase expands
   - Consider using Prometheus federation for larger deployments
   - Implement proper retention policies

## Example Testing Script

Below is a simple script to generate test metrics for both services:

```typescript
// test-adtopia-bizbox-metrics.ts

import axios from 'axios';
import { setTimeout } from 'timers/promises';

async function runMetricsTest() {
  const adTypes = ['display', 'search', 'social', 'video'];
  const templateTypes = ['business', 'restaurant', 'real-estate', 'e-commerce', 'portfolio'];
  const imageSources = ['comfyui', 'unsplash', 'pexels', 'internal'];
  
  // Test AdTopia metrics
  for (const adType of adTypes) {
    await axios.get(`http://localhost:5000/api/generate-ad?type=${adType}`);
    await axios.get(`http://localhost:5000/api/ad-metrics?type=${adType}`);
    
    await setTimeout(1000);
  }
  
  // Test BizBox metrics
  for (const templateType of templateTypes) {
    await axios.get(`http://localhost:5000/api/generate-landing-page?template=${templateType}`);
    await axios.get(`http://localhost:5000/api/landing-page-metrics?template=${templateType}`);
    
    await setTimeout(1000);
  }
  
  // Test CRM metrics
  await axios.get('http://localhost:5000/api/crm-task-queue');
  
  // Test image generation metrics
  for (const source of imageSources) {
    await axios.get(`http://localhost:5000/api/generate-image?source=${source}`);
    
    await setTimeout(1000);
  }
  
  // Test AI service health
  await axios.get('http://localhost:5000/api/ai-service-health');
  
  console.log('Metrics test completed. View metrics at http://localhost:5000/metrics');
}

runMetricsTest().catch(console.error);
```

## Conclusion

By implementing these specialized metrics for AdTopia.io and BizBox.AI, you'll gain valuable insights into the performance and usage patterns of both services. This will enable data-driven improvements, faster issue detection, and better resource allocation over time.

Remember to regularly review and adjust alert thresholds based on real-world usage patterns to minimize false positives while ensuring real issues are promptly detected.