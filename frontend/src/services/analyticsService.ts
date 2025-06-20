const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

export interface AnalyticsOverview {
  totalResidents: number;
  totalHouseholds: number;
  activeRequests: number;
  completedRequests: number;
  monthlyRevenue: number;
  pendingDocuments: number;
}

export interface DemographicsData {
  ageGroups: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  gender: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export interface ServicesData {
  popularDocuments: Array<{
    type: string;
    requests: number;
    avgProcessingDays: number;
    completionRate: number;
    revenue: number;
    satisfaction: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    requests: number;
    completed: number;
    pending: number;
  }>;
  processingTimes: Array<{
    step: string;
    avgHours: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export interface FinancialData {
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  revenueByService: Array<{
    service: string;
    amount: number;
    percentage: number;
  }>;
}

export interface CommunicationData {
  announcements: {
    totalPublished: number;
    totalViews: number;
    totalEngagements: number;
    avgViewsPerAnnouncement: number;
    engagementRate: number;
    monthlyTrends: Array<{
      month: string;
      published: number;
      views: number;
      engagements: number;
    }>;
    categoryBreakdown: Array<{
      category: string;
      count: number;
      views: number;
      engagements: number;
      avgEngagement: number;
    }>;
    priorityDistribution: Array<{
      priority: string;
      count: number;
      percentage: number;
    }>;
    reachMetrics: {
      totalReach: number;
      uniqueViewers: number;
      repeatViewers: number;
      viewerRetentionRate: number;
      avgTimeOnAnnouncement: number;
    };
  };
  feedback: {
    totalSubmissions: number;
    averageRating: number;
    responseRate: number;
    resolutionTime: number;
    categoryBreakdown: Array<{
      category: string;
      count: number;
      avgRating: number;
      resolved: number;
    }>;
    sentimentAnalysis: Array<{
      sentiment: string;
      count: number;
      percentage: number;
    }>;
    monthlyTrends: Array<{
      month: string;
      submissions: number;
      avgRating: number;
      resolved: number;
    }>;
  };
  engagement: {
    websiteTraffic: {
      totalVisitors: number;
      uniqueVisitors: number;
      pageViews: number;
      avgSessionDuration: number;
      bounceRate: number;
      returnVisitorRate: number;
    };
    socialMedia: {
      followers: number;
      posts: number;
      likes: number;
      shares: number;
      comments: number;
      engagementRate: number;
      reach: number;
    };
    digitalServices: {
      onlineApplications: number;
      digitalAdoption: number;
      userSatisfaction: number;
      completionRate: number;
      avgCompletionTime: number;
    };
  };
}

export interface OperationalData {
  staffPerformance: {
    totalStaff: number;
    activeStaff: number;
    avgProductivityScore: number;
    totalTasksCompleted: number;
    avgTaskCompletionTime: number;
    staffUtilization: number;
    staffBreakdown: Array<{
      department: string;
      staff: number;
      tasksCompleted: number;
      avgCompletionTime: number;
      productivityScore: number;
      efficiency: number;
    }>;
    monthlyTrends: Array<{
      month: string;
      tasksCompleted: number;
      avgTime: number;
      productivity: number;
    }>;
  };
  serviceDelivery: {
    totalServices: number;
    avgDeliveryTime: number;
    onTimeDeliveryRate: number;
    customerSatisfaction: number;
    serviceEfficiency: number;
    slaCompliance: number;
    serviceBreakdown: Array<{
      service: string;
      requests: number;
      avgDeliveryTime: number;
      onTimeRate: number;
      satisfaction: number;
      slaTarget: number;
      efficiency: number;
    }>;
    monthlyPerformance: Array<{
      month: string;
      avgDelivery: number;
      onTime: number;
      satisfaction: number;
    }>;
  };
  workflowEfficiency: {
    totalWorkflows: number;
    automatedWorkflows: number;
    automationRate: number;
    avgWorkflowTime: number;
    workflowOptimization: number;
    bottleneckResolution: number;
    workflowBreakdown: Array<{
      workflow: string;
      steps: number;
      avgTime: number;
      automationLevel: number;
      efficiency: number;
      bottlenecks: number;
    }>;
    improvementAreas: Array<{
      area: string;
      priority: string;
      impact: string;
      effort: string;
    }>;
  };
  administrativeMetrics: {
    meetingsHeld: number;
    decisionsImplemented: number;
    policyUpdates: number;
    complianceRate: number;
    auditScore: number;
    governanceEfficiency: number;
    departmentPerformance: Array<{
      department: string;
      meetings: number;
      decisions: number;
      implementation: number;
      compliance: number;
    }>;
    kpiTracking: Array<{
      kpi: string;
      target: number;
      actual: number;
      performance: number;
    }>;
  };
  resourceUtilization: {
    facilityUsage: number;
    equipmentEfficiency: number;
    budgetUtilization: number;
    staffWorkload: number;
    technologyAdoption: number;
    resourceOptimization: number;
    facilityBreakdown: Array<{
      facility: string;
      usage: number;
      capacity: number;
      efficiency: number;
    }>;
    equipmentStatus: Array<{
      equipment: string;
      total: number;
      functional: number;
      efficiency: number;
    }>;
  };
}

export interface AnalyticsResponse<T> {
  success: boolean;
  data: T;
  dateRange?: string;
  filters?: any;
  generatedAt: string;
}

class AnalyticsService {
  private async fetchData<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${API_BASE_URL}/analytics/${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status} ${response.statusText}`);
    }

    const result: AnalyticsResponse<T> = await response.json();
    
    if (!result.success) {
      throw new Error('Analytics API returned error response');
    }

    return result.data;
  }

  async getOverview(dateRange: string = 'last30days'): Promise<AnalyticsOverview> {
    return this.fetchData<AnalyticsOverview>('overview', { dateRange });
  }

  async getDemographics(dateRange: string = 'all'): Promise<DemographicsData> {
    return this.fetchData<DemographicsData>('demographics', { dateRange });
  }

  async getServices(dateRange: string = 'last30days', documentType?: string): Promise<ServicesData> {
    const params: Record<string, string> = { dateRange };
    if (documentType) {
      params.documentType = documentType;
    }
    return this.fetchData<ServicesData>('services', params);
  }

  async getFinancial(dateRange: string = 'last6months'): Promise<FinancialData> {
    return this.fetchData<FinancialData>('financial', { dateRange });
  }

  async getCommunication(dateRange: string = 'last30days', category?: string): Promise<CommunicationData> {
    const params: Record<string, string> = { dateRange };
    if (category) {
      params.category = category;
    }
    return this.fetchData<CommunicationData>('communication', params);
  }

  async getOperational(dateRange: string = 'last30days', category?: string): Promise<OperationalData> {
    const params: Record<string, string> = { dateRange };
    if (category) {
      params.category = category;
    }
    return this.fetchData<OperationalData>('operational', params);
  }

  async getDashboard(dateRange: string = 'last30days'): Promise<{
    overview: AnalyticsOverview;
    demographics: DemographicsData;
    services: ServicesData;
    financial: FinancialData;
    communication: CommunicationData;
    operational: OperationalData;
  }> {
    return this.fetchData('dashboard', { dateRange });
  }

  async exportData(
    format: 'json' | 'csv' = 'json',
    category: string = 'all',
    dateRange: string = 'last30days'
  ): Promise<Blob> {
    const url = new URL(`${API_BASE_URL}/analytics/export`);
    url.searchParams.append('format', format);
    url.searchParams.append('category', category);
    url.searchParams.append('dateRange', dateRange);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Export API error: ${response.status} ${response.statusText}`);
    }

    return response.blob();
  }

  // Helper method to download exported data
  async downloadExport(
    format: 'json' | 'csv' = 'json',
    category: string = 'all',
    dateRange: string = 'last30days'
  ): Promise<void> {
    try {
      const blob = await this.exportData(format, category, dateRange);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `barangay-analytics-${category}-${dateRange}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading export:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
