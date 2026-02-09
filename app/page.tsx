export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">CB</div>
            <span className="font-semibold text-lg">ChatBots</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-600">
            <a href="#features" className="hover:text-zinc-900 transition">Features</a>
            <a href="#how-it-works" className="hover:text-zinc-900 transition">How It Works</a>
            <a href="#pricing" className="hover:text-zinc-900 transition">Pricing</a>
            <a href="#contact" className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition font-medium">Get Started</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Now with Multi-Engine AI Support
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Intelligent Chatbots<br />
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">For Your Business</span>
          </h1>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Deploy AI-powered chatbots across web, mobile, and messaging platforms in minutes.
            Multi-engine support. Analytics dashboard. Enterprise-grade security.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" className="bg-blue-600 text-white px-8 py-3.5 rounded-full text-lg font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-600/25">
              Request a Demo
            </a>
            <a href="https://github.com/qaaph-zyld/customizable-chatbots" target="_blank" className="border border-zinc-200 px-8 py-3.5 rounded-full text-lg font-medium hover:bg-zinc-50 transition">
              View on GitHub
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-3xl mx-auto">
            {[
              { value: "5+", label: "AI Engines" },
              { value: "50+", label: "API Endpoints" },
              { value: "99.9%", label: "Uptime SLA" },
              { value: "<200ms", label: "Avg Response" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-zinc-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Deploy Chatbots</h2>
            <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
              A complete platform with multi-engine support, analytics, and enterprise features built-in.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🤖",
                title: "Multi-Engine Support",
                desc: "Seamlessly switch between Botpress, Hugging Face, OpenAI, and custom engines. One API, multiple backends."
              },
              {
                icon: "💬",
                title: "Conversation Templates",
                desc: "Pre-built conversation flows for sales, support, onboarding, and FAQ. Customize or build your own."
              },
              {
                icon: "📊",
                title: "Analytics Dashboard",
                desc: "Real-time metrics on conversations, satisfaction scores, response times, and user engagement patterns."
              },
              {
                icon: "🔒",
                title: "Enterprise Security",
                desc: "JWT authentication, role-based access control, rate limiting, and GDPR-compliant data handling."
              },
              {
                icon: "🧠",
                title: "Sentiment Analysis",
                desc: "Automatically detect user sentiment and adapt responses. Route frustrated users to human agents."
              },
              {
                icon: "⚡",
                title: "Response Caching",
                desc: "Redis-based caching with adaptive TTL and cache warming. Sub-200ms response times at scale."
              },
              {
                icon: "🔌",
                title: "Multi-Channel Deploy",
                desc: "Web widget, Slack, WhatsApp, Telegram, and custom integrations. One bot, every channel."
              },
              {
                icon: "📚",
                title: "Knowledge Base",
                desc: "Connect to external data sources. Your chatbot learns from your docs, FAQs, and product database."
              },
              {
                icon: "🧪",
                title: "AI Test Automation",
                desc: "Built-in test framework with intelligent failure recovery and automatic fix generation."
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-2xl p-8 border border-zinc-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-600/5 transition-all">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Deploy in 3 Steps</h2>
            <p className="text-lg text-zinc-500">From zero to production chatbot in under an hour.</p>
          </div>

          <div className="space-y-12">
            {[
              {
                step: "01",
                title: "Configure Your Bot",
                desc: "Choose an AI engine, define conversation flows, and connect your knowledge base. Our API makes setup simple.",
                code: `POST /api/chatbots\n{\n  "name": "Sales Assistant",\n  "engine": "huggingface",\n  "template": "sales-qualifier"\n}`
              },
              {
                step: "02",
                title: "Train & Test",
                desc: "Feed your bot with FAQs, product docs, and sample conversations. Our AI test framework validates responses automatically.",
                code: `POST /api/chatbots/:id/train\n{\n  "sources": ["faq.md", "products.json"],\n  "validateWith": "sentiment-check"\n}`
              },
              {
                step: "03",
                title: "Deploy Everywhere",
                desc: "Embed on your website, connect to Slack, WhatsApp, or Telegram. Real-time analytics from day one.",
                code: `<script src="https://cdn.chatbots.dev/widget.js"\n  data-bot-id="your-bot-id"\n  data-theme="auto">\n</script>`
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">{item.step}</div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-zinc-500 mb-4">{item.desc}</p>
                  <pre className="bg-zinc-900 text-zinc-300 rounded-xl p-5 text-sm overflow-x-auto font-mono">{item.code}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-zinc-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-zinc-500">Start free, scale as you grow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "Free",
                period: "forever",
                desc: "Perfect for testing and small projects",
                features: ["1 chatbot", "1,000 messages/month", "Web widget", "Basic analytics", "Community support"],
                cta: "Start Free",
                highlighted: false,
              },
              {
                name: "Professional",
                price: "$49",
                period: "/month",
                desc: "For growing businesses",
                features: ["5 chatbots", "25,000 messages/month", "All channels", "Advanced analytics", "Sentiment analysis", "Knowledge base", "Priority support"],
                cta: "Get Started",
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                desc: "For large-scale deployments",
                features: ["Unlimited chatbots", "Unlimited messages", "Custom engines", "Dedicated infrastructure", "SLA guarantee", "On-premise option", "24/7 support"],
                cta: "Contact Sales",
                highlighted: false,
              },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 ${plan.highlighted ? "bg-gradient-to-b from-blue-600 to-violet-600 text-white shadow-2xl shadow-blue-600/25 scale-105" : "bg-white border border-zinc-200"}`}>
                <h3 className={`text-lg font-semibold ${plan.highlighted ? "" : "text-zinc-900"}`}>{plan.name}</h3>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.highlighted ? "text-blue-100" : "text-zinc-400"}`}>{plan.period}</span>
                </div>
                <p className={`text-sm mb-6 ${plan.highlighted ? "text-blue-100" : "text-zinc-500"}`}>{plan.desc}</p>
                <a href="#contact" className={`block text-center py-3 rounded-full font-medium transition ${plan.highlighted ? "bg-white text-blue-600 hover:bg-blue-50" : "bg-zinc-900 text-white hover:bg-zinc-800"}`}>
                  {plan.cta}
                </a>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className={`text-sm flex items-center gap-2 ${plan.highlighted ? "text-blue-50" : "text-zinc-600"}`}>
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Lead Gen */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Automate Customer Engagement?</h2>
          <p className="text-lg text-zinc-500 mb-10">Tell us about your project and we&apos;ll get back to you within 24 hours.</p>

          <form className="text-left space-y-5" action="https://formspree.io/f/placeholder" method="POST">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Name</label>
                <input type="text" name="name" required className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
                <input type="email" name="email" required className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition" placeholder="you@company.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Company</label>
              <input type="text" name="company" className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition" placeholder="Company name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">What do you need?</label>
              <select name="need" className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition text-zinc-600">
                <option value="">Select an option</option>
                <option value="customer-support">Customer Support Bot</option>
                <option value="sales-qualifier">Sales Qualification Bot</option>
                <option value="onboarding">Onboarding Assistant</option>
                <option value="custom">Custom Solution</option>
                <option value="enterprise">Enterprise Deployment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Message</label>
              <textarea name="message" rows={4} className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition resize-none" placeholder="Tell us about your project..."></textarea>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-full text-lg font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-600/25">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">CB</div>
            <span className="font-semibold">ChatBots</span>
            <span className="text-zinc-400 text-sm ml-2">by NKJ Development</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <a href="https://github.com/qaaph-zyld/customizable-chatbots" target="_blank" className="hover:text-zinc-900 transition">GitHub</a>
            <a href="https://nkj-development.netlify.app" target="_blank" className="hover:text-zinc-900 transition">NKJ Development</a>
            <span>&copy; 2026 All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
