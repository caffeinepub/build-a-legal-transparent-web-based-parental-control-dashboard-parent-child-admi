export const en = {
  // Common
  loading: 'Loading...',
  save: 'Save',
  saving: 'Saving...',
  cancel: 'Cancel',
  close: 'Close',
  continue: 'Continue',
  submit: 'Submit',
  submitting: 'Submitting...',
  delete: 'Delete',
  edit: 'Edit',
  view: 'View',
  
  // Auth
  login: 'Login',
  logout: 'Logout',
  loggingIn: 'Logging in...',
  
  // App name
  appName: 'FamilyGuard',
  
  // Landing page
  landingHero: 'Transparent Parental Guidance',
  landingDescription: 'A legal, consent-based web platform for families. Set healthy screen time limits, review activity reports, and maintain open communication—all with full transparency.',
  landingFeature1Title: '✓ Consent-Based',
  landingFeature1Desc: 'Child approval required',
  landingFeature2Title: '✓ Transparent',
  landingFeature2Desc: 'No hidden monitoring',
  landingFeature3Title: '✓ Legal',
  landingFeature3Desc: 'Compliant with privacy laws',
  landingTransparencyLink: 'Learn about our transparency policies',
  
  // Profile Setup
  profileSetupTitle: 'Welcome to FamilyGuard',
  profileSetupDescription: 'Please set up your profile to get started',
  profileSetupNameLabel: 'Your Name',
  profileSetupNamePlaceholder: 'Enter your name',
  profileSetupRoleLabel: 'I am a...',
  profileSetupParentTitle: 'Parent / Guardian',
  profileSetupParentDesc: 'Monitor and guide family members',
  profileSetupChildTitle: 'Child / Teen',
  profileSetupChildDesc: 'Share activity with parent consent',
  profileSetupCreating: 'Creating Profile...',
  
  // Header
  headerTransparency: 'Transparency',
  headerRoleParent: 'parent',
  headerRoleChild: 'child',
  headerRoleAdmin: 'admin',
  headerRoleUser: 'user',
  
  // Footer
  footerTransparencyPolicies: 'Transparency & Policies',
  footerBuiltWith: 'Built with',
  footerUsing: 'using',
  
  // Transparency & Policies Modal
  transparencyTitle: 'Transparency & Policies',
  transparencySubtitle: 'How FamilyGuard protects privacy and ensures transparency',
  transparencySupervisionTitle: 'Supervision Disclosure',
  transparencySupervisionP1: 'FamilyGuard is a consent-based, transparent parental guidance platform. Children are always aware when supervision is active. All data sharing requires explicit consent from the child at the time of submission.',
  transparencySupervisionP2: 'Parents can view only the information that children voluntarily submit through the check-in system. There is no hidden monitoring, no background tracking, and no covert surveillance.',
  transparencyDataTitle: 'Data Handling',
  transparencyDataP1: 'All data is stored securely on the Internet Computer blockchain with end-to-end encryption. Only authorized family members can access shared information:',
  transparencyDataL1: 'Children can view their own submitted data',
  transparencyDataL2: 'Parents can view data from their linked children only',
  transparencyDataL3: 'Admins can view aggregated metrics but not individual child content',
  transparencyDataL4: 'No third parties have access to family data',
  transparencyConsentTitle: 'Consent Requirements',
  transparencyConsentP1: 'Every data submission requires explicit consent:',
  transparencyConsentL1: 'Pairing: Child must confirm they understand supervision before linking to a parent',
  transparencyConsentL2: 'Activity: Each activity entry is manually submitted by the child',
  transparencyConsentL3: 'Location: Each location share requires a consent checkbox',
  transparencyConsentL4: 'Transparency: Children can always see what data has been shared and when',
  transparencyNotDoTitle: 'What FamilyGuard Does NOT Do',
  transparencyNotDoIntro: 'This platform explicitly does NOT support:',
  transparencyNotDoL1: 'Screen mirroring or remote screen viewing',
  transparencyNotDoL2: 'Remote camera or microphone access',
  transparencyNotDoL3: 'Hidden or covert monitoring',
  transparencyNotDoL4: 'Keylogging or message interception',
  transparencyNotDoL5: 'Background location tracking without consent',
  transparencyNotDoL6: 'Notification suppression or stealth mode',
  transparencyNotDoOutro: 'These features are intentionally excluded to comply with privacy laws and ethical standards.',
  transparencyRecoveryTitle: 'Account Recovery',
  transparencyRecoveryP1: 'FamilyGuard uses Internet Identity for authentication. Account recovery follows Internet Identity secure recovery mechanisms. We do not email passwords or store password recovery tokens.',
  transparencyLegalTitle: 'Legal Compliance',
  transparencyLegalP1: 'FamilyGuard is designed to comply with:',
  transparencyLegalL1: 'Brazil Estatuto Digital da Criança e do Adolescente (Lei 15.211/2025)',
  transparencyLegalL2: 'GDPR privacy requirements',
  transparencyLegalL3: 'COPPA child privacy protections',
  transparencyLegalL4: 'Safety by design principles',
  transparencyLastUpdated: 'Last updated: February 2026',
  
  // Parent Dashboard
  parentDashboardTitle: 'Parent Dashboard',
  parentDashboardWelcome: 'Welcome, {name}! Set up your first child connection.',
  parentDashboardDescription: 'Monitor and guide your children with transparency and consent',
  parentDashboardAlert: 'All data shown here is voluntarily submitted by your child with their explicit consent. No hidden monitoring occurs.',
  parentDashboardChildDetails: 'Child Details',
  parentDashboardChildDetailsDesc: 'View and manage settings for the selected child',
  parentDashboardTabActivity: 'Activity',
  parentDashboardTabLocation: 'Location',
  parentDashboardTabSchedule: 'Schedule',
  parentDashboardTabFilters: 'Filters',
  parentDashboardTabAlerts: 'Alerts',
  parentDashboardTabAudit: 'Audit Log',
  
  // Child Home
  childHomeWelcome: 'Welcome, {name}!',
  childHomeDescription: 'Your activity dashboard with full transparency',
  childHomeSupervisionNotice: 'Supervision Notice: Your parent can see the information you choose to share. All submissions require your explicit consent. There is no hidden monitoring.',
  childHomeNoPairingAlert: 'You are not currently paired with a parent. Ask your parent for a pairing code to connect.',
  childHomeTabCheckin: 'Check-in',
  childHomeTabHistory: 'My History',
  childHomeTabSchedule: 'Schedule',
  childHomeTabFilters: 'Filters',
  childHomeTabAlerts: 'Alerts',
  childHomeActivityHistoryTitle: 'My Activity History',
  childHomeActivityHistoryDesc: 'Activities you have submitted',
  childHomeLocationHistoryTitle: 'My Location History',
  childHomeLocationHistoryDesc: 'Locations you have shared',
  
  // Admin Panel
  adminPanelTitle: 'Admin Panel',
  adminPanelDescription: 'System management and aggregated metrics',
  adminPanelTabAccounts: 'Accounts',
  adminPanelTabLinks: 'Parent-Child Links',
  adminPanelAccountsTitle: 'User Accounts',
  adminPanelAccountsDesc: 'Manage user roles and account status',
  adminPanelLinksTitle: 'Parent-Child Links',
  adminPanelLinksDesc: 'Overview of family connections (structure only, no content)',
  adminPanelNoPairings: 'No pairings yet',
  adminPanelParent: 'Parent',
  adminPanelChildren: 'Children',
  
  // Metrics
  metricsTotalUsers: 'Total Users',
  metricsTotalParents: 'Total Parents',
  metricsTotalChildren: 'Total Children',
  metricsTotalPairings: 'Total Pairings',
  
  // Accounts Table
  accountsTableName: 'Name',
  accountsTableRole: 'Role',
  accountsTableStatus: 'Status',
  accountsTableActions: 'Actions',
  accountsTableActive: 'Active',
  accountsTableDisabled: 'Disabled',
  accountsTableDisable: 'Disable',
  accountsTableEnable: 'Enable',
  accountsTableDisableTitle: 'Disable Account',
  accountsTableDisableDesc: 'Provide a reason for disabling this account',
  accountsTableReasonLabel: 'Reason',
  accountsTableReasonPlaceholder: 'Enter reason for disabling account',
  accountsTableDisabling: 'Disabling...',
  accountsTableEnabling: 'Enabling...',
  
  // Pairing
  pairingTitle: 'Add Child Connection',
  pairingDescription: 'Generate a pairing code for your child to connect their account',
  pairingWarning: 'Note: Pairing functionality requires backend implementation. This UI demonstrates the intended user experience.',
  pairingGenerateButton: 'Generate Pairing Code',
  pairingCodeLabel: 'Share this code with your child:',
  pairingCopyButton: 'Copy Code',
  pairingCopied: 'Copied!',
  pairingHelperText: 'Your child should enter this code in their account to establish the connection.',
  
  // Child Summary Card
  childSummaryCardTitle: 'Child Account',
  childSummaryCardActivities: '{count} activities',
  childSummaryCardLastCheckin: 'Last check-in: {time}',
  childSummaryCardNoCheckins: 'No check-ins yet',
  childSummaryCardLocations: '{count} locations shared',
  
  // Activity View
  activityViewTransparency: 'All activities shown here were voluntarily submitted by your child with their explicit consent.',
  
  // Location View
  locationViewTransparency: 'All locations shown here were voluntarily shared by your child with explicit consent per submission.',
  
  // Activity History
  activityHistoryLoading: 'Loading activities...',
  activityHistoryEmpty: 'No activities submitted yet',
  activityHistoryTransparency: 'Submitted with consent',
  activityHistoryApp: 'App/Site',
  activityHistoryDuration: 'Duration',
  activityHistoryNotes: 'Notes',
  activityHistoryTime: 'Time',
  activityHistoryMinutes: '{minutes} min',
  activityHistoryNoNotes: '—',
  
  // Location History
  locationHistoryLoading: 'Loading locations...',
  locationHistoryEmpty: 'No locations shared yet',
  locationHistoryTransparency: 'Shared with consent',
  locationHistoryLatitude: 'Latitude',
  locationHistoryLongitude: 'Longitude',
  locationHistoryTime: 'Time',
  
  // Schedule Editor
  scheduleEditorAlert: 'Schedule changes are logged in the audit trail for transparency.',
  scheduleEditorTitle: 'Screen Time Schedule',
  scheduleEditorDescription: 'Set daily limits and allowed time windows',
  scheduleEditorDailyLimit: 'Daily Limit (minutes)',
  scheduleEditorTimeWindows: 'Allowed Time Windows',
  scheduleEditorDay: 'Day',
  scheduleEditorStart: 'Start',
  scheduleEditorEnd: 'End',
  scheduleEditorAddWindow: 'Add Time Window',
  scheduleEditorRemoveWindow: 'Remove',
  scheduleEditorSaveButton: 'Save Schedule',
  scheduleEditorSaving: 'Saving...',
  scheduleEditorDaySunday: 'Sunday',
  scheduleEditorDayMonday: 'Monday',
  scheduleEditorDayTuesday: 'Tuesday',
  scheduleEditorDayWednesday: 'Wednesday',
  scheduleEditorDayThursday: 'Thursday',
  scheduleEditorDayFriday: 'Friday',
  scheduleEditorDaySaturday: 'Saturday',
  
  // Schedule Read-Only
  scheduleReadOnlyLoading: 'Loading schedule...',
  scheduleReadOnlyEmpty: 'No schedule configured yet',
  scheduleReadOnlyTitle: 'My Screen Time Schedule',
  scheduleReadOnlyDescription: 'Guidance policies set by your parent',
  scheduleReadOnlyDailyLimit: 'Daily Limit: {minutes} minutes',
  scheduleReadOnlyTimeWindows: 'Allowed Time Windows',
  
  // Content Filter Editor
  filterEditorTitle: 'Content Filters',
  filterEditorDescription: 'Configure content categories and site lists',
  filterEditorNote: 'Note: Filter changes are logged in the audit trail for transparency.',
  filterEditorCategories: 'Content Categories',
  filterEditorAllowlist: 'Allowlist',
  filterEditorAllowlistPlaceholder: 'Enter allowed sites (one per line)',
  filterEditorBlocklist: 'Blocklist',
  filterEditorBlocklistPlaceholder: 'Enter blocked sites (one per line)',
  filterEditorSaveButton: 'Save Filters',
  filterEditorSaving: 'Saving...',
  
  // Content Filter Read-Only
  filterReadOnlyLoading: 'Loading filters...',
  filterReadOnlyEmpty: 'No filters configured yet',
  filterReadOnlyTitle: 'Content Filters',
  filterReadOnlyDescription: 'Guidance policies set by your parent',
  filterReadOnlyCategories: 'Content Categories',
  filterReadOnlyAllowlist: 'Allowlist',
  filterReadOnlyBlocklist: 'Blocklist',
  filterReadOnlyBlocked: 'Blocked',
  filterReadOnlyAllowed: 'Allowed',
  
  // Alerts Panel Parent
  alertsParentTitle: 'Usage Alerts',
  alertsParentDescription: 'Daily usage status and supportive notifications',
  alertsParentNoAlerts: 'No alerts at this time',
  
  // Alerts Panel Child
  alertsChildTitle: 'My Usage Alerts',
  alertsChildDescription: 'Your daily usage status',
  alertsChildNoAlerts: 'No alerts at this time',
  alertsChildRequestTitle: 'Need More Time?',
  alertsChildRequestDescription: 'Send a note to your parent explaining why you need additional time',
  alertsChildRequestPlaceholder: 'Explain why you need more time...',
  alertsChildRequestButton: 'Send Request',
  alertsChildRequestSending: 'Sending...',
  
  // Audit Log
  auditLogLoading: 'Loading audit log...',
  auditLogEmpty: 'No audit entries yet',
  auditLogAction: 'Action',
  auditLogExecutor: 'Executor',
  auditLogTime: 'Time',
  auditLogActionPairing: 'Pairing Created',
  auditLogActionSchedule: 'Schedule Updated',
  auditLogActionFilter: 'Filter Updated',
  auditLogActionDisabled: 'Account Disabled',
  
  // Check-in
  checkinTabActivity: 'Activity',
  checkinTabLocation: 'Location',
  checkinActivityTitle: 'Submit Activity',
  checkinActivityAppLabel: 'App/Website',
  checkinActivityAppPlaceholder: 'e.g., YouTube, Instagram',
  checkinActivityDurationLabel: 'Duration (minutes)',
  checkinActivityNotesLabel: 'Notes (optional)',
  checkinActivityNotesPlaceholder: 'What did you do?',
  checkinActivityConsent: 'I consent to sharing this activity with my parent',
  checkinActivityPreview: 'Preview: Your parent will see this activity entry with the timestamp.',
  checkinActivitySubmitButton: 'Submit Activity',
  checkinActivitySubmitting: 'Submitting...',
  checkinLocationTitle: 'Share Location',
  checkinLocationLatLabel: 'Latitude',
  checkinLocationLonLabel: 'Longitude',
  checkinLocationConsent: 'I consent to sharing this location with my parent',
  checkinLocationPreview: 'Preview: Your parent will see these coordinates with the timestamp.',
  checkinLocationSubmitButton: 'Share Location',
  checkinLocationSubmitting: 'Submitting...',
  
  // Consent Notice
  consentNoticeActivityTitle: 'Activity Submission Consent',
  consentNoticeActivityMessage: 'By submitting this activity, you consent to sharing it with your parent. This action is voluntary and transparent.',
  consentNoticeLocationTitle: 'Location Sharing Consent',
  consentNoticeLocationMessage: 'By sharing this location, you consent to your parent viewing these coordinates. This action is voluntary and transparent.',
  consentNoticePairingTitle: 'Pairing Consent',
  consentNoticePairingMessage: 'By pairing with a parent, you understand that they will be able to view the information you choose to share. All future submissions will require your explicit consent.',
  
  // Language Selector
  languageSelectorLabel: 'Language',
  languageEnglish: 'English',
  languagePortuguese: 'Português (BR)',
  
  // Role labels
  roleUnknown: 'Unknown role. Please contact support.',
} as const;

export type TranslationKey = keyof typeof en;
