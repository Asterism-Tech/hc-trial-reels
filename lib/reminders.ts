import { TrialGroup } from './types'

export const REMINDER_DELAY_DAYS = 3

export interface CampaignReminder {
  group: TrialGroup
  daysSinceCreated: number
}

// For a finished trial the winner's data is what matters; for a live trial
// every version still needs its numbers filled in.
function isCampaignDataMissing(group: TrialGroup): boolean {
  const winner = group.versions.find((v) => v.isWinner)
  if (winner) {
    return winner.views === 0 || winner.followersGained === 0 || !group.notes?.trim()
  }
  return group.versions.some((v) => v.views === 0) || !group.notes?.trim()
}

/**
 * The date a group's campaign-data reminder becomes due: 3 days after the
 * trial group is created, pushed to the following Monday if it lands on a
 * weekend.
 */
export function reminderDueDate(createdAt: string): Date {
  const due = new Date(createdAt)
  due.setDate(due.getDate() + REMINDER_DELAY_DAYS)
  const day = due.getDay()
  if (day === 6) due.setDate(due.getDate() + 2) // Saturday → Monday
  else if (day === 0) due.setDate(due.getDate() + 1) // Sunday → Monday
  due.setHours(0, 0, 0, 0)
  return due
}

/**
 * A reminder fires once its due date arrives, until the campaign data
 * (views, followers from reel, notes) has been filled in or the reminder
 * is dismissed.
 */
export function getCampaignReminders(groups: TrialGroup[]): CampaignReminder[] {
  const now = new Date()
  const reminders: CampaignReminder[] = []

  for (const group of groups) {
    if (group.dataReminderDismissed || !group.createdAt) continue
    if (group.versions.length === 0) continue

    if (now < reminderDueDate(group.createdAt)) continue
    if (!isCampaignDataMissing(group)) continue

    const daysSinceCreated = Math.floor(
      (now.getTime() - new Date(group.createdAt).getTime()) / (24 * 60 * 60 * 1000)
    )
    reminders.push({ group, daysSinceCreated })
  }

  return reminders.sort((a, b) => b.daysSinceCreated - a.daysSinceCreated)
}
