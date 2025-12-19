/**
 * gsk-schema.ts
 * Complete TypeScript schema for “life snapshot” & subscription-based system
 * - Stable string IDs recommended (UUID v4)
 * - All dates are ISO 8601 strings
 * - No external dependencies required
 */

/* ========================================================================
   Core Types
   ======================================================================== */

/** Information types displayed by GSK_INFO_VIEWER */
export type GSK_INFO_TYPE =
  // Basic Text Formats
  | 'text'
  | 'markdown'
  | 'html'
  | 'latex'

  // Structured Data
  | 'json'
  | 'xml'
  | 'yaml'
  | 'csv'

  // Files & External Assets. Url or embedded

  // Web & External Links
  | 'url' // generic URL
  | 'pdf'
  | 'archive' // zip, rar, 7z, tar.gz
  | 'video_url' // YouTube, Vimeo, etc.
  | 'audio_url' // Spotify, MP3 link, radio stream
  | 'image_url'
  | 'file_url' // downloadable file
  | 'google_forms_url'
  | 'google_docs_url'
  | 'google_sheets_url'
  | 'google_slides_url'

  // Geographic Data
  | 'coordinates' // lat/long pair in ISO6709 format
  | 'map_url' // Google Maps, Waze, OpenStreetMap

  // Citation & Reference Formats
  | 'bibtex'
  | 'reference' // APA/MLA/etc. in text form
  | 'doi'

  // Specialized Data Representations
  | 'diagram_mermaid'; // textual diagram DSL (mermaid, graphviz) // ========================================================================

/** User audit log actions */
export type GSK_USER_LOG_ACTION_TYPE =
  /* ------------------ Auth / Account ------------------ */
  | 'user_created'
  | 'user_deleted'
  | 'user_login'
  | 'user_logout'
  | 'user_login_failed'
  | 'user_password_reset_requested'
  | 'user_password_changed'
  | 'user_two_factor_enabled'
  | 'user_two_factor_disabled'
  | 'user_profile_viewed'
  | 'user_profile_updated'
  | 'user_email_changed'
  | 'user_roles_changed'
  | 'user_privacy_settings_changed'

  /* ------------------ Subscription & Billing ------------------ */
  | 'subscription_created'
  | 'subscription_renewed'
  | 'subscription_canceled'
  | 'subscription_expired'
  | 'subscription_plan_changed'
  | 'subscription_trial_started'
  | 'subscription_trial_ended'
  | 'user_subscription_paid'
  | 'payment_failed'
  | 'invoice_generated'
  | 'invoice_paid'
  | 'invoice_sent'
  | 'discount_applied'

  /* ------------------ AI / Automation Use ------------------ */
  | 'ai_generated_text'
  | 'ai_summary_requested'
  | 'ai_data_extraction'
  | 'ai_chat_session_started'
  | 'ai_chat_session_completed'
  | 'ai_embedding_generated'
  | 'ai_document_analysis'
  | 'ai_recommendation_displayed'

  /* ------------------ Search / Navigation ------------------ */
  | 'search_performed'
  | 'filter_applied'
  | 'sort_applied'
  | 'quick_view_opened'

  /* ------------------ Documents ------------------ */
  | 'document_created'
  | 'document_uploaded'
  | 'document_updated'
  | 'document_deleted'
  | 'document_downloaded'
  | 'document_renamed'
  | 'document_moved'
  | 'document_previewed'
  | 'document_tag_added'
  | 'document_tag_removed'

  /* ------------------ Info Viewer Blocks ------------------ */
  | 'info_viewer_created'
  | 'info_viewer_updated'
  | 'info_viewer_deleted'
  | 'info_viewer_previewed'

  /* ------------------ Events ------------------ */
  | 'event_created'
  | 'event_updated'
  | 'event_deleted'
  | 'event_viewed'
  | 'event_tag_added'
  | 'event_tag_removed'

  /* ------------------ Activities ------------------ */
  | 'activity_created'
  | 'activity_updated'
  | 'activity_deleted'
  | 'activity_viewed'

  /* ------------------ Timelines ------------------ */
  | 'timeline_created'
  | 'timeline_updated'
  | 'timeline_deleted'
  | 'timeline_viewed'
  | 'timeline_period_extended'
  | 'timeline_period_shortened'

  /* ------------------ Collaboration ------------------ */
  | 'collaboration_invite_sent'
  | 'collaboration_invite_accepted'
  | 'collaboration_invite_rejected'
  | 'collaborator_added'
  | 'collaborator_removed'
  | 'comment_added'
  | 'comment_updated'
  | 'comment_deleted'

  /* ------------------ Notifications ------------------ */
  | 'notification_sent'
  | 'notification_read'
  | 'notification_deleted'

  /* ------------------ Data Import / Export ------------------ */
  | 'data_import_started'
  | 'data_import_completed'
  | 'data_import_failed'
  | 'data_export_started'
  | 'data_export_completed'
  | 'data_backup_generated'
  | 'data_restored_from_backup'

  /* ------------------ Security / Safety ------------------ */
  | 'suspicious_login_detected'
  | 'rate_limit_triggered'
  | 'data_access_denied'
  | 'user_blocked'
  | 'user_unblocked'
  | 'api_key_generated'
  | 'api_key_revoked'

  /* ------------------ Admin Operations ------------------ */
  | 'admin_user_impersonated'
  | 'admin_user_impersonation_ended'
  | 'admin_settings_changed'
  | 'admin_system_migration_started'
  | 'admin_system_migration_completed'
  | 'admin_cache_cleared';

