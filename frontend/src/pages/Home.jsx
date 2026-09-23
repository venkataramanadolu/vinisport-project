import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import heroImg from "../assets/VinSports_Home_Page.png";

const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="12" stroke="#1a1a1a" strokeWidth="2" />
      <circle cx="13" cy="13" r="6" fill="#1a1a1a" />
      <path d="M13 8v10M8 13h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
    <span style={{
      fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
      fontSize: "20px",
      letterSpacing: "2px",
      color: "#1a1a1a",
      fontWeight: 700,
    }}>VINISPORT</span>
  </div>
);

const DashboardMockup = () => {
  const players = [
    { init: "P", name: "Priya Patel",   srr: 1556, rank: 1,  change: +26, color: "#f59e0b" },
    { init: "R", name: "Rahul Sharma",  srr: 1505, rank: 2,  change: +17, color: "#f59e0b" },
    { init: "A", name: "Ananya Kumar",  srr: 1469, rank: 5,  change: -11, color: "#f59e0b" },
    { init: "V", name: "Vikram Singh",  srr: 1436, rank: 8,  change: +15, color: "#f59e0b" },
    { init: "N", name: "Neha Reddy",    srr: 1398, rank: 12, change: -20, color: "#f59e0b" },
  ];

  const Dots = ({ change }) => {
    const colors = change > 0
      ? ["#22c55e","#22c55e","#22c55e","#22c55e","#22c55e"]
      : ["#ef4444","#ef4444","#6b7280","#6b7280","#6b7280"];
    return (
      <div style={{ display: "flex", gap: "3px" }}>
        {colors.map((c, i) => (
          <div key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />
        ))}
      </div>
    );
  };

  return (
    <div style={{
      background: "#0f172a",
      borderRadius: "16px",
      padding: "20px",
      width: "320px",
      boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
      fontFamily: "'DM Sans', sans-serif",
      color: "white",
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="4" stroke="#94a3b8" strokeWidth="1.2"/>
                <circle cx="5" cy="5" r="2" fill="#94a3b8"/>
              </svg>
            </div>
            <span style={{ fontSize: "9px", color: "#64748b", letterSpacing: "1px", textTransform: "uppercase" }}>VINISPORT</span>
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "0.5px", lineHeight: 1.1, fontFamily: "'Bebas Neue', sans-serif" }}>
            SMASH SQUAD
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>🏸 Badminton · Jan 15, 2025</div>
        </div>
        <div style={{ background: "#1e293b", borderRadius: "10px", padding: "8px 12px", textAlign: "center" }}>
          <div style={{ fontSize: "9px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>Weekly Activity</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "white", lineHeight: 1 }}>14</div>
          <div style={{ fontSize: "9px", color: "#64748b" }}>matches this week</div>
        </div>
      </div>

      {/* Top 3 spotlight */}
      <div style={{ margin: "16px 0 8px", fontSize: "9px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>
        Top 3 Spotlight
      </div>
      <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "16px" }}>
        {players.slice(0, 3).map((p, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "50%",
              border: `2px solid ${i === 0 ? "#f59e0b" : "#334155"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", fontWeight: 700, color: "white",
              background: "#1e293b", margin: "0 auto 6px",
            }}>{p.init}</div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "white" }}>{p.name.split(" ")[0]}</div>
            <div style={{ fontSize: "9px", color: "#64748b" }}>{p.srr} SRR · #{p.rank}</div>
          </div>
        ))}
      </div>

      {/* Standings */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontSize: "9px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px" }}>Standings</span>
        <span style={{ fontSize: "9px", color: "#64748b" }}>SRR · LAST 5 · CHANGE</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {players.map((p, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: i === 0 ? "#1e293b" : "transparent",
            borderRadius: "8px", padding: "6px 8px",
          }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569", width: "14px" }}>{i + 1}</span>
            <div style={{
              width: "26px", height: "26px", borderRadius: "50%",
              background: "#334155", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "11px", fontWeight: 700,
            }}>{p.init}</div>
            <span style={{ fontSize: "12px", fontWeight: 500, flex: 1 }}>{p.name}</span>
            <span style={{ fontSize: "11px", color: "#94a3b8", marginRight: "4px" }}>{p.srr}</span>
            <Dots change={p.change} />
            <span style={{ fontSize: "11px", color: p.change > 0 ? "#22c55e" : "#ef4444", width: "28px", textAlign: "right" }}>
              {p.change > 0 ? "+" : ""}{p.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#ffffff",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Navbar */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 48px",
        borderBottom: "1px solid #f1f5f9",
        position: "sticky", top: 0, background: "white", zIndex: 10,
      }}>
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => navigate("/signin")}
            style={{
              padding: "9px 20px", background: "#f1f5f9",
              border: "1px solid #e2e8f0", borderRadius: "8px",
              fontSize: "14px", fontWeight: 600, color: "#334155",
              cursor: "pointer", transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#e2e8f0")}
            onMouseLeave={e => (e.currentTarget.style.background = "#f1f5f9")}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/signup")}
            style={{
              padding: "9px 20px", background: "#16a34a",
              border: "none", borderRadius: "8px",
              fontSize: "14px", fontWeight: 600, color: "white",
              cursor: "pointer", transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#15803d")}
            onMouseLeave={e => (e.currentTarget.style.background = "#16a34a")}
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ width: "100%", overflow: "hidden", background: "#0f172a" }}>
        <img 
          src={heroImg} 
          alt="VINISPORT sports community"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.6s ease",
          }} 
        />
      </div>
    </div>
  );
}
