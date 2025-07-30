import { useParams } from "react-router-dom";
import RemoteControl from "../components/RemoteControl";
import TVScreen from "../components/TVScreen";
import NotFound from "./NotFound";

const devices = [
  {
    id: "openbox",
    name: "OpenBox",
    description: "Professional-grade receiver with advanced features",
  },
  {
    id: "openbox-gold",
    name: "OpenBox Gold",
    description: "Premium model with enhanced performance",
  },
  {
    id: "uclan",
    name: "Uclan",
    description: "Reliable and efficient digital receiver",
  },
  {
    id: "hdbox",
    name: "HDBox",
    description: "Feature-rich PVR with recording capabilities",
  },
];

export default function DeviceRemotePage() {
  const { deviceId } = useParams();
  const selectedDevice = devices.find((d) => d.id === deviceId);

  if (!selectedDevice) return <NotFound />;

  return (
    <div style={{ background: "#2563eb", minHeight: "100vh", padding: 0 }}>
      {/* Верхнее меню */}
      <div style={{ background: "#0a1a4f", padding: "16px 0 8px 0", borderBottom: "2px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: 32 }}>
          <img src="/favicon.ico" alt="АНТ" style={{ width: 36, height: 36, borderRadius: 8, marginRight: 12 }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>АНТ</span>
          <nav style={{ display: "flex", gap: 18, marginLeft: 32 }}>
            <a href="/" style={{ color: "#fff", opacity: 0.9, fontWeight: 500, textDecoration: "none" }}>Главная</a>
            <a href="/devices" style={{ color: "#fff", opacity: 0.9, fontWeight: 500, textDecoration: "none" }}>Приставки</a>
            <a href="/support" style={{ color: "#fff", opacity: 0.9, fontWeight: 500, textDecoration: "none" }}>Поддержка</a>
          </nav>
        </div>
        <div style={{ display: "flex", gap: 10, marginRight: 32 }}>
          <button style={{ background: "#2563eb", color: "#fff", border: 0, borderRadius: 16, padding: "6px 18px", fontWeight: 600, marginLeft: 4 }}>OpenBOX</button>
          <button style={{ background: "#2563eb", color: "#fff", border: 0, borderRadius: 16, padding: "6px 18px", fontWeight: 600, marginLeft: 4 }}>OpenBOX GOLD</button>
          <button style={{ background: "#2563eb", color: "#fff", border: 0, borderRadius: 16, padding: "6px 18px", fontWeight: 600, marginLeft: 4 }}>Uclan</button>
          <button style={{ background: "#2563eb", color: "#fff", border: 0, borderRadius: 16, padding: "6px 18px", fontWeight: 600, marginLeft: 4 }}>HDBox</button>
        </div>
      </div>
      {/* Контент */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 48, marginTop: 48, paddingBottom: 48 }}>
        {/* Карточка приставки */}
        <div style={{ background: "#2563eb", border: "2px solid #fff3", borderRadius: 16, padding: 24, minWidth: 220, color: "#fff", boxShadow: "0 4px 24px #0002" }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{selectedDevice?.name}</div>
          <div style={{ fontSize: 15, opacity: 0.8, marginBottom: 12 }}>{selectedDevice?.description}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, background: "#22c55e", borderRadius: 5, display: "inline-block" }} />
            <span style={{ fontSize: 14, color: "#a7f3d0" }}>Подключено</span>
          </div>
        </div>
        {/* Пульт */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <RemoteControl onButtonClick={(key) => {}} />
        </div>
        {/* Телевизор */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <TVScreen />
        </div>
      </div>
    </div>
  );
} 