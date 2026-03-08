// In-memory job queue for campaign management
// Simulates Bull or similar queue system for scheduling outbound voice calls

export interface CampaignJob {
  id: string;
  campaignId: string;
  patientId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retry';
  retries: number;
  maxRetries: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: {
    callDuration: number;
    appointmentBooked: boolean;
    appointmentId?: string;
    notes: string;
  };
}

export interface CampaignJobConfig {
  campaignId: string;
  patientIds: string[];
  maxConcurrent: number;
  maxRetries: number;
  retryDelay: number; // milliseconds
}

class CampaignQueue {
  private jobs: Map<string, CampaignJob> = new Map();
  private queue: string[] = []; // IDs of jobs to process
  private processing: Set<string> = new Set(); // Currently processing job IDs
  private maxConcurrent: number = 3;
  private processInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startProcessing();
  }

  /**
   * Add jobs to queue for a campaign
   */
  addCampaignJobs(config: CampaignJobConfig): CampaignJob[] {
    const jobs: CampaignJob[] = [];

    for (const patientId of config.patientIds) {
      const job: CampaignJob = {
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        campaignId: config.campaignId,
        patientId,
        status: 'pending',
        retries: 0,
        maxRetries: config.maxRetries,
        createdAt: new Date(),
      };

      this.jobs.set(job.id, job);
      this.queue.push(job.id);
      jobs.push(job);
    }

    return jobs;
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): CampaignJob | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Get all jobs for a campaign
   */
  getCampaignJobs(campaignId: string): CampaignJob[] {
    return Array.from(this.jobs.values()).filter(
      (job) => job.campaignId === campaignId
    );
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
  } {
    const jobs = Array.from(this.jobs.values());

    return {
      pending: jobs.filter((j) => j.status === 'pending').length,
      processing: jobs.filter((j) => j.status === 'processing').length,
      completed: jobs.filter((j) => j.status === 'completed').length,
      failed: jobs.filter((j) => j.status === 'failed').length,
      total: jobs.length,
    };
  }

  /**
   * Get campaign progress
   */
  getCampaignProgress(campaignId: string): {
    total: number;
    completed: number;
    failed: number;
    pending: number;
    percentComplete: number;
  } {
    const jobs = this.getCampaignJobs(campaignId);

    return {
      total: jobs.length,
      completed: jobs.filter((j) => j.status === 'completed').length,
      failed: jobs.filter((j) => j.status === 'failed').length,
      pending: jobs.filter((j) => j.status === 'pending').length,
      percentComplete:
        jobs.length > 0
          ? Math.round(
              (jobs.filter((j) => j.status === 'completed').length /
                jobs.length) *
                100
            )
          : 0,
    };
  }

  /**
   * Mark job as processing
   */
  private markProcessing(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'processing';
      job.startedAt = new Date();
      this.processing.add(jobId);
    }
  }

  /**
   * Mark job as completed
   */
  markCompleted(
    jobId: string,
    result: CampaignJob['result']
  ): CampaignJob | null {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    job.status = 'completed';
    job.completedAt = new Date();
    job.result = result;
    this.processing.delete(jobId);

    return job;
  }

  /**
   * Mark job as failed
   */
  markFailed(jobId: string, error: string): CampaignJob | null {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    job.error = error;
    this.processing.delete(jobId);

    // Retry logic
    if (job.retries < job.maxRetries) {
      job.status = 'retry';
      job.retries += 1;
      this.queue.push(jobId); // Re-queue for retry
    } else {
      job.status = 'failed';
    }

    return job;
  }

  /**
   * Process next job in queue
   */
  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    this.markProcessing(jobId);

    try {
      console.log(`[v0] Processing job ${jobId} for patient ${job.patientId}`);

      // Simulate outbound call/campaign execution
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock result
      const result = {
        callDuration: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
        appointmentBooked: Math.random() > 0.5,
        appointmentId: Math.random() > 0.5
          ? `apt_${Math.random().toString(36).substr(2, 9)}`
          : undefined,
        notes: 'Campaign call completed successfully',
      };

      this.markCompleted(jobId, result);
      console.log(`[v0] Job ${jobId} completed successfully`);
    } catch (error) {
      this.markFailed(jobId, String(error));
      console.error(`[v0] Job ${jobId} failed:`, error);
    }
  }

  /**
   * Start processing queue
   */
  private startProcessing(): void {
    this.processInterval = setInterval(async () => {
      while (
        this.queue.length > 0 &&
        this.processing.size < this.maxConcurrent
      ) {
        const jobId = this.queue.shift();
        if (jobId) {
          await this.processJob(jobId);
        }
      }
    }, 1000);
  }

  /**
   * Stop processing queue
   */
  stopProcessing(): void {
    if (this.processInterval) {
      clearInterval(this.processInterval);
    }
  }

  /**
   * Clear completed jobs
   */
  clearCompleted(): void {
    const jobsToDelete: string[] = [];

    for (const [jobId, job] of this.jobs.entries()) {
      if (job.status === 'completed' && job.completedAt) {
        const ageMs = new Date().getTime() - job.completedAt.getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;

        if (ageMs > oneDayMs) {
          jobsToDelete.push(jobId);
        }
      }
    }

    for (const jobId of jobsToDelete) {
      this.jobs.delete(jobId);
    }
  }

  /**
   * Get queue info
   */
  getQueueInfo(): {
    queueLength: number;
    processing: number;
    totalJobs: number;
  } {
    return {
      queueLength: this.queue.length,
      processing: this.processing.size,
      totalJobs: this.jobs.size,
    };
  }
}

// Global queue instance
export const campaignQueue = new CampaignQueue();

/**
 * Helper to format campaign job status
 */
export function formatJobStatus(job: CampaignJob): string {
  const lines: string[] = [];

  lines.push(`Job ID: ${job.id}`);
  lines.push(`Status: ${job.status}`);
  lines.push(`Patient ID: ${job.patientId}`);
  lines.push(`Retries: ${job.retries}/${job.maxRetries}`);

  if (job.error) {
    lines.push(`Error: ${job.error}`);
  }

  if (job.result) {
    lines.push(`Call Duration: ${job.result.callDuration}s`);
    lines.push(`Appointment Booked: ${job.result.appointmentBooked}`);
  }

  return lines.join('\n');
}
