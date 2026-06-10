export type TrialStatus = 'live' | 'won' | 'archived'

export interface TrialGroup {
  id: string
  name: string
  status: TrialStatus
  testType: string
  contentTheme: string[]
  uploadDate: string
  publishDate: string
  tags: string[]
  notes: string
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
  platform: string[]
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

export type TagCategory = 'duration' | 'content-style' | 'audio' | 'audience' | 'hook-type' | 'custom'

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
