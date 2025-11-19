/**
 * Subscription Utilities
 *
 * Helper functions for checking subscription tiers and features.
 */

export type SubscriptionTier = 'FREE' | 'PREMIUM' | 'PRO';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE';

export interface SubscriptionLimits {
  maxUploadsPerMonth: number;
  maxPresets: number;
  canUseAdvancedAnalysis: boolean;
  canUsePremiumVisualizers: boolean;
  canUseAIGeneration: boolean;
  canUseTemplates: boolean;
  canUseAPI: boolean;
  canExportWhiteLabel: boolean;
}

/**
 * Get subscription limits based on tier
 */
export function getSubscriptionLimits(tier: SubscriptionTier): SubscriptionLimits {
  switch (tier) {
    case 'PRO':
      return {
        maxUploadsPerMonth: -1, // Unlimited
        maxPresets: -1, // Unlimited
        canUseAdvancedAnalysis: true,
        canUsePremiumVisualizers: true,
        canUseAIGeneration: true,
        canUseTemplates: true,
        canUseAPI: true,
        canExportWhiteLabel: true,
      };

    case 'PREMIUM':
      return {
        maxUploadsPerMonth: -1, // Unlimited
        maxPresets: -1, // Unlimited
        canUseAdvancedAnalysis: true,
        canUsePremiumVisualizers: true,
        canUseAIGeneration: false,
        canUseTemplates: false,
        canUseAPI: false,
        canExportWhiteLabel: false,
      };

    case 'FREE':
    default:
      return {
        maxUploadsPerMonth: 5,
        maxPresets: 10,
        canUseAdvancedAnalysis: false,
        canUsePremiumVisualizers: false,
        canUseAIGeneration: false,
        canUseTemplates: false,
        canUseAPI: false,
        canExportWhiteLabel: false,
      };
  }
}

/**
 * Check if user has active subscription
 */
export function hasActiveSubscription(
  tier: SubscriptionTier,
  status: SubscriptionStatus
): boolean {
  return (tier === 'PREMIUM' || tier === 'PRO') && status === 'ACTIVE';
}

/**
 * Check if user can upload more files
 */
export function canUpload(
  tier: SubscriptionTier,
  uploadsThisMonth: number
): boolean {
  const limits = getSubscriptionLimits(tier);

  if (limits.maxUploadsPerMonth === -1) {
    return true; // Unlimited
  }

  return uploadsThisMonth < limits.maxUploadsPerMonth;
}

/**
 * Check if user can create more presets
 */
export function canCreatePreset(
  tier: SubscriptionTier,
  currentPresetCount: number
): boolean {
  const limits = getSubscriptionLimits(tier);

  if (limits.maxPresets === -1) {
    return true; // Unlimited
  }

  return currentPresetCount < limits.maxPresets;
}

/**
 * Check if user has access to feature
 */
export function hasFeatureAccess(
  tier: SubscriptionTier,
  feature: keyof Omit<SubscriptionLimits, 'maxUploadsPerMonth' | 'maxPresets'>
): boolean {
  const limits = getSubscriptionLimits(tier);
  return limits[feature];
}

/**
 * Get feature name for display
 */
export function getFeatureName(
  feature: keyof Omit<SubscriptionLimits, 'maxUploadsPerMonth' | 'maxPresets'>
): string {
  const featureNames = {
    canUseAdvancedAnalysis: 'Advanced Audio Analysis',
    canUsePremiumVisualizers: 'Premium Visualizers',
    canUseAIGeneration: 'AI Preset Generation',
    canUseTemplates: 'Custom Templates',
    canUseAPI: 'API Access',
    canExportWhiteLabel: 'White-Label Export',
  };

  return featureNames[feature] || feature;
}

/**
 * Get minimum tier required for feature
 */
export function getMinimumTierForFeature(
  feature: keyof Omit<SubscriptionLimits, 'maxUploadsPerMonth' | 'maxPresets'>
): SubscriptionTier {
  const proOnlyFeatures: Array<keyof SubscriptionLimits> = [
    'canUseAIGeneration',
    'canUseTemplates',
    'canUseAPI',
    'canExportWhiteLabel',
  ];

  if (proOnlyFeatures.includes(feature as keyof SubscriptionLimits)) {
    return 'PRO';
  }

  const premiumFeatures: Array<keyof SubscriptionLimits> = [
    'canUseAdvancedAnalysis',
    'canUsePremiumVisualizers',
  ];

  if (premiumFeatures.includes(feature as keyof SubscriptionLimits)) {
    return 'PREMIUM';
  }

  return 'FREE';
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  const names = {
    FREE: 'Free',
    PREMIUM: 'Premium',
    PRO: 'Pro',
  };

  return names[tier];
}

/**
 * Get tier color for UI
 */
export function getTierColor(tier: SubscriptionTier): string {
  const colors = {
    FREE: 'text-text-secondary',
    PREMIUM: 'text-ui-blue',
    PRO: 'text-ui-yellow',
  };

  return colors[tier];
}
