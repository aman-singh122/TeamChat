import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowRight, Play, Zap, Shield, Users, MessageSquare, Video, Clock } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/chat");

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #0a0a0a;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Grain */
        #grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 999; opacity: 0.022;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        /* Nav */
        .nav-link {
          font-size: 14px; color: rgba(255,255,255,0.45); text-decoration: none;
          font-weight: 400; letter-spacing: -0.01em; transition: color 0.15s;
        }
        .nav-link:hover { color: rgba(255,255,255,0.85); }

        /* Buttons */
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 22px; background: #fff; color: #0a0a0a;
          border-radius: 8px; font-size: 14px; font-weight: 600;
          letter-spacing: -0.02em; text-decoration: none;
          transition: all 0.18s; border: none; cursor: pointer;
          font-family: 'Geist', sans-serif; white-space: nowrap;
        }
        .btn-primary:hover {
          background: #f0f0f0;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(255,255,255,0.1);
        }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 20px; color: rgba(255,255,255,0.5);
          border-radius: 8px; font-size: 14px; font-weight: 400;
          border: none; background: none; cursor: pointer;
          font-family: 'Geist', sans-serif; letter-spacing: -0.01em;
          transition: color 0.15s; text-decoration: none;
        }
        .btn-secondary:hover { color: rgba(255,255,255,0.8); }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 22px; border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px; font-size: 14px; font-weight: 400;
          color: rgba(255,255,255,0.5); text-decoration: none;
          transition: all 0.18s; font-family: 'Geist', sans-serif;
          letter-spacing: -0.01em;
        }
        .btn-outline:hover {
          border-color: rgba(255,255,255,0.22);
          color: rgba(255,255,255,0.8);
        }

        /* Play button circle */
        .play-circle {
          width: 26px; height: 26px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: border-color 0.15s;
        }
        .btn-secondary:hover .play-circle { border-color: rgba(255,255,255,0.3); }

        /* Live badge */
        .live-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 13px 5px 9px; border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          font-size: 12px; color: rgba(255,255,255,0.45);
          font-weight: 400; letter-spacing: -0.01em;
        }
        .pulse-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4ade80; flex-shrink: 0; position: relative;
        }
        .pulse-dot::after {
          content: ''; position: absolute; inset: -3px; border-radius: 50%;
          background: rgba(74,222,128,0.28);
          animation: ripple 2.2s ease-out infinite;
        }
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        /* Proof avatars */
        .proof-av {
          width: 26px; height: 26px; border-radius: 50%;
          border: 1.5px solid #0a0a0a;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 700; flex-shrink: 0; margin-right: -7px;
        }

        /* Right side cards */
        .ui-card {
          background: #111;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 18px 20px;
        }

        /* Presence dot */
        .p-dot {
          width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
        }

        /* Typing dots */
        .tdots span {
          display: inline-block; width: 3px; height: 3px; border-radius: 50%;
          background: rgba(255,255,255,0.3);
          animation: td 1.2s ease-in-out infinite;
          margin-right: 2px;
        }
        .tdots span:nth-child(2) { animation-delay: 0.15s; }
        .tdots span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes td {
          0%,80%,100% { transform: translateY(0); opacity: 0.3; }
          40% { transform: translateY(-3px); opacity: 0.8; }
        }

        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.25; } }
        .blink { animation: blink 2s ease-in-out infinite; }

        .recap-dot {
          width: 3px; height: 3px; border-radius: 50%;
          background: rgba(129,140,248,0.5); flex-shrink: 0; margin-top: 6px;
        }

        /* Feature grid */
        .feature-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: rgba(255,255,255,0.05);
          border-radius: 14px; overflow: hidden;
        }
        .fc {
          padding: 28px 24px; background: #0e0e0e; transition: background 0.2s;
        }
        .fc:hover { background: #111; }
        .f-icon {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
        }

        /* Divider */
        .rule { height: 1px; background: rgba(255,255,255,0.05); }

        /* CTA */
        .cta-box {
          background: #0e0e0e; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; padding: 80px 40px; text-align: center;
          position: relative; overflow: hidden;
        }
        .cta-box::before {
          content: ''; position: absolute;
          top: -180px; left: 50%; transform: translateX(-50%);
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 68%);
          pointer-events: none;
        }

        /* Footer */
        .fl {
          display: block; font-size: 13px;
          color: rgba(255,255,255,0.3); text-decoration: none;
          line-height: 2.2; transition: color 0.15s; font-weight: 400;
        }
        .fl:hover { color: rgba(255,255,255,0.65); }

        /* Ambient */
        .amb {
          position: absolute; border-radius: 50%;
          pointer-events: none; filter: blur(100px);
        }

        /* Animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .au { animation: fadeUp 0.55s ease both; }
        .au1 { animation-delay: 0.04s; }
        .au2 { animation-delay: 0.14s; }
        .au3 { animation-delay: 0.26s; }
        .au4 { animation-delay: 0.40s; }

        .join-btn {
          padding: 5px 12px;
          background: rgba(74,222,128,0.12);
          border: 1px solid rgba(74,222,128,0.22);
          border-radius: 6px; font-size: 11.5px; font-weight: 600;
          color: #4ade80; cursor: pointer; letter-spacing: -0.01em;
          font-family: 'Geist', sans-serif;
        }
      `}</style>

      <div id="grain" />

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: 56, display: "flex", alignItems: "center",
        background: "rgba(10,10,10,0.8)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" fill="#0a0a0a"/>
                <rect x="9"   y="1.5" width="5.5" height="5.5" rx="1.5" fill="#0a0a0a" opacity="0.4"/>
                <rect x="1.5" y="9"   width="5.5" height="5.5" rx="1.5" fill="#0a0a0a" opacity="0.4"/>
                <rect x="9"   y="9"   width="5.5" height="5.5" rx="1.5" fill="#0a0a0a" opacity="0.15"/>
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: "-0.025em" }}>TimeComm</span>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: 28 }}>
            {["Features", "Pricing", "About"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="nav-link">{l}</a>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Link href="/sign-in" className="nav-link" style={{ padding: "7px 14px" }}>Sign in</Link>
            <Link href="/sign-up" className="btn-primary" style={{ padding: "8px 16px", fontSize: 13.5 }}>
              Get started <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        maxWidth: 1100, margin: "0 auto", padding: "120px 32px 88px",
        display: "grid", gridTemplateColumns: "1fr 360px",
        gap: 56, alignItems: "center", position: "relative"
      }}>
        {/* Ambient glows */}
        <div className="amb" style={{ width: 520, height: 520, top: -80, right: -40, background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)" }} />
        <div className="amb" style={{ width: 350, height: 350, bottom: 0, left: -40, background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)" }} />

        {/* LEFT */}
        <div>
          <div className="au au1" style={{ marginBottom: 26 }}>
            <div className="live-badge">
              <span className="pulse-dot" />
              2,847 teams active right now
            </div>
          </div>

          <h1 className="au au2" style={{
            fontSize: 58, fontWeight: 700, lineHeight: 1.06,
            letterSpacing: "-0.04em", marginBottom: 22, color: "#fff"
          }}>
            The workspace<br />
            <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 400 }}>where decisions</span><br />
            actually happen
          </h1>

          <p className="au au3" style={{
            fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,0.42)",
            maxWidth: 440, marginBottom: 34, fontWeight: 300
          }}>
            Real-time messaging, live presence, and AI-powered recaps — so your team spends less time catching up and more time building.
          </p>

          <div className="au au4" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 48 }}>
            <Link href="/sign-up" className="btn-primary">
              Start free trial <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
            <button className="btn-secondary">
              <span className="play-circle">
                <Play size={8} fill="rgba(255,255,255,0.5)" color="rgba(255,255,255,0.5)" />
              </span>
              Watch demo
            </button>
          </div>

          {/* Social proof */}
          <div className="au au4" style={{
            display: "flex", alignItems: "center",
            paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)"
          }}>
            {/* Avatars */}
            <div style={{ display: "flex", marginRight: 12 }}>
              {[["SC","#4f46e5"],["AR","#0e7490"],["KM","#b45309"],["JL","#15803d"]].map(([i,bg],idx) => (
                <div key={idx} className="proof-av" style={{ background: bg as string, zIndex: 4-idx }}>
                  <span style={{ fontSize: 8.5, fontWeight: 700, color: "#fff" }}>{i}</span>
                </div>
              ))}
            </div>
            <div style={{ marginRight: 18 }}>
              <div style={{ display: "flex", gap: 1.5, marginBottom: 3 }}>
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="10" height="10" viewBox="0 0 12 12" fill="#ca8a04">
                    <path d="M6 1l1.5 3 3.3.5-2.4 2.3.6 3.2L6 8.5l-3 1.5.6-3.2L1.2 4.5l3.3-.5z"/>
                  </svg>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", fontWeight: 300 }}>5.0 · 2,100+ reviews</div>
            </div>

            <div style={{ width: 1, height: 26, background: "rgba(255,255,255,0.07)", marginRight: 20, flexShrink: 0 }} />

            <div style={{ display: "flex", gap: 20 }}>
              {[["99.99%","Uptime"],["<150ms","Latency"],["SOC 2","Certified"]].map(([v,l]) => (
                <div key={l}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 3 }}>{v}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 500 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — stacked UI cards */}
        <div className="au au3" style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Active now */}
          <div className="ui-card">
            <div style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 14 }}>Active now</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { init: "SC", name: "Sarah Chen",  status: "In #design",  color: "#4f46e5", online: true  },
                { init: "AR", name: "Alex Rivera",  status: "On a call",   color: "#0e7490", call: true    },
                { init: "KM", name: "Kiran Mehta",  status: "typing",      color: "#b45309", typing: true  },
                { init: "JL", name: "Jamie Lee",    status: "Away",        color: "#15803d", away: true     },
              ].map((u, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: u.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>{u.init}</div>
                    <div style={{ position: "absolute", bottom: -1, right: -1, width: 8, height: 8, borderRadius: "50%", border: "1.5px solid #111", background: u.away ? "rgba(255,255,255,0.2)" : "#4ade80" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.78)", letterSpacing: "-0.01em" }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
                      {u.typing ? <><span className="tdots"><span/><span/><span/></span> typing</> :
                       u.call   ? <span style={{ color: "#4ade80" }}>● {u.status}</span> :
                       u.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recap */}
          <div className="ui-card" style={{ background: "rgba(79,70,229,0.07)", border: "1px solid rgba(99,102,241,0.18)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#818cf8", textTransform: "uppercase", marginBottom: 10 }}>✦ AI Recap · #product</div>
            {["Launch date confirmed — Feb 28", "API spec ready, needs review", "Client sync rescheduled Thursday"].map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "3px 0" }}>
                <div className="recap-dot" />
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, fontWeight: 300 }}>{line}</div>
              </div>
            ))}
          </div>

          {/* Live call */}
          <div className="ui-card" style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.14)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div className="blink" style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", letterSpacing: "-0.01em" }}>Live call in progress</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>3 participants · 14 min</div>
              </div>
            </div>
            <button className="join-btn">Join</button>
          </div>

        </div>
      </section>

      <div className="rule" style={{ maxWidth: 1036, margin: "0 auto" }} />

      {/* ── LOGO BAR ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px" }}>
        <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, marginBottom: 24 }}>Trusted by teams at</p>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 44, flexWrap: "wrap" }}>
          {["Figma","Vercel","Linear","Notion","Loom","Stripe"].map(n => (
            <span key={n} style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.13)", letterSpacing: "-0.02em" }}>{n}</span>
          ))}
        </div>
      </div>

      <div className="rule" style={{ maxWidth: 1036, margin: "0 auto" }} />

      {/* ── FEATURES ── */}
      <section id="features" style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 14 }}>Features</div>
        <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 12, color: "#fff" }}>
          Built for how real teams work
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.38)", maxWidth: 440, lineHeight: 1.7, fontWeight: 300, marginBottom: 44 }}>
          Not another tool you'll onboard then abandon. TimeComm slots into your workflow the first day.
        </p>

        <div className="feature-grid">
          {[
            { icon: Zap,           title: "Under 150ms, globally",     desc: "Messages arrive before the thought finishes. Edge delivery from 35+ regions.", color: "#f59e0b", bg: "rgba(245,158,11,0.08)"   },
            { icon: Shield,        title: "Enterprise security",       desc: "SOC 2 Type II certified. End-to-end encrypted. Your data stays yours.",       color: "#4ade80", bg: "rgba(74,222,128,0.08)"  },
            { icon: Users,         title: "Real-time presence",        desc: "See who's online, reading, or in a call — without having to ask.",           color: "#60a5fa", bg: "rgba(96,165,250,0.08)"  },
            { icon: MessageSquare, title: "AI-powered recaps",         desc: "Missed a thread? Three bullets and you're caught up. No scrolling back.",    color: "#a78bfa", bg: "rgba(167,139,250,0.08)" },
            { icon: Video,         title: "HD voice & video",          desc: "Noise-cancelled audio, 1080p video, instant screen share. Built in.",        color: "#f87171", bg: "rgba(248,113,113,0.08)" },
            { icon: Clock,         title: "Searchable history",        desc: "Every message and file indexed instantly. Nothing gets lost.",               color: "#34d399", bg: "rgba(52,211,153,0.08)"  },
          ].map((f, i) => (
            <div key={i} className="fc">
              <div className="f-icon" style={{ background: f.bg }}>
                <f.icon size={15} color={f.color} strokeWidth={2} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em", marginBottom: 7, lineHeight: 1.3 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.65, fontWeight: 300 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="rule" style={{ maxWidth: 1036, margin: "0 auto" }} />

      {/* ── CTA ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px" }}>
        <div className="cta-box">
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 18 }}>Get started today</div>
          <h2 style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.1, color: "#fff", marginBottom: 16 }}>
            Your team deserves<br />
            <span style={{ fontWeight: 300, color: "rgba(255,255,255,0.5)" }}>better tools.</span>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.38)", maxWidth: 380, margin: "0 auto 30px", lineHeight: 1.7, fontWeight: 300 }}>
            Join thousands of teams who stopped fighting their software and started shipping faster.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 16 }}>
            <Link href="/sign-up" className="btn-primary">
              Start for free <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
            <Link href="/sign-in" className="btn-outline">Sign in</Link>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontWeight: 300 }}>
            No credit card required · 14-day trial · Cancel anytime
          </p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px 40px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 40,
          padding: "44px 0 40px", borderTop: "1px solid rgba(255,255,255,0.05)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" fill="#0a0a0a"/>
                  <rect x="9"   y="1.5" width="5.5" height="5.5" rx="1.5" fill="#0a0a0a" opacity="0.4"/>
                  <rect x="1.5" y="9"   width="5.5" height="5.5" rx="1.5" fill="#0a0a0a" opacity="0.4"/>
                  <rect x="9"   y="9"   width="5.5" height="5.5" rx="1.5" fill="#0a0a0a" opacity="0.15"/>
                </svg>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-0.025em" }}>TimeComm</span>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", lineHeight: 1.7, maxWidth: 185, fontWeight: 300 }}>
              Modern collaboration for teams that ship.
            </p>
          </div>

          {[
            { title: "Product",   links: ["Features","Pricing","Security","Changelog"] },
            { title: "Company",   links: ["About","Blog","Careers","Press"] },
            { title: "Resources", links: ["Docs","Support","Status","Community"] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.28)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>{col.title}</div>
              {col.links.map(l => <a key={l} href="#" className="fl">{l}</a>)}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.18)", fontWeight: 300 }}>© 2024 TimeComm, Inc.</span>
          <div style={{ display: "flex", gap: 18 }}>
            {["Privacy","Terms","Cookies"].map(l => (
              <a key={l} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", textDecoration: "none", transition: "color 0.15s" }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}