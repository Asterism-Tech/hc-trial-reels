export type TrialStatus = 'live' | 'won' | 'archived'

export type WorkflowStage =
  | 'setup'
  | 'awaiting_24h'
  | 'winner_selection'
  | 'awaiting_3d'
  | 'awaiting_7d'
  | 'complete'

export type SnapshotPoint = '24h' | '3d' | '7d'

export interface Snapshot {
  takenAt: SnapshotPoint
  capturedDate: string
  views: number
  accountsReached: number
  likes: number
  comments: number
  shares: number
  saves: number
  profileVisits: number
  followersGained: number
  watchTimeSeconds: number
  completionRatePct: number
  successScore: number | null
}

export interface TrialGroup {
  id: string
  name: string
  status: TrialStatus
  workflowStage: WorkflowStage
  testType: string
  contentTheme: string[]
  uploadDate: string
  publishDate: string
  /** Global tags — apply to every version in the group */
  tags: string[]
  notes: string
  dataReminderDismissed: boolean
  versions: Version[]
  createdAt: string
  updatedAt: string
}

export interface Version {
  id: string
  trialGroupId: string
  versionNumber: number
  totalVersions: number
  isWinner: boolean
  isPublished: boolean
  /** Primary platform — always Instagram for Hobbycraft trials */
  platform: string[]
  /** Where this version was also published, if anywhere (e.g. TikTok) */
  secondaryPlatform: string[]
  secondaryPlatformDate: string | null
  secondaryPlatformNotes: string
  /** Stats at 24h, 3d, and 7d snapshot points */
  snapshots: Snapshot[]
  differences: string
  hookType: string
  hookText: string
  videoLengthSeconds: number
  faceOnCamera: boolean
  hasVoiceover: boolean
  audioType: string
  textOverlay: boolean
  caption: string
  ctaUsed: string[]
  targetAgeGroup: string
  /** Version tags — used to compare versions against each other */
  tags: string[]
  /** Convenience fields — mirror the 24h snapshot for backwards compat */
  views: number
  accountsReached: number
  likes: number
  comments: number
  shares: number
  saves: number
  profileVisits: number
  followersGained: number
  watchTimeSeconds: number
  completionRatePct: number
  teamComments: string
  thumbnailUrl: string
  createdAt: string
  updatedAt: string
}

export interface CustomTag {
  id: string
  name: string
  category: TagCategory
  color: string
}

export type TagCategory =
  | 'test-type'
  | 'audience'
  | 'audio'
  | 'hook-type'
  | 'video-length'
  | 'content-theme'
  | 'format'
  | 'custom'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface AIInsights {
  shortTermInsights: string[]
  longTermInsights: string[]
  contentSuggestions: string[]
  watchOut: string[]
}
