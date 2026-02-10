"use client";

import { useState } from "react";

interface Bot {
  id: string;
  name: string;
  engine: string;
  status: "active" | "paused" | "draft";
  messages: number;
  created: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
}

const DEMO_BOTS: Bot[] = [
  { id: "bot-1", name: "Sales Qualifier", engine: "GPT-4o", status: "active", messages: 2847, created: "2026-01-15" },
  { id: "bot-2", name: "Support Agent", engine: "Hugging Face", status: "active", messages: 12503, created: "2025-12-01" },
  { id: "bot-3", name: "Onboarding Guide", engine: "Botpress", status: "paused", messages: 891, created: "2026-02-01" },
];

const DEMO_KEYS: ApiKey[] = [
  { id: "key-1", name: "Production", key: "cb_live_sk_...8f3d", created: "2026-01-10", lastUsed: "2026-02-10" },
  { id: "key-2", name: "Development", key: "cb_test_sk_...2a1e", created: "2026-01-10", lastUsed: "2026-02-09" },
];

export default function DashboardPage() {
  const [tab, setTab] = useState<"bots" | "api" | "analytics" | "widget">("bots");

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top bar */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">CB</div>
            <span className="font-semibold text-zinc-900">Dashboard</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Pro Plan</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-zinc-500">demo@chatbots.dev</span>
            <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center text-zinc-600 font-medium text-sm">D</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Bots", value: "2", change: "+1 this month" },
            { label: "Messages Today", value: "342", change: "+18% vs yesterday" },
            { label: "Avg Response", value: "180ms", change: "-12ms improvement" },
            { label: "Satisfaction", value: "94%", change: "+2% this week" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-5 border border-zinc-200">
              <div className="text-sm text-zinc-500 mb-1">{s.label}</div>
              <div className="text-2xl font-bold text-zinc-900">{s.value}</div>
              <div className="text-xs text-green-600 mt-1">{s.change}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-100 rounded-xl p-1 mb-6 w-fit">
          {(["bots", "api", "widget", "analytics"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition capitalize ${tab === t ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}>
              {t === "api" ? "API Keys" : t === "widget" ? "Embed Widget" : t}
            </button>
          ))}
        </div>

        {/* Bots Tab */}
        {tab === "bots" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Your Chatbots</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ New Bot</button>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-500">
                    <th className="py-3 px-4 text-left font-medium">Bot</th>
                    <th className="py-3 px-4 text-left font-medium">Engine</th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                    <th className="py-3 px-4 text-right font-medium">Messages</th>
                    <th className="py-3 px-4 text-right font-medium">Created</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_BOTS.map((bot) => (
                    <tr key={bot.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                      <td className="py-3 px-4 font-medium text-zinc-900">{bot.name}</td>
                      <td className="py-3 px-4 text-zinc-600">{bot.engine}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${bot.status === "active" ? "bg-green-50 text-green-700" : bot.status === "paused" ? "bg-yellow-50 text-yellow-700" : "bg-zinc-100 text-zinc-500"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${bot.status === "active" ? "bg-green-500" : bot.status === "paused" ? "bg-yellow-500" : "bg-zinc-400"}`}></span>
                          {bot.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-600 font-mono">{bot.messages.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-zinc-400">{bot.created}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-zinc-400 hover:text-zinc-600 transition">⚙️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {tab === "api" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">API Keys</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ New Key</button>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-500">
                    <th className="py-3 px-4 text-left font-medium">Name</th>
                    <th className="py-3 px-4 text-left font-medium">Key</th>
                    <th className="py-3 px-4 text-left font-medium">Created</th>
                    <th className="py-3 px-4 text-left font-medium">Last Used</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_KEYS.map((k) => (
                    <tr key={k.id} className="border-b border-zinc-50">
                      <td className="py-3 px-4 font-medium text-zinc-900">{k.name}</td>
                      <td className="py-3 px-4 font-mono text-zinc-500">{k.key}</td>
                      <td className="py-3 px-4 text-zinc-400">{k.created}</td>
                      <td className="py-3 px-4 text-zinc-400">{k.lastUsed}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-red-400 hover:text-red-600 text-xs transition">Revoke</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* API Documentation snippet */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-3">Quick Start</h3>
              <pre className="bg-zinc-900 text-zinc-300 rounded-xl p-5 text-sm overflow-x-auto font-mono">{`curl -X POST https://api.chatbots.dev/v1/chat \\
  -H "Authorization: Bearer cb_live_sk_...8f3d" \\
  -H "Content-Type: application/json" \\
  -d '{
    "bot_id": "bot-1",
    "message": "What products do you offer?",
    "session_id": "user-123"
  }'`}</pre>
            </div>
          </div>
        )}

        {/* Widget Tab */}
        {tab === "widget" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-zinc-900">Embed Widget</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <h3 className="text-sm font-semibold text-zinc-900 mb-3">Installation</h3>
                <p className="text-sm text-zinc-500 mb-4">Add this snippet before the closing <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs">&lt;/body&gt;</code> tag of your website:</p>
                <pre className="bg-zinc-900 text-zinc-300 rounded-xl p-5 text-sm overflow-x-auto font-mono">{`<script
  src="https://cdn.chatbots.dev/widget.js"
  data-bot-id="bot-1"
  data-api-key="cb_live_sk_...8f3d"
  data-theme="auto"
  data-position="bottom-right"
  data-primary-color="#4F46E5">
</script>`}</pre>

                <h3 className="text-sm font-semibold text-zinc-900 mt-6 mb-3">Configuration Options</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { attr: "data-bot-id", desc: "Your bot ID from the dashboard" },
                    { attr: "data-api-key", desc: "Your public API key" },
                    { attr: "data-theme", desc: "\"light\", \"dark\", or \"auto\"" },
                    { attr: "data-position", desc: "\"bottom-right\" or \"bottom-left\"" },
                    { attr: "data-primary-color", desc: "Hex color for the widget button" },
                    { attr: "data-greeting", desc: "Initial greeting message" },
                  ].map((opt) => (
                    <div key={opt.attr} className="flex gap-2">
                      <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs text-blue-600 flex-shrink-0">{opt.attr}</code>
                      <span className="text-zinc-500">{opt.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Widget preview */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <h3 className="text-sm font-semibold text-zinc-900 mb-3">Preview</h3>
                <div className="bg-zinc-100 rounded-xl p-4 h-[420px] relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">Your Website</div>

                  {/* Mock widget */}
                  <div className="absolute bottom-4 right-4 w-[280px]">
                    <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 flex items-center gap-2">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold">S</div>
                        <div>
                          <div className="text-white text-xs font-semibold">Sales Assistant</div>
                          <div className="text-blue-100 text-[10px]">Online</div>
                        </div>
                      </div>
                      <div className="p-3 space-y-2 h-[180px] overflow-hidden">
                        <div className="bg-zinc-100 rounded-xl rounded-bl-md p-2.5 text-xs text-zinc-700 max-w-[85%]">
                          Hi! How can I help you today? 👋
                        </div>
                        <div className="bg-blue-600 text-white rounded-xl rounded-br-md p-2.5 text-xs ml-auto max-w-[85%]">
                          What pricing plans do you offer?
                        </div>
                        <div className="bg-zinc-100 rounded-xl rounded-bl-md p-2.5 text-xs text-zinc-700 max-w-[85%]">
                          We have 3 plans: Starter (free), Pro ($49/mo), and Enterprise. Would you like details?
                        </div>
                      </div>
                      <div className="p-2 border-t border-zinc-100 flex gap-2">
                        <input className="flex-1 bg-zinc-50 rounded-lg px-2.5 py-1.5 text-[10px] border border-zinc-200 outline-none" placeholder="Type a message..." readOnly />
                        <button className="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-medium">Send</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {tab === "analytics" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-zinc-900">Analytics</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <h3 className="text-sm font-semibold text-zinc-900 mb-4">Messages (Last 7 Days)</h3>
                <div className="flex items-end gap-2 h-[200px]">
                  {[65, 82, 45, 120, 98, 110, 134].map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-blue-100 rounded-t-md transition-all" style={{ height: `${(v / 140) * 180}px` }}>
                        <div className="w-full bg-blue-500 rounded-t-md" style={{ height: `${(v / 140) * 100}%` }}></div>
                      </div>
                      <span className="text-[10px] text-zinc-400">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <h3 className="text-sm font-semibold text-zinc-900 mb-4">Top Topics</h3>
                <div className="space-y-3">
                  {[
                    { topic: "Pricing Questions", pct: 34 },
                    { topic: "Product Features", pct: 28 },
                    { topic: "Technical Support", pct: 22 },
                    { topic: "Account Issues", pct: 10 },
                    { topic: "Other", pct: 6 },
                  ].map((t) => (
                    <div key={t.topic} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-700">{t.topic}</span>
                          <span className="text-zinc-400">{t.pct}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-2">
                          <div className="bg-blue-500 rounded-full h-2 transition-all" style={{ width: `${t.pct}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <h3 className="text-sm font-semibold text-zinc-900 mb-4">Sentiment Distribution</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    {[
                      { label: "Positive", pct: 72, color: "bg-green-500" },
                      { label: "Neutral", pct: 20, color: "bg-zinc-400" },
                      { label: "Negative", pct: 8, color: "bg-red-500" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2 text-xs">
                        <span className={`w-2.5 h-2.5 rounded-full ${s.color}`}></span>
                        <span className="text-zinc-600 w-16">{s.label}</span>
                        <span className="text-zinc-900 font-semibold">{s.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <h3 className="text-sm font-semibold text-zinc-900 mb-4">Response Performance</h3>
                <div className="space-y-4">
                  {[
                    { label: "Avg Response Time", value: "180ms", trend: "↓ 12ms" },
                    { label: "Resolution Rate", value: "87%", trend: "↑ 3%" },
                    { label: "Handoff to Human", value: "13%", trend: "↓ 2%" },
                    { label: "Avg Session Length", value: "4.2 msgs", trend: "↑ 0.3" },
                  ].map((m) => (
                    <div key={m.label} className="flex justify-between items-center">
                      <span className="text-sm text-zinc-600">{m.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-900">{m.value}</span>
                        <span className="text-xs text-green-600">{m.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-zinc-400">Demo data shown. Connect your live bot to see real analytics.</p>
          </div>
        )}
      </div>
    </div>
  );
}
