// Onboarding progress tracking for agents
const ONBOARDING_KEY = 'agent_onboarding_progress'

export interface OnboardingProgress {
  visitedBranding: boolean
  visitedInvite: boolean
  visitedTemplates: boolean
  completed: boolean
}

export const getOnboardingProgress = (): OnboardingProgress => {
  if (typeof window === 'undefined') {
    return { visitedBranding: false, visitedInvite: false, visitedTemplates: false, completed: false }
  }
  const stored = localStorage.getItem(ONBOARDING_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return { visitedBranding: false, visitedInvite: false, visitedTemplates: false, completed: false }
    }
  }
  return { visitedBranding: false, visitedInvite: false, visitedTemplates: false, completed: false }
}

export const saveOnboardingProgress = (progress: OnboardingProgress) => {
  if (typeof window === 'undefined') return
  // Check if all steps are done
  if (progress.visitedBranding && progress.visitedInvite && progress.visitedTemplates) {
    progress.completed = true
  }
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(progress))
}

export const markBrandingVisited = () => {
  const progress = getOnboardingProgress()
  if (!progress.visitedBranding) {
    progress.visitedBranding = true
    saveOnboardingProgress(progress)
  }
}

export const markInviteVisited = () => {
  const progress = getOnboardingProgress()
  if (!progress.visitedInvite) {
    progress.visitedInvite = true
    saveOnboardingProgress(progress)
  }
}

export const markTemplatesVisited = () => {
  const progress = getOnboardingProgress()
  if (!progress.visitedTemplates) {
    progress.visitedTemplates = true
    saveOnboardingProgress(progress)
  }
}
