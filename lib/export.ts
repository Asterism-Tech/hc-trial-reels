import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { TrialGroup } from './types'
import { formatDate, formatNumber } from './utils'

export interface TrendAnalysis {
  summary: string
  trends: string[]
  recommendations: string[]
}

export interface ExportOptions {
  groups: TrialGroup[]
  startDate: string
  endDate: string
  analysis: TrendAnalysis | null
}

const AUBERGINE = '#45132c'
const PINK = '#ed4a7e'

function reportFilename(ext: string, startDate: string, endDate: string) {
  return `reel-report_${startDate}_to_${endDate}.${ext}`
}

function groupRows(groups: TrialGroup[]) {
  return groups.map((g) => {
    const winner = g.versions.find((v) => v.isWinner)
    return {
      'Reel Group': g.name,
      'Status': g.status === 'won' ? 'Published' : g.status,
      'Test Type': g.testType,
      'Content Theme': g.contentTheme.join(', '),
      'Global Tags': g.tags.join(', '),
      'Upload Date': g.uploadDate || '',
      'Publish Date': g.publishDate || '',
      'Versions': g.versions.length,
      'Winner': winner ? `V${winner.versionNumber}` : '',
      'Winner Views': winner?.views ?? '',
      'Winner Followers Gained': winner?.followersGained ?? '',
      'Notes': g.notes,
    }
  })
}

function versionRows(groups: TrialGroup[]) {
  return groups.flatMap((g) =>
    g.versions.map((v) => ({
      'Reel Group': g.name,
      'Version': `V${v.versionNumber}`,
      'Result': v.isWinner ? 'Winner (Published)' : g.status === 'won' ? 'Archived' : 'Live',
      'Version Tags': v.tags.join(', '),
      'Platform': v.platform.join(', '),
      'Hook Type': v.hookType,
      'Hook Text': v.hookText,
      'Differences': v.differences,
      'Length (s)': v.videoLengthSeconds,
      'Views': v.views,
      'Accounts Reached': v.accountsReached,
      'Likes': v.likes,
      'Comments': v.comments,
      'Shares': v.shares,
      'Saves': v.saves,
      'Profile Visits': v.profileVisits,
      'Followers Gained': v.followersGained,
      'Watch Time (s)': v.watchTimeSeconds,
      'Completion Rate (%)': v.completionRatePct,
    }))
  )
}

export function exportExcel({ groups, startDate, endDate, analysis }: ExportOptions) {
  const wb = XLSX.utils.book_new()

  const totalViews = groups.flatMap((g) => g.versions).reduce((s, v) => s + v.views, 0)
  const summarySheet = XLSX.utils.aoa_to_sheet([
    ['Hobbycraft Reel Hub — Design Report'],
    [],
    ['Report Period', `${startDate} to ${endDate}`],
    ['Generated', new Date().toISOString().slice(0, 10)],
    ['Reel Groups', groups.length],
    ['Versions Tested', groups.reduce((s, g) => s + g.versions.length, 0)],
    ['Published Winners', groups.filter((g) => g.versions.some((v) => v.isWinner)).length],
    ['Total Views', totalViews],
  ])
  summarySheet['!cols'] = [{ wch: 24 }, { wch: 40 }]
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary')

  const reelsSheet = XLSX.utils.json_to_sheet(groupRows(groups))
  reelsSheet['!cols'] = [{ wch: 28 }, { wch: 10 }, { wch: 16 }, { wch: 24 }, { wch: 24 }, { wch: 12 }, { wch: 12 }, { wch: 9 }, { wch: 8 }, { wch: 12 }, { wch: 20 }, { wch: 40 }]
  XLSX.utils.book_append_sheet(wb, reelsSheet, 'Reels')

  const versionsSheet = XLSX.utils.json_to_sheet(versionRows(groups))
  versionsSheet['!cols'] = [{ wch: 28 }, { wch: 8 }, { wch: 18 }, { wch: 24 }, { wch: 18 }, { wch: 10 }, { wch: 30 }, { wch: 30 }]
  XLSX.utils.book_append_sheet(wb, versionsSheet, 'Versions')

  if (analysis) {
    const aiSheet = XLSX.utils.aoa_to_sheet([
      ['AI Trend Analysis', `${startDate} to ${endDate}`],
      [],
      ['Summary'],
      [analysis.summary],
      [],
      ['Trends'],
      ...analysis.trends.map((t) => [`• ${t}`]),
      [],
      ['Recommendations'],
      ...analysis.recommendations.map((r) => [`• ${r}`]),
    ])
    aiSheet['!cols'] = [{ wch: 110 }]
    XLSX.utils.book_append_sheet(wb, aiSheet, 'AI Trend Analysis')
  }

  XLSX.writeFile(wb, reportFilename('xlsx', startDate, endDate))
}

