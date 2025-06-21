import { BaseService } from './base.service';

export interface AnalyticsFilters {
  date_from?: string;
  date_to?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  category?: string;
}

export interface DemographicData {
  total_population: number;
  age_distribution: Record<string, number>;
  gender_distribution: Record<string, number>;
  civil_status_distribution: Record<string, number>;
  employment_distribution: Record<string, number>;
  education_distribution: Record<string, number>;
  household_statistics: {
    total_households: number;
    average_household_size: number;
    dwelling_types: Record<string, number>;
    ownership_status: Record<string, number>;
  };
}

export interface ServiceUsageData {
  document_requests: {
    total: number;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
    processing_times: {
      average_days: number;
      by_type: Record<string, number>;
    };
    monthly_trends: Array<{ month: string; count: number }>;
  };
  announcements: {
    total: number;
    by_category: Record<string, number>;
    engagement_metrics: {
      total_views: number;
      average_views_per_announcement: number;
    };
  };
  incidents: {
    total: number;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
    resolution_times: {
      average_days: number;
      by_type: Record<string, number>;
    };
  };
}

export interface OperationalMetrics {
  staff_productivity: {
    documents_processed: Record<string, number>;
    average_processing_time: Record<string, number>;
    workload_distribution: Record<string, number>;
  };
  system_usage: {
    active_users: number;
    login_frequency: Record<string, number>;
    feature_usage: Record<string, number>;
  };
  performance_indicators: {
    document_completion_rate: number;
    average_response_time: number;
    user_satisfaction_score: number;
  };
}

export interface FinancialAnalytics {
  revenue_analysis: {
    total_revenue: number;
    revenue_by_source: Record<string, number>;
    monthly_trends: Array<{ month: string; amount: number }>;
  };
  expense_analysis: {
    total_expenses: number;
    expenses_by_category: Record<string, number>;
    budget_utilization: Record<string, { allocated: number; spent: number; percentage: number }>;
  };
  financial_health: {
    net_income: number;
    budget_variance: number;
    cost_per_service: Record<string, number>;
  };
}

export class AnalyticsService extends BaseService {
  /**
   * Get comprehensive demographic analytics
   */
  async getDemographicAnalytics(filters: AnalyticsFilters = {}): Promise<DemographicData> {
    try {
      // Get total population
      const { count: totalPopulation } = await this.client
        .from('residents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active');

      // Get age distribution
      const ageDistribution = await this.getAgeDistribution();
      
      // Get gender distribution
      const genderDistribution = await this.getGenderDistribution();
      
      // Get civil status distribution
      const civilStatusDistribution = await this.getCivilStatusDistribution();
      
      // Get employment distribution
      const employmentDistribution = await this.getEmploymentDistribution();
      
      // Get education distribution
      const educationDistribution = await this.getEducationDistribution();
      
      // Get household statistics
      const householdStats = await this.getHouseholdStatistics();

      return {
        total_population: totalPopulation || 0,
        age_distribution: ageDistribution,
        gender_distribution: genderDistribution,
        civil_status_distribution: civilStatusDistribution,
        employment_distribution: employmentDistribution,
        education_distribution: educationDistribution,
        household_statistics: householdStats,
      };
    } catch (error) {
      this.handleError(error, 'get demographic analytics');
    }
  }

  /**
   * Get service usage analytics
   */
  async getServiceUsageAnalytics(filters: AnalyticsFilters = {}): Promise<ServiceUsageData> {
    try {
      const dateFilter = this.buildDateFilter(filters);

      // Document requests analytics
      const documentAnalytics = await this.getDocumentAnalytics(dateFilter);
      
      // Announcements analytics
      const announcementAnalytics = await this.getAnnouncementAnalytics(dateFilter);
      
      // Incidents analytics
      const incidentAnalytics = await this.getIncidentAnalytics(dateFilter);

      return {
        document_requests: documentAnalytics,
        announcements: announcementAnalytics,
        incidents: incidentAnalytics,
      };
    } catch (error) {
      this.handleError(error, 'get service usage analytics');
    }
  }