/* ========================================================================
   Location / Links / Contribution / Validation
   ======================================================================== */

export interface GSK_LOCATION {
  city?: string;
  region?: string;
  country?: string;
  address?: string;
  coordinates?: { lat: number; lon: number };
}

export interface GSK_IMPORTANT_LINK {
  id?: string;
  title: string;
  url: string;
  description?: string;
  addedAt?: string;
}

export interface GSK_CONTRIBUTION_SKILL {
  name: string;
  type: 'soft' | 'tech';
}

export interface GSK_USER_CONTRIBUTION {
  userRole: string;
  contributionDate: string;
  skillsApplied: GSK_CONTRIBUTION_SKILL[];
  notes?: string;
}

export interface GSK_VALIDATION_AUTHORITY {
  id?: string;
  name: string;
  authorityType?: 'Institution' | 'Company' | 'Individual';
  validationDate?: string;
  authorityUrl?: string;
  notes?: string;
}

/* ========================================================================
   Meta Info
   ======================================================================== */

export interface GSK_META_INFO {
  id?: string;
  title?: string;
  subtitle?: string;
  shortDescription?: string;
  description?: string;
  keywords?: string[];
  coverImageUrl?: string;
  authors?: string[];
  publishedDate?: string; // ISO date string

  importantLinks?: GSK_IMPORTANT_LINK[];
  userContribution?: GSK_USER_CONTRIBUTION[];
  validationAuthority?: GSK_VALIDATION_AUTHORITY[];
  location?: GSK_LOCATION;

  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
  extras?: Record<string, string | number | boolean>;
}

/* ========================================================================
   Info Viewer
   ======================================================================== */

export interface GSK_INFO_VIEWER {
  typeOfInfo: GSK_INFO_TYPE;
  title: string;
  description: string;
  data: string;
  isPublic: boolean;
}

/* ========================================================================
   Documents
   ======================================================================== */

export interface GSK_DOCUMENT {
  id: string;
  metaInfo: GSK_META_INFO;

  extension: string;
  originalName: string;
  sizeBytes: number;
  mimeType: string;

  serverFileName: string;
  serverFilePath: string;

  uploadedAt: string;
  uploadedByUserId?: string | number;

  tags?: string[];
  checksumSHA512: string;

  relatedEventId?: string;
  relatedTimelineId?: string;

  extraInfo?: GSK_INFO_VIEWER[];

  bibtex?: string;
  doi?: string;
  isbn?: string;

  citation?: {
    title?: string;
    authors?: string[];
    year?: number;
    venue?: string;
    pages?: string;
  };
}

/* ========================================================================
   Activities
   ======================================================================== */

export interface GSK_ACTIVITY {
  id: string;
  activityType: string;
  metaInfo: GSK_META_INFO;

  activityDate: string; // also starting date in ISO8601 format
  endDate?: string;
  duration?: string;
  durationSeconds?: number;

  location?: GSK_LOCATION;
  extraInfo?: GSK_INFO_VIEWER[];

  relatedDocuments?: string[];
  relatedEvents?: string[];
  relatedTimelineIds?: string[];

  participants?: Array<string | number>;

  createdAt?: string;
  updatedAt?: string;
}

/* ========================================================================
   Events
   ======================================================================== */

export interface GSK_EVENT {
  id: string;
  metaInfo: GSK_META_INFO;

  date: string;
  isMilestone?: boolean;

  parentEventId?: string;
  relatedTimelineIds?: string[];
  relatedDocumentIds?: string[];
  relatedActivityIds?: string[];

  priority?: 'low' | 'medium' | 'high';

  location?: GSK_LOCATION;
  tags?: string[];

  extraInfo?: GSK_INFO_VIEWER[];

  createdAt?: string;
  updatedAt?: string;
}

/* ========================================================================
   Timelines
   ======================================================================== */

export interface GSK_TIMELINE {
  id: string;
  metaInfo: GSK_META_INFO;

  startDate: string;
  endDate?: string;

  type?: string;
  typeLabel?: string;

  relatedEvents?: string[];
  relatedDocumentIds?: string[];
  relatedActivityIds?: string[];

  tags?: string[];
  extraInfo?: GSK_INFO_VIEWER[];

  createdAt?: string;
  updatedAt?: string;
}

/* ========================================================================
   User Details
   ======================================================================== */

export interface GSK_USER_DETAILS {
  metaInfo: GSK_META_INFO;

  timelines?: GSK_TIMELINE[];
  events?: GSK_EVENT[];
  documents?: GSK_DOCUMENT[];
  activities?: GSK_ACTIVITY[];