export function exportPdf({ groups, startDate, endDate, analysis }: ExportOptions) {
  const doc = new jsPDF({ orientation: 'landscape' })
  const pageWidth = doc.internal.pageSize.getWidth()

  // Branded header
  doc.setFillColor(AUBERGINE)
  doc.rect(0, 0, pageWidth, 26, 'F')
  doc.setTextColor('#ffffff')
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Hobbycraft Reel Hub — Design Report', 14, 12)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Report period: ${formatDate(startDate)} – ${formatDate(endDate)}    ·    Generated ${formatDate(new Date().toISOString())}`, 14, 20)

  // Summary strip
  const allVersions = groups.flatMap((g) => g.versions)
  const totalViews = allVersions.reduce((s, v) => s + v.views, 0)
  doc.setTextColor(AUBERGINE)
  doc.setFontSize(10)
  doc.text(
    `${groups.length} reel groups   ·   ${allVersions.length} versions tested   ·   ${groups.filter((g) => g.versions.some((v) => v.isWinner)).length} published winners   ·   ${formatNumber(totalViews)} total views`,
    14,
    34
  )

  // Reels table
  autoTable(doc, {
    startY: 40,
    head: [['Reel Group', 'Status', 'Test Type', 'Global Tags', 'Published', 'Winner', 'Winner Views', 'Followers from Reel']],
    body: groups.map((g) => {
      const winner = g.versions.find((v) => v.isWinner)
      return [
        g.name,
        g.status === 'won' ? 'Published' : g.status,
        g.testType,
        g.tags.join(', '),
        g.publishDate ? formatDate(g.publishDate) : '—',
        winner ? `V${winner.versionNumber}` : '—',
        winner ? formatNumber(winner.views) : '—',
        winner ? String(winner.followersGained) : '—',
      ]
    }),
    headStyles: { fillColor: AUBERGINE, fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: '#45132c' },
    alternateRowStyles: { fillColor: '#faf6f0' },
  })

  // Versions table
  let y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Version Comparison', 14, y)
  autoTable(doc, {
    startY: y + 4,
    head: [['Reel Group', 'Version', 'Result', 'Version Tags', 'Hook', 'Views', 'Likes', 'Saves', 'Followers', 'Completion %']],
    body: groups.flatMap((g) =>
      g.versions.map((v) => [
        g.name,
        `V${v.versionNumber}`,
        v.isWinner ? 'Winner' : g.status === 'won' ? 'Archived' : 'Live',
        v.tags.join(', '),
        v.hookType,
        formatNumber(v.views),
        formatNumber(v.likes),
        formatNumber(v.saves),
        String(v.followersGained),
        `${v.completionRatePct}%`,
      ])
    ),
    headStyles: { fillColor: AUBERGINE, fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: '#45132c' },
    alternateRowStyles: { fillColor: '#faf6f0' },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2 && data.cell.raw === 'Winner') {
        data.cell.styles.textColor = PINK
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })

  // AI trend analysis
  if (analysis) {
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12
    if (y > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage()
      y = 20
    }
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(PINK)
    doc.text('AI Trend Analysis', 14, y)
    doc.setTextColor(AUBERGINE)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')

    const writeBlock = (text: string, startY: number): number => {
      const lines = doc.splitTextToSize(text, pageWidth - 28)
      doc.text(lines, 14, startY)
      return startY + lines.length * 4.5 + 3
    }

    y = writeBlock(analysis.summary, y + 7)
    doc.setFont('helvetica', 'bold')
    doc.text('Trends', 14, y)
    doc.setFont('helvetica', 'normal')
    y += 5
    for (const t of analysis.trends) y = writeBlock(`•  ${t}`, y)
    doc.setFont('helvetica', 'bold')
    doc.text('Recommendations', 14, y + 2)
    doc.setFont('helvetica', 'normal')
    y += 7
    for (const r of analysis.recommendations) y = writeBlock(`•  ${r}`, y)
  }

  doc.save(reportFilename('pdf', startDate, endDate))
}