  /**
   * Get operational metrics
   */
  async getOperationalMetrics(filters: AnalyticsFilters = {}): Promise<OperationalMetrics> {
    try {
      const dateFilter = this.buildDateFilter(filters);

      // Staff productivity metrics
      const staffProductivity = await this.getStaffProductivityMetrics(dateFilter);
      
      // System usage metrics
      const systemUsage = await this.getSystemUsageMetrics(dateFilter);
      
      // Performance indicators
      const performanceIndicators = await this.getPerformanceIndicators(dateFilter);

      return {
        staff_productivity: staffProductivity,
        system_usage: systemUsage,
        performance_indicators: performanceIndicators,
      };
    } catch (error) {
      this.handleError(error, 'get operational metrics');
    }
  }

  /**
   * Get financial analytics
   */
  async getFinancialAnalytics(filters: AnalyticsFilters = {}): Promise<FinancialAnalytics> {
    try {
      const dateFilter = this.buildDateFilter(filters);

      // Revenue analysis
      const revenueAnalysis = await this.getRevenueAnalysis(dateFilter);
      
      // Expense analysis
      const expenseAnalysis = await this.getExpenseAnalysis(dateFilter);
      
      // Financial health indicators
      const financialHealth = await this.getFinancialHealthIndicators(dateFilter);

      return {
        revenue_analysis: revenueAnalysis,
        expense_analysis: expenseAnalysis,
        financial_health: financialHealth,
      };
    } catch (error) {
      this.handleError(error, 'get financial analytics');
    }
  }

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(filters: AnalyticsFilters = {}): Promise<{
    demographics: DemographicData;
    service_usage: ServiceUsageData;
    operational_metrics: OperationalMetrics;
    financial_analytics: FinancialAnalytics;
    key_performance_indicators: any;
  }> {
    try {
      const [demographics, serviceUsage, operationalMetrics, financialAnalytics] = await Promise.all([
        this.getDemographicAnalytics(filters),
        this.getServiceUsageAnalytics(filters),
        this.getOperationalMetrics(filters),
        this.getFinancialAnalytics(filters),
      ]);

      // Calculate key performance indicators
      const kpis = {
        total_residents: demographics.total_population,
        active_document_requests: serviceUsage.document_requests.total,
        completion_rate: operationalMetrics.performance_indicators.document_completion_rate,
        monthly_revenue: financialAnalytics.revenue_analysis.total_revenue,
        net_income: financialAnalytics.financial_health.net_income,
        user_satisfaction: operationalMetrics.performance_indicators.user_satisfaction_score,
      };

      return {
        demographics,
        service_usage: serviceUsage,
        operational_metrics: operationalMetrics,
        financial_analytics: financialAnalytics,
        key_performance_indicators: kpis,
      };
    } catch (error) {
      this.handleError(error, 'get dashboard data');
    }
  }

  // Private helper methods

  private async getAgeDistribution(): Promise<Record<string, number>> {
    try {
      const { data } = await this.client
        .from('residents')
        .select('date_of_birth')
        .eq('status', 'Active');

      const ageGroups = {
        '0-17': 0,
        '18-30': 0,
        '31-45': 0,
        '46-60': 0,
        '60+': 0,
      };

      data?.forEach(resident => {
        if (resident.date_of_birth) {
          const age = this.calculateAge(resident.date_of_birth);
          if (age <= 17) ageGroups['0-17']++;
          else if (age <= 30) ageGroups['18-30']++;
          else if (age <= 45) ageGroups['31-45']++;
          else if (age <= 60) ageGroups['46-60']++;
          else ageGroups['60+']++;
        }
      });

      return ageGroups;
    } catch (error) {
      return {};
    }
  }

  private async getGenderDistribution(): Promise<Record<string, number>> {
    try {
      const { data } = await this.client
        .from('residents')
        .select('gender')
        .eq('status', 'Active');

      const distribution: Record<string, number> = {};
      data?.forEach(resident => {
        const gender = resident.gender || 'Not Specified';
        distribution[gender] = (distribution[gender] || 0) + 1;
      });

      return distribution;
    } catch (error) {
      return {};
    }
  }

  private async getCivilStatusDistribution(): Promise<Record<string, number>> {
    try {
      const { data } = await this.client
        .from('residents')
        .select('civil_status')
        .eq('status', 'Active');

      const distribution: Record<string, number> = {};
      data?.forEach(resident => {
        const status = resident.civil_status || 'Not Specified';
        distribution[status] = (distribution[status] || 0) + 1;
      });

      return distribution;
    } catch (error) {
      return {};
    }
  }

