'use client';

/**
 * Beatbox Mic - Home Page
 *
 * Landing page with:
 * - Hero section with CTA to upload audio or browse presets
 * - Feature highlights
 * - How it works section
 * - Pricing tiers
 * - Footer
 */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border-color">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ui-green rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎤</span>
            </div>
            <h1 className="text-2xl font-bold text-gradient-green">
              Beatbox Mic
            </h1>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Pricing
            </a>
            <a
              href="/presets"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Browse Presets
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="/login"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Login
            </a>
            <a href="/signup" className="btn-primary">
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Transform Your Beatbox Sound
            <br />
            <span className="text-gradient-blue">
              with AI-Powered Presets
            </span>
          </h2>

          <p className="text-xl text-text-secondary mb-12 leading-relaxed">
            Upload professional beatbox recordings to extract EQ curves, compression
            settings, and reverb characteristics. Apply these presets to your live
            microphone for <strong className="text-text-primary">professional-grade sound</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/upload" className="btn-success text-lg px-8 py-4">
              📁 Upload Audio to Analyze
            </a>
            <a href="/presets" className="btn-secondary text-lg px-8 py-4">
              🔍 Browse Preset Library
            </a>
          </div>

          <div className="mt-12 text-sm text-text-disabled">
            ✨ No audio engineering knowledge required • ⚡ &lt;20ms latency • 🆓 Free to start
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border-color bg-bg-secondary py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-ui-green mb-2">10,000+</div>
              <div className="text-text-secondary">Presets Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-ui-blue mb-2">&lt;20ms</div>
              <div className="text-text-secondary">Latency</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-ui-yellow mb-2">5,000+</div>
              <div className="text-text-secondary">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-text-primary mb-2">100%</div>
              <div className="text-text-secondary">Free Tier</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold mb-4">Powerful Features</h3>
          <p className="text-xl text-text-secondary">
            Everything you need for professional beatbox sound
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card">
            <div className="text-4xl mb-4">📊</div>
            <h4 className="text-xl font-bold mb-2">Advanced DSP Analysis</h4>
            <p className="text-text-secondary">
              FFT-based frequency analysis extracts accurate EQ curves, compression
              settings, and reverb characteristics from any audio recording.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card">
            <div className="text-4xl mb-4">⚡</div>
            <h4 className="text-xl font-bold mb-2">Real-Time Processing</h4>
            <p className="text-text-secondary">
              Apply presets to your live microphone with imperceptible latency
              (&lt;20ms) using professional Web Audio API processing chain.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card">
            <div className="text-4xl mb-4">🎛️</div>
            <h4 className="text-xl font-bold mb-2">10-Band Parametric EQ</h4>
            <p className="text-text-secondary">
              Professional-grade equalizer with smooth parameter transitions and
              visual frequency response curve.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="card">
            <div className="text-4xl mb-4">🎚️</div>
            <h4 className="text-xl font-bold mb-2">Dynamic Compression</h4>
            <p className="text-text-secondary">
              Automatic detection of compression settings (threshold, ratio,
              attack/release) with real-time gain reduction meter.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="card">
            <div className="text-4xl mb-4">🌊</div>
            <h4 className="text-xl font-bold mb-2">Reverb Processing</h4>
            <p className="text-text-secondary">
              Multiple reverb types (room, hall, plate, spring) with automatic
              wet/dry mix detection and RT60 calculation.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="card">
            <div className="text-4xl mb-4">📈</div>
            <h4 className="text-xl font-bold mb-2">Live Visualization</h4>
            <p className="text-text-secondary">
              Real-time waveform and spectrum analyzer with clipping detection
              and input/output level meters.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-bg-secondary py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">How It Works</h3>
            <p className="text-xl text-text-secondary">
              From upload to live processing in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-ui-blue rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="text-xl font-bold mb-2">Upload Audio</h4>
              <p className="text-text-secondary">
                Upload a professional beatbox recording (MP3, WAV, OGG, M4A)
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-ui-green rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 text-black">
                2
              </div>
              <h4 className="text-xl font-bold mb-2">AI Analysis</h4>
              <p className="text-text-secondary">
                Our DSP engine extracts EQ, compression, and reverb settings
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-ui-yellow rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 text-black">
                3
              </div>
              <h4 className="text-xl font-bold mb-2">Save Preset</h4>
              <p className="text-text-secondary">
                Review detected settings and save as a preset to your library
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-ui-red rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h4 className="text-xl font-bold mb-2">Apply Live</h4>
              <p className="text-text-secondary">
                Apply preset to your microphone and sound like a pro in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold mb-4">Simple Pricing</h3>
          <p className="text-xl text-text-secondary">
            Choose the plan that fits your needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="card">
            <h4 className="text-2xl font-bold mb-2">Free</h4>
            <div className="text-4xl font-bold mb-4">
              $0<span className="text-lg text-text-secondary">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-ui-green">✓</span>
                <span>10 audio uploads</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green">✓</span>
                <span>10 presets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green">✓</span>
                <span>50 downloads/month</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green">✓</span>
                <span>Standard processing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-text-disabled">✗</span>
                <span className="text-text-disabled">Ads displayed</span>
              </li>
            </ul>
            <a href="/signup" className="btn-secondary w-full text-center">
              Get Started
            </a>
          </div>

          {/* Premium Tier */}
          <div className="card-elevated border-ui-blue">
            <div className="badge badge-info mb-4">Most Popular</div>
            <h4 className="text-2xl font-bold mb-2">Premium</h4>
            <div className="text-4xl font-bold mb-4">
              $9.99<span className="text-lg text-text-secondary">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-ui-green">✓</span>
                <span>Unlimited uploads</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green">✓</span>
                <span>Unlimited presets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green">✓</span>
                <span>Unlimited downloads</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green">✓</span>
                <span>Priority processing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green">✓</span>
                <span>No ads</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green">✓</span>
                <span>Advanced analytics</span>
              </li>
            </ul>
            <a href="/signup?plan=premium" className="btn-primary w-full text-center">
              Start Free Trial
            </a>
          </div>

          {/* Pro Tier */}
          <div className="card">
            <h4 className="text-2xl font-bold mb-2">Pro</h4>
            <div className="text-4xl font-bold mb-4">
              $29.99<span className="text-lg text-text-secondary">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-ui-green">✓</span>
                <span>All Premium features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green">✓</span>
                <span>Custom branding</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green">✓</span>
                <span>API access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green">✓</span>
                <span>Collaboration tools</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-green">✓</span>
                <span>Priority support</span>
              </li>
            </ul>
            <a href="/signup?plan=pro" className="btn-secondary w-full text-center">
              Start Free Trial
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-color bg-bg-secondary py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h5 className="font-bold mb-4">Beatbox Mic</h5>
              <p className="text-text-secondary text-sm">
                Professional audio preset analyzer for beatboxers worldwide.
              </p>
            </div>

            <div>
              <h5 className="font-bold mb-4">Product</h5>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li><a href="/features" className="hover:text-text-primary">Features</a></li>
                <li><a href="/pricing" className="hover:text-text-primary">Pricing</a></li>
                <li><a href="/presets" className="hover:text-text-primary">Browse Presets</a></li>
                <li><a href="/upload" className="hover:text-text-primary">Upload Audio</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-4">Resources</h5>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li><a href="/docs" className="hover:text-text-primary">Documentation</a></li>
                <li><a href="/blog" className="hover:text-text-primary">Blog</a></li>
                <li><a href="/support" className="hover:text-text-primary">Support</a></li>
                <li><a href="/api" className="hover:text-text-primary">API</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-4">Legal</h5>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li><a href="/privacy" className="hover:text-text-primary">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-text-primary">Terms of Service</a></li>
                <li><a href="/cookies" className="hover:text-text-primary">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border-color pt-8 text-center text-text-secondary text-sm">
            <p>© 2024 Beatbox Mic. Built with ❤️ for the beatbox community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
