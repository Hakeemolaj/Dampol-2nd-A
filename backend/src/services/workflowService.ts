import { v4 as uuidv4 } from 'uuid';

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  order: number;
  requiredRole: string;
  estimatedDuration: number; // in hours
  isRequired: boolean;
  conditions?: Record<string, any>;
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  documentRequestId: string;
  currentStepId: string;
  status: 'active' | 'completed' | 'cancelled' | 'on_hold';
  startedAt: string;
  completedAt?: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  steps: WorkflowStepInstance[];
}

export interface WorkflowStepInstance {
  id: string;
  stepId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'rejected';
  assignedTo?: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  attachments?: string[];
  duration?: number; // actual duration in hours
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  documentType: string;
  version: string;
  isActive: boolean;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

class WorkflowService {
  private workflows: WorkflowTemplate[] = [];
  private instances: WorkflowInstance[] = [];

  constructor() {
    this.initializeDefaultWorkflows();
  }

  private initializeDefaultWorkflows(): void {
    // Barangay Clearance Workflow
    const barangayClearanceWorkflow: WorkflowTemplate = {
      id: 'workflow-barangay-clearance',
      name: 'Barangay Clearance Processing',
      description: 'Standard workflow for processing barangay clearance requests',
      documentType: 'barangay-clearance',
      version: '1.0',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [
        {
          id: 'step-1',
          name: 'Initial Review',
          description: 'Review application completeness and requirements',
          order: 1,
          requiredRole: 'clerk',
          estimatedDuration: 0.5,
          isRequired: true
        },
        {
          id: 'step-2',
          name: 'Document Verification',
          description: 'Verify submitted documents and applicant information',
          order: 2,
          requiredRole: 'clerk',
          estimatedDuration: 1,
          isRequired: true
        },
        {
          id: 'step-3',
          name: 'Background Check',
          description: 'Conduct background verification with local records',
          order: 3,
          requiredRole: 'officer',
          estimatedDuration: 4,
          isRequired: true
        },
        {
          id: 'step-4',
          name: 'Approval',
          description: 'Final approval by authorized personnel',
          order: 4,
          requiredRole: 'captain',
          estimatedDuration: 0.5,
          isRequired: true
        },
        {
          id: 'step-5',
          name: 'Document Preparation',
          description: 'Prepare and print the official document',
          order: 5,
          requiredRole: 'clerk',
          estimatedDuration: 0.5,
          isRequired: true
        },
        {
          id: 'step-6',
          name: 'Quality Check',
          description: 'Final quality check and document signing',
          order: 6,
          requiredRole: 'secretary',
          estimatedDuration: 0.25,
          isRequired: true
        }
      ]
    };

    // Certificate of Residency Workflow
    const residencyWorkflow: WorkflowTemplate = {
      id: 'workflow-certificate-residency',
      name: 'Certificate of Residency Processing',
      description: 'Workflow for processing certificate of residency requests',
      documentType: 'certificate-residency',
      version: '1.0',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [
        {
          id: 'step-1',
          name: 'Application Review',
          description: 'Review application and supporting documents',
          order: 1,
          requiredRole: 'clerk',
          estimatedDuration: 0.25,
          isRequired: true
        },
        {
          id: 'step-2',
          name: 'Residency Verification',
          description: 'Verify applicant residency in the barangay',
          order: 2,
          requiredRole: 'officer',
          estimatedDuration: 2,
          isRequired: true
        },
        {
          id: 'step-3',
          name: 'Document Preparation',
          description: 'Prepare the certificate document',
          order: 3,
          requiredRole: 'clerk',
          estimatedDuration: 0.5,
          isRequired: true
        },
        {
          id: 'step-4',
          name: 'Final Approval',
          description: 'Final review and signature',
          order: 4,
          requiredRole: 'secretary',
          estimatedDuration: 0.25,
          isRequired: true
        }
      ]
    };

    this.workflows = [barangayClearanceWorkflow, residencyWorkflow];
  }

  // Get workflow template by document type
  getWorkflowByDocumentType(documentType: string): WorkflowTemplate | null {
    return this.workflows.find(w => w.documentType === documentType && w.isActive) || null;
  }

  // Create new workflow instance
  createWorkflowInstance(
    documentRequestId: string,
    documentType: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): WorkflowInstance | null {
    const workflow = this.getWorkflowByDocumentType(documentType);
    if (!workflow || workflow.steps.length === 0) {
      return null;
    }

    const instance: WorkflowInstance = {
      id: uuidv4(),
      workflowId: workflow.id,
      documentRequestId,
      currentStepId: workflow.steps[0]!.id,
      status: 'active',
      startedAt: new Date().toISOString(),
      priority,
      steps: workflow.steps.map(step => ({
        id: uuidv4(),
        stepId: step.id,
        status: step.order === 1 ? 'pending' : 'pending'
      }))
    };

    this.instances.push(instance);
    return instance;
  }

  // Get workflow instance
  getWorkflowInstance(instanceId: string): WorkflowInstance | null {
    return this.instances.find(i => i.id === instanceId) || null;
  }

  // Get workflow instance by document request ID
  getWorkflowByDocumentRequest(documentRequestId: string): WorkflowInstance | null {
    return this.instances.find(i => i.documentRequestId === documentRequestId) || null;
  }

