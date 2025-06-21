import { supabaseAdmin } from '@/config/supabase';
import { BaseService } from './database/base.service';

export interface ScheduledReport {
  id: string;
  name: string;
  description?: string;
  report_type: 'demographics' | 'financial' | 'services' | 'operational' | 'comprehensive';
  format: 'pdf' | 'csv' | 'excel' | 'json';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  schedule_time: string; // HH:MM format
  schedule_day?: number; // Day of month for monthly/quarterly/yearly
  schedule_weekday?: number; // Day of week for weekly (0=Sunday)
  recipients: string[]; // Email addresses
  filters?: Record<string, any>;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_run?: string;
  next_run?: string;
}

export interface ReportExecution {
  id: string;
  scheduled_report_id: string;
  execution_date: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  file_path?: string;
  file_size?: number;
  error_message?: string;
  execution_time_ms?: number;
  created_at: string;
}

export class ReportSchedulingService extends BaseService {
  private readonly tableName = 'scheduled_reports';
  private readonly executionTableName = 'report_executions';

  /**
   * Create a new scheduled report
   */
  async createScheduledReport(data: Omit<ScheduledReport, 'id' | 'created_at' | 'updated_at' | 'next_run'>): Promise<ScheduledReport> {
    try {
      const nextRun = this.calculateNextRun(data.frequency, data.schedule_time, data.schedule_day, data.schedule_weekday);
      
      const insertData = {
        id: this.generateId(),
        ...data,
        next_run: nextRun,
        created_at: this.getCurrentTimestamp(),
        updated_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from(this.tableName)
        .insert(insertData)
        .select()
        .single();

      return await this.executeQuery<ScheduledReport>(query, 'create scheduled report');
    } catch (error) {
      this.handleError(error, 'create scheduled report');
    }
  }

  /**
   * Get all scheduled reports
   */
  async getScheduledReports(userId?: string): Promise<ScheduledReport[]> {
    try {
      let query = this.client
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('created_by', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      this.handleError(error, 'get scheduled reports');
    }
  }

  /**
   * Update scheduled report
   */
  async updateScheduledReport(id: string, updates: Partial<ScheduledReport>): Promise<ScheduledReport> {
    try {
      const updateData = {
        ...updates,
        updated_at: this.getCurrentTimestamp(),
      };

      // Recalculate next run if schedule parameters changed
      if (updates.frequency || updates.schedule_time || updates.schedule_day || updates.schedule_weekday) {
        const report = await this.getScheduledReportById(id);
        updateData.next_run = this.calculateNextRun(
          updates.frequency || report.frequency,
          updates.schedule_time || report.schedule_time,
          updates.schedule_day || report.schedule_day,
          updates.schedule_weekday || report.schedule_weekday
        );
      }

      const query = this.client
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      return await this.executeQuery<ScheduledReport>(query, 'update scheduled report');
    } catch (error) {
      this.handleError(error, 'update scheduled report');
    }
  }

  /**
   * Delete scheduled report
   */
  async deleteScheduledReport(id: string): Promise<void> {
    try {
      const query = this.client
        .from(this.tableName)
        .delete()
        .eq('id', id);

      await this.executeQuery(query, 'delete scheduled report');
    } catch (error) {
      this.handleError(error, 'delete scheduled report');
    }
  }

  /**
   * Get scheduled report by ID
   */
  async getScheduledReportById(id: string): Promise<ScheduledReport> {
    try {
      const query = this.client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      return await this.executeQuery<ScheduledReport>(query, 'get scheduled report by id');
    } catch (error) {
      this.handleError(error, 'get scheduled report by id');
    }
  }

  /**
   * Get reports due for execution
   */
  async getReportsDueForExecution(): Promise<ScheduledReport[]> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .lte('next_run', now);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      this.handleError(error, 'get reports due for execution');
    }
  }

