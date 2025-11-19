'use client';

/**
 * Pricing Page
 *
 * Subscription tiers and checkout.
 * Features:
 * - Three tiers: Free, Premium ($9.99/mo), Pro ($19.99/mo)
 * - Feature comparison
 * - Stripe checkout integration
 * - Current subscription display
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  const currentTier = session?.user?.subscriptionTier || 'FREE';

  const handleSubscribe = async (tier: 'PREMIUM' | 'PRO') => {
    if (!session) {
      router.push('/login');
      return;
    }

    setError('');
    setIsLoading(tier);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to start checkout');
        setIsLoading(null);
      }
    } catch (err) {
      setError('Failed to start checkout');
      setIsLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to open billing portal');
      }
    } catch (err) {
      setError('Failed to open billing portal');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border-color">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center">Choose Your Plan</h1>
          <p className="text-text-secondary text-center mt-2">
            Unlock premium features and take your beatbox to the next level
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Success Message */}
        {success && (
          <div className="bg-ui-green/10 border border-ui-green/30 text-ui-green px-6 py-4 rounded-lg mb-8 text-center">
            🎉 Subscription successful! Welcome to premium features!
          </div>
        )}

        {/* Canceled Message */}
        {canceled && (
          <div className="bg-ui-yellow/10 border border-ui-yellow/30 text-ui-yellow px-6 py-4 rounded-lg mb-8 text-center">
            Checkout canceled. No charges were made.
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-ui-red/10 border border-ui-red/30 text-ui-red px-6 py-4 rounded-lg mb-8 text-center">
            {error}
          </div>
        )}

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Tier */}
          <div className="card border-2 border-border-color">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-2">$0</div>
              <div className="text-text-secondary text-sm">Forever free</div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-ui-green mt-1">✓</span>
                <span className="text-sm">Upload 5 audio files/month</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green mt-1">✓</span>
                <span className="text-sm">Basic audio analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green mt-1">✓</span>
                <span className="text-sm">Create 10 presets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green mt-1">✓</span>
                <span className="text-sm">Browse community presets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green mt-1">✓</span>
                <span className="text-sm">Basic live processing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-text-disabled mt-1">✗</span>
                <span className="text-sm text-text-disabled">Advanced visualizers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-text-disabled mt-1">✗</span>
                <span className="text-sm text-text-disabled">Preset templates</span>
              </li>
            </ul>

            <button
              className="btn-secondary w-full"
              disabled={currentTier !== 'FREE'}
            >
              {currentTier === 'FREE' ? 'Current Plan' : 'Downgrade'}
            </button>
          </div>

          {/* Premium Tier */}
          <div className="card border-2 border-ui-blue relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-ui-blue text-white px-4 py-1 rounded-full text-sm font-bold">
              Most Popular
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <div className="text-4xl font-bold mb-2">
                $9<span className="text-xl text-text-secondary">.99</span>
              </div>
              <div className="text-text-secondary text-sm">per month</div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-ui-green mt-1">✓</span>
                <span className="text-sm font-medium">Everything in Free, plus:</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green mt-1">✓</span>
                <span className="text-sm">Unlimited uploads</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green mt-1">✓</span>
                <span className="text-sm">Advanced audio analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green mt-1">✓</span>
                <span className="text-sm">Unlimited presets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green mt-1">✓</span>
                <span className="text-sm">Premium visualizers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green mt-1">✓</span>
                <span className="text-sm">Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-text-disabled mt-1">✗</span>
                <span className="text-sm text-text-disabled">AI preset generation</span>
              </li>
            </ul>

            {currentTier === 'PREMIUM' ? (
              <button
                onClick={handleManageSubscription}
                className="btn-secondary w-full"
              >
                Manage Subscription
              </button>
            ) : (
              <button
                onClick={() => handleSubscribe('PREMIUM')}
                disabled={isLoading === 'PREMIUM'}
                className="btn-success w-full"
              >
                {isLoading === 'PREMIUM' ? 'Loading...' : 'Subscribe Now'}
              </button>
            )}
          </div>

          {/* Pro Tier */}
          <div className="card border-2 border-ui-yellow">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-2">
                $19<span className="text-xl text-text-secondary">.99</span>
              </div>
              <div className="text-text-secondary text-sm">per month</div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-ui-green mt-1">✓</span>
                <span className="text-sm font-medium">Everything in Premium, plus:</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green mt-1">✓</span>
                <span className="text-sm">AI-powered preset generation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green mt-1">✓</span>
                <span className="text-sm">Custom preset templates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green mt-1">✓</span>
                <span className="text-sm">Advanced analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green mt-1">✓</span>
                <span className="text-sm">White-label export</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green mt-1">✓</span>
                <span className="text-sm">API access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green mt-1">✓</span>
                <span className="text-sm">24/7 priority support</span>
              </li>
            </ul>

            {currentTier === 'PRO' ? (
              <button
                onClick={handleManageSubscription}
                className="btn-secondary w-full"
              >
                Manage Subscription
              </button>
            ) : (
              <button
                onClick={() => handleSubscribe('PRO')}
                disabled={isLoading === 'PRO'}
                className="btn-success w-full"
              >
                {isLoading === 'PRO' ? 'Loading...' : 'Subscribe Now'}
              </button>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold mb-2">Can I cancel anytime?</h3>
              <p className="text-text-secondary text-sm">
                Yes! You can cancel your subscription at any time from your billing portal.
                You'll continue to have access until the end of your billing period.
              </p>
            </div>

            <div className="card">
              <h3 className="font-bold mb-2">What payment methods do you accept?</h3>
              <p className="text-text-secondary text-sm">
                We accept all major credit cards (Visa, Mastercard, American Express) through Stripe.
              </p>
            </div>

            <div className="card">
              <h3 className="font-bold mb-2">Can I upgrade or downgrade later?</h3>
              <p className="text-text-secondary text-sm">
                Absolutely! You can change your plan at any time. Upgrades take effect immediately,
                and downgrades take effect at the end of your current billing period.
              </p>
            </div>

            <div className="card">
              <h3 className="font-bold mb-2">Do you offer refunds?</h3>
              <p className="text-text-secondary text-sm">
                We offer a 7-day money-back guarantee. If you're not satisfied, contact us within
                7 days of your purchase for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