  // Start step
  startStep(instanceId: string, stepId: string, assignedTo: string): boolean {
    const instance = this.getWorkflowInstance(instanceId);
    if (!instance) return false;

    const stepInstance = instance.steps.find(s => s.stepId === stepId);
    if (!stepInstance || stepInstance.status !== 'pending') return false;

    stepInstance.status = 'in_progress';
    stepInstance.assignedTo = assignedTo;
    stepInstance.startedAt = new Date().toISOString();

    instance.currentStepId = stepId;
    instance.assignedTo = assignedTo;

    return true;
  }

  // Complete step
  completeStep(
    instanceId: string,
    stepId: string,
    notes?: string,
    attachments?: string[]
  ): boolean {
    const instance = this.getWorkflowInstance(instanceId);
    if (!instance) return false;

    const workflow = this.workflows.find(w => w.id === instance.workflowId);
    if (!workflow) return false;

    const stepInstance = instance.steps.find(s => s.stepId === stepId);
    if (!stepInstance || stepInstance.status !== 'in_progress') return false;

    // Complete current step
    stepInstance.status = 'completed';
    stepInstance.completedAt = new Date().toISOString();
    stepInstance.notes = notes;
    stepInstance.attachments = attachments;

    if (stepInstance.startedAt) {
      const duration = (new Date().getTime() - new Date(stepInstance.startedAt).getTime()) / (1000 * 60 * 60);
      stepInstance.duration = Math.round(duration * 100) / 100; // Round to 2 decimal places
    }

    // Find next step
    const currentStep = workflow.steps.find(s => s.id === stepId);
    if (!currentStep) return false;

    const nextStep = workflow.steps.find(s => s.order === currentStep.order + 1);
    
    if (nextStep) {
      // Move to next step
      instance.currentStepId = nextStep.id;
      const nextStepInstance = instance.steps.find(s => s.stepId === nextStep.id);
      if (nextStepInstance) {
        nextStepInstance.status = 'pending';
      }
      instance.assignedTo = undefined; // Clear assignment for next step
    } else {
      // Workflow completed
      instance.status = 'completed';
      instance.completedAt = new Date().toISOString();
      instance.currentStepId = '';
      instance.assignedTo = undefined;
    }

    return true;
  }

  // Reject step
  rejectStep(instanceId: string, stepId: string, reason: string): boolean {
    const instance = this.getWorkflowInstance(instanceId);
    if (!instance) return false;

    const stepInstance = instance.steps.find(s => s.stepId === stepId);
    if (!stepInstance) return false;

    stepInstance.status = 'rejected';
    stepInstance.completedAt = new Date().toISOString();
    stepInstance.notes = reason;

    instance.status = 'cancelled';
    instance.completedAt = new Date().toISOString();

    return true;
  }

  // Get workflow progress
  getWorkflowProgress(instanceId: string): {
    totalSteps: number;
    completedSteps: number;
    currentStep: string;
    progressPercentage: number;
    estimatedCompletion?: string;
  } | null {
    const instance = this.getWorkflowInstance(instanceId);
    if (!instance) return null;

    const workflow = this.workflows.find(w => w.id === instance.workflowId);
    if (!workflow) return null;

    const totalSteps = workflow.steps.length;
    const completedSteps = instance.steps.filter(s => s.status === 'completed').length;
    const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

    const currentStep = workflow.steps.find(s => s.id === instance.currentStepId);
    const currentStepName = currentStep ? currentStep.name : 'Completed';

    // Calculate estimated completion
    let estimatedCompletion: string | undefined;
    if (instance.status === 'active' && currentStep) {
      const remainingSteps = workflow.steps.filter(s => s.order >= currentStep.order);
      const remainingHours = remainingSteps.reduce((sum, step) => sum + step.estimatedDuration, 0);
      const estimatedDate = new Date(Date.now() + remainingHours * 60 * 60 * 1000);
      estimatedCompletion = estimatedDate.toISOString();
    }

    return {
      totalSteps,
      completedSteps,
      currentStep: currentStepName,
      progressPercentage,
      estimatedCompletion
    };
  }

  // Get all active workflows
  getActiveWorkflows(): WorkflowInstance[] {
    return this.instances.filter(i => i.status === 'active');
  }

  // Get workflows by assignee
  getWorkflowsByAssignee(assigneeId: string): WorkflowInstance[] {
    return this.instances.filter(i => i.assignedTo === assigneeId && i.status === 'active');
  }

  // Get workflow statistics
  getWorkflowStatistics(): {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    averageCompletionTime: number;
    byPriority: Record<string, number>;
  } {
    const total = this.instances.length;
    const active = this.instances.filter(i => i.status === 'active').length;
    const completed = this.instances.filter(i => i.status === 'completed').length;
    const cancelled = this.instances.filter(i => i.status === 'cancelled').length;

    // Calculate average completion time for completed workflows
    const completedInstances = this.instances.filter(i => i.status === 'completed' && i.completedAt);
    const totalCompletionTime = completedInstances.reduce((sum, instance) => {
      const duration = new Date(instance.completedAt!).getTime() - new Date(instance.startedAt).getTime();
      return sum + duration;
    }, 0);
    const averageCompletionTime = completedInstances.length > 0 
      ? Math.round((totalCompletionTime / completedInstances.length) / (1000 * 60 * 60)) // in hours
      : 0;

    const byPriority = this.instances.reduce((acc, instance) => {
      acc[instance.priority] = (acc[instance.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      completed,
      cancelled,
      averageCompletionTime,
      byPriority
    };
  }
}

export const workflowService = new WorkflowService();
export default workflowService;