  /**
   * Execute a scheduled report
   */
  async executeReport(reportId: string): Promise<ReportExecution> {
    try {
      const report = await this.getScheduledReportById(reportId);
      const startTime = Date.now();

      // Create execution record
      const execution = await this.createReportExecution(reportId, 'running');

      try {
        // Generate the report (this would call the analytics export endpoint)
        const reportData = await this.generateReportData(report);
        const filePath = await this.saveReportFile(report, reportData);
        const fileSize = await this.getFileSize(filePath);

        // Update execution as completed
        const completedExecution = await this.updateReportExecution(execution.id, {
          status: 'completed',
          file_path: filePath,
          file_size: fileSize,
          execution_time_ms: Date.now() - startTime,
        });

        // Send report to recipients
        await this.sendReportToRecipients(report, filePath);

        // Update next run time
        const nextRun = this.calculateNextRun(
          report.frequency,
          report.schedule_time,
          report.schedule_day,
          report.schedule_weekday
        );

        await this.updateScheduledReport(reportId, {
          last_run: new Date().toISOString(),
          next_run: nextRun,
        });

        return completedExecution;
      } catch (error) {
        // Update execution as failed
        await this.updateReportExecution(execution.id, {
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          execution_time_ms: Date.now() - startTime,
        });
        throw error;
      }
    } catch (error) {
      this.handleError(error, 'execute report');
    }
  }

  /**
   * Create report execution record
   */
  private async createReportExecution(scheduledReportId: string, status: 'pending' | 'running'): Promise<ReportExecution> {
    try {
      const insertData = {
        id: this.generateId(),
        scheduled_report_id: scheduledReportId,
        execution_date: this.getCurrentTimestamp(),
        status,
        created_at: this.getCurrentTimestamp(),
      };

      const query = this.client
        .from(this.executionTableName)
        .insert(insertData)
        .select()
        .single();

      return await this.executeQuery<ReportExecution>(query, 'create report execution');
    } catch (error) {
      this.handleError(error, 'create report execution');
    }
  }

  /**
   * Update report execution
   */
  private async updateReportExecution(id: string, updates: Partial<ReportExecution>): Promise<ReportExecution> {
    try {
      const query = this.client
        .from(this.executionTableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return await this.executeQuery<ReportExecution>(query, 'update report execution');
    } catch (error) {
      this.handleError(error, 'update report execution');
    }
  }

  /**
   * Calculate next run time based on frequency and schedule
   */
  private calculateNextRun(
    frequency: string,
    scheduleTime: string,
    scheduleDay?: number,
    scheduleWeekday?: number
  ): string {
    const now = new Date();
    const [hours, minutes] = scheduleTime.split(':').map(Number);
    
    let nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);

    switch (frequency) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;

      case 'weekly':
        const targetWeekday = scheduleWeekday || 0;
        const daysUntilTarget = (targetWeekday - nextRun.getDay() + 7) % 7;
        nextRun.setDate(nextRun.getDate() + daysUntilTarget);
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 7);
        }
        break;

      case 'monthly':
        const targetDay = scheduleDay || 1;
        nextRun.setDate(targetDay);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;

      case 'quarterly':
        const targetQuarterDay = scheduleDay || 1;
        const currentQuarter = Math.floor(nextRun.getMonth() / 3);
        nextRun.setMonth(currentQuarter * 3, targetQuarterDay);
        if (nextRun <= now) {
          nextRun.setMonth((currentQuarter + 1) * 3, targetQuarterDay);
        }
        break;

      case 'yearly':
        const targetYearDay = scheduleDay || 1;
        nextRun.setMonth(0, targetYearDay);
        if (nextRun <= now) {
          nextRun.setFullYear(nextRun.getFullYear() + 1);
        }
        break;
    }

    return nextRun.toISOString();
  }

  /**
   * Generate report data (placeholder - would integrate with analytics service)
   */
  private async generateReportData(report: ScheduledReport): Promise<any> {
    // This would call the analytics service to generate the actual report data
    return {
      reportType: report.report_type,
      generatedAt: new Date().toISOString(),
      data: {}, // Actual data would be fetched here
    };
  }

  /**
   * Save report file (placeholder)
   */
  private async saveReportFile(report: ScheduledReport, data: any): Promise<string> {
    // This would save the file to storage (local filesystem or cloud storage)
    const filename = `${report.name}-${Date.now()}.${report.format}`;
    const filePath = `/reports/${filename}`;
    
    // Save file logic here
    
    return filePath;
  }

  /**
   * Get file size (placeholder)
   */
  private async getFileSize(filePath: string): Promise<number> {
    // This would get the actual file size
    return 1024; // Placeholder
  }

  /**
   * Send report to recipients (placeholder)
   */
  private async sendReportToRecipients(report: ScheduledReport, filePath: string): Promise<void> {
    // This would send the report via email to the recipients
    console.log(`Sending report ${report.name} to ${report.recipients.join(', ')}`);
  }
}

export const reportSchedulingService = new ReportSchedulingService();