  private async getEmploymentDistribution(): Promise<Record<string, number>> {
    try {
      const { data } = await this.client
        .from('resident_employment')
        .select('employment_type')
        .eq('is_current', true);

      const distribution: Record<string, number> = {};
      data?.forEach(employment => {
        const type = employment.employment_type || 'Not Specified';
        distribution[type] = (distribution[type] || 0) + 1;
      });

      return distribution;
    } catch (error) {
      return {};
    }
  }

  private async getEducationDistribution(): Promise<Record<string, number>> {
    try {
      const { data } = await this.client
        .from('resident_education')
        .select('education_level')
        .eq('is_current', true);

      const distribution: Record<string, number> = {};
      data?.forEach(education => {
        const level = education.education_level || 'Not Specified';
        distribution[level] = (distribution[level] || 0) + 1;
      });

      return distribution;
    } catch (error) {
      return {};
    }
  }

  private async getHouseholdStatistics(): Promise<any> {
    try {
      const { count: totalHouseholds } = await this.client
        .from('households')
        .select('*', { count: 'exact', head: true });

      const { data: households } = await this.client
        .from('households')
        .select('household_size, dwelling_type, ownership_status');

      let totalSize = 0;
      const dwellingTypes: Record<string, number> = {};
      const ownershipStatus: Record<string, number> = {};

      households?.forEach(household => {
        totalSize += household.household_size || 0;
        
        const dwelling = household.dwelling_type || 'Not Specified';
        dwellingTypes[dwelling] = (dwellingTypes[dwelling] || 0) + 1;
        
        const ownership = household.ownership_status || 'Not Specified';
        ownershipStatus[ownership] = (ownershipStatus[ownership] || 0) + 1;
      });

      return {
        total_households: totalHouseholds || 0,
        average_household_size: totalHouseholds ? totalSize / totalHouseholds : 0,
        dwelling_types: dwellingTypes,
        ownership_status: ownershipStatus,
      };
    } catch (error) {
      return {
        total_households: 0,
        average_household_size: 0,
        dwelling_types: {},
        ownership_status: {},
      };
    }
  }

  private async getDocumentAnalytics(dateFilter: string): Promise<any> {
    // Implement document analytics logic
    return {
      total: 0,
      by_type: {},
      by_status: {},
      processing_times: { average_days: 0, by_type: {} },
      monthly_trends: [],
    };
  }

  private async getAnnouncementAnalytics(dateFilter: string): Promise<any> {
    // Implement announcement analytics logic
    return {
      total: 0,
      by_category: {},
      engagement_metrics: { total_views: 0, average_views_per_announcement: 0 },
    };
  }

  private async getIncidentAnalytics(dateFilter: string): Promise<any> {
    // Implement incident analytics logic
    return {
      total: 0,
      by_type: {},
      by_status: {},
      resolution_times: { average_days: 0, by_type: {} },
    };
  }

  private async getStaffProductivityMetrics(dateFilter: string): Promise<any> {
    // Implement staff productivity metrics
    return {
      documents_processed: {},
      average_processing_time: {},
      workload_distribution: {},
    };
  }

  private async getSystemUsageMetrics(dateFilter: string): Promise<any> {
    // Implement system usage metrics
    return {
      active_users: 0,
      login_frequency: {},
      feature_usage: {},
    };
  }

  private async getPerformanceIndicators(dateFilter: string): Promise<any> {
    // Implement performance indicators
    return {
      document_completion_rate: 0,
      average_response_time: 0,
      user_satisfaction_score: 0,
    };
  }

  private async getRevenueAnalysis(dateFilter: string): Promise<any> {
    // Implement revenue analysis
    return {
      total_revenue: 0,
      revenue_by_source: {},
      monthly_trends: [],
    };
  }

  private async getExpenseAnalysis(dateFilter: string): Promise<any> {
    // Implement expense analysis
    return {
      total_expenses: 0,
      expenses_by_category: {},
      budget_utilization: {},
    };
  }

  private async getFinancialHealthIndicators(dateFilter: string): Promise<any> {
    // Implement financial health indicators
    return {
      net_income: 0,
      budget_variance: 0,
      cost_per_service: {},
    };
  }

  private buildDateFilter(filters: AnalyticsFilters): string {
    if (filters.date_from && filters.date_to) {
      return `created_at >= '${filters.date_from}' AND created_at <= '${filters.date_to}'`;
    }
    
    // Default to last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return `created_at >= '${thirtyDaysAgo.toISOString()}'`;
  }

  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}
