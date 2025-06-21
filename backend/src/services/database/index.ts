// Database service exports
export { BaseService, DatabaseError } from './base.service';
export { AnnouncementsService } from './announcements.service';
export { ResidentsService } from './residents.service';
export { NotificationsService } from './notifications.service';
// export { DocumentsService } from './documents.service';
// export { UserProfilesService } from './user-profiles.service';

// Service instances
import { AnnouncementsService } from './announcements.service';
import { ResidentsService } from './residents.service';
import { NotificationsService } from './notifications.service';
// import { DocumentsService } from './documents.service';
// import { UserProfilesService } from './user-profiles.service';

// Export service instances for easy import
export const announcementsService = new AnnouncementsService();
export const residentsService = new ResidentsService();
export const notificationsService = new NotificationsService();
// export const documentsService = new DocumentsService();
// export const userProfilesService = new UserProfilesService();

// Service factory for custom client instances
export class DatabaseServices {
  public announcements: AnnouncementsService;
  public residents: ResidentsService;
  public notifications: NotificationsService;
  // public documents: DocumentsService;
  // public userProfiles: UserProfilesService;

  constructor(client?: any) {
    this.announcements = new AnnouncementsService(client);
    this.residents = new ResidentsService(client);
    this.notifications = new NotificationsService(client);
    // this.documents = new DocumentsService(client);
    // this.userProfiles = new UserProfilesService(client);
  }
}

// Default service instance
export const db = new DatabaseServices();

// Types
export type {
  PaginationOptions,
  PaginationResult,
  FilterOptions,
  SortOptions,
} from './base.service';

export type {
  AnnouncementFilters,
  CreateAnnouncementData,
  UpdateAnnouncementData,
} from './announcements.service';

export type {
  ResidentFilters,
  CreateResidentData,
  UpdateResidentData,
  ResidentWithProfile,
} from './residents.service';