  tags?: string[];
  overallSummary?: string;

  searchIndexVersion?: number;
}

/* ========================================================================
   Public User Profiles
   ======================================================================== */

export interface GSK_USER_PUBLIC_SUMMARY {
  id: string;
  userName?: string;
  avatarUrl?: string;
  name?: string;
  displayName?: string;
}

export interface GSK_USER_PUBLIC_DETAILS extends GSK_USER_PUBLIC_SUMMARY {
  roles: string[];
  details: GSK_USER_DETAILS;
}

/* ========================================================================
   Subscription System
   ======================================================================== */

export interface GSK_USER_SUBSCRIPTION {
  id: string;
  planId: string; // e.g., "basic", "pro", "enterprise"
  planName?: string;
  startDate: string;
  endDate?: string;
  renewedAt?: string;
  price?: number;
  currency?: string;
  status: 'active' | 'expired' | 'canceled' | 'trial';
  metadata?: Record<string, string | number | boolean>;
}

export interface GSK_SUBSCRIPTION_PAYMENT {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  paidAt: string;
  method: string; // card, paypal, transfer...
  status: 'paid' | 'failed' | 'refunded';
  invoiceId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface GSK_SUBSCRIPTION_INVOICE {
  id: string;
  userId: string | number;
  subscriptionId?: string;
  issuedAt: string;
  paidAt?: string;
  currency: string;
  amount: number;
  pdfUrl?: string;
  metadata?: Record<string, string | number | boolean>;
}

/** The unified subscription bundle */
export interface GSK_USER_SUBSCRIPTION_BUNDLE {
  current?: GSK_USER_SUBSCRIPTION;
  history?: GSK_USER_SUBSCRIPTION[];
  payments?: GSK_SUBSCRIPTION_PAYMENT[];
  invoices?: GSK_SUBSCRIPTION_INVOICE[];
  usage?: {
    aiCallsUsed: number;
    aiCallsLimit: number;
    storageUsedMB: number;
    storageLimitMB: number;
    lastResetAt: string;
  };
  discountsApplied?: Array<{
    code: string;
    description?: string;
    percentage?: number;
    fixedAmount?: number;
    validUntil?: string;
    appliedAt?: string;
  }>;
}

/* ========================================================================
   User Log (Audit)
   ======================================================================== */

export interface GSK_USER_LOG {
  id: string;
  userId: string | number;
  timestamp: string;
  action: GSK_USER_LOG_ACTION_TYPE;

  entityType?: string;
  entityId?: string;

  metadata?: Record<string, string | number | boolean>;

  ipAddress?: string;
  userAgent?: string;
  location?: GSK_LOCATION;

  createdAt?: string;
}

/* ========================================================================
   User settings
   ======================================================================== */

export interface GSK_USER_SETTINGS {
  timelineTags: string[];
  documentTags: string[];
  eventTags: string[];
  activityTags: string[];
  aiModelPreference?: string;
}

/* ========================================================================
   User statuses
   ======================================================================== */

export type GSK_USER_STATUSES =
  | 'created'
  | 'active'
  | 'deactivated-by-user'
  | 'deactivated-by-admin'
  | 'delete-requested-by-user'
  | 'pending-payment-approval'
  | 'suspended-payment-failed'
  | 'banned-by-admin'
  | 'reported-for-abuse'
  | 'programmed-for-deletion'
  | 'deleted';
/* ========================================================================
   User (Self / Server)
   ======================================================================== */

export interface GSK_USER_SELF_DETAILS extends GSK_USER_PUBLIC_DETAILS {
  email: string;
  status: GSK_USER_STATUSES;
  isAdmin: boolean;
  isSuperAdmin: boolean;

  createdAt: string;
  updatedAt: string;
  createdBy: string | number;
  updatedBy: string | number;
  registeredAt: string;

  log: GSK_USER_LOG[];

  subscriptionBundle: GSK_USER_SUBSCRIPTION_BUNDLE;
  settings: GSK_USER_SETTINGS;
}

export interface GSK_USER extends GSK_USER_SELF_DETAILS {
  passwordHash?: string;
  recoveryCode?: string;
}

/* ========================================================================
   User summary at server level
   ======================================================================== */

export interface GSK_USER_SERVER_SUMMARY extends GSK_USER_PUBLIC_SUMMARY {
  email?: string;
  status: GSK_USER_STATUSES;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  settings?: GSK_USER_SETTINGS;
}

/* ========================================================================
   User DB
   ======================================================================== */

export interface GSK_USER_DB {
  id: string;
  userName?: string;
  avatarUrl?: string;
  name?: string;
  displayName?: string;
  roles: string;
  details: string;
  email?: string;
  status: GSK_USER_STATUSES;
  isAdmin: number;
  isSuperAdmin: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  registeredAt: string;
  log: string;
  subscriptionBundle: string;
  passwordHash?: string;
  recoveryCode?: string;
  settings: string;
}

/* ========================================================================
   Exports
   ======================================================================== */

export default {};
