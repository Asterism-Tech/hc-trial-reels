import { TrialGroup, Version } from './types'

export const REMINDER_DELAY_DAYS = 3

export interface CampaignReminder {
  group: TrialGroup
  winner: Version
  daysSincePublish: number
}

function isCampaignDataMissing(winner: Version, group: TrialGroup): boolean {
  return winner.views === 0 || winner.followersGained === 0 || !group.notes?.trim()
}

/**
 * A reminder fires 3 days after a winner is published, until the campaign
 * data (views, followers from reel, notes) has been filled in or the
 * reminder is dismissed.
 */
export function getCampaignReminders(groups: TrialGroup[]): CampaignReminder[] {
  const now = new Date()
  const reminders: CampaignReminder[] = []

  for (const group of groups) {
    if (group.dataReminderDismissed || !group.publishDate) continue
    const winner = group.versions.find((v) => v.isWinner)
    if (!winner) continue

    const daysSincePublish = Math.floor(
      (now.getTime() - new Date(group.publishDate).getTime()) / (24 * 60 * 60 * 1000)
    )
    if (daysSincePublish < REMINDER_DELAY_DAYS) continue
    if (!isCampaignDataMissing(winner, group)) continue

    reminders.push({ group, winner, daysSincePublish })
  }

  return reminders.sort((a, b) => b.daysSincePublish - a.daysSincePublish)
}
