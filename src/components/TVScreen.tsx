import React from "react";
import { FaYoutube, FaCog, FaWifi, FaCloud, FaTv, FaAppStore, FaInfoCircle, FaMagic, FaSatelliteDish, FaCogs } from "react-icons/fa";
import { MdSettings, MdApps, MdUpdate, MdInfo, MdNetworkWifi } from "react-icons/md";

const IOSSettingsIcon = (
  <span style={{
    display: "inline-block",
    background: "linear-gradient(135deg, #e0e0e0 60%, #b0b0b0 100%)",
    borderRadius: "50%",
    boxShadow: "0 2px 8px #0002",
    padding: 2,
  }}>
    <FaCog color="#666" size={24} style={{ filter: "drop-shadow(0 1px 1px #fff8)" }} />
  </span>
);

const apps = [
  { name: "Редактор каналов", icon: <div style={{display: "flex", alignItems: "center", gap: "2px"}}><FaTv color="#2196f3" size={20} /><FaMagic color="#9c27b0" size={16} /></div> },
  { name: "Настройки", icon: IOSSettingsIcon },
  { name: "Установка", icon: <FaSatelliteDish color="#4caf50" size={28} /> },
  { name: "Media Center", icon: <FaAppStore color="#00bcd4" size={28} /> },
  { name: "YouTube", icon: <FaYoutube color="#e53935" size={28} /> },
  { name: "IPTV", icon: <FaTv color="#2196f3" size={28} /> },
  { name: "Обновление HTTP", icon: <MdUpdate color="#ff9800" size={28} /> },
  { name: "APP", icon: <MdApps color="#9c27b0" size={28} /> },
  { name: "Поиск", icon: <FaInfoCircle color="#fff" size={28} /> },
  { name: "Сеть Wi-Fi", icon: <MdNetworkWifi color="#2196f3" size={28} /> },
  { name: "Оператор", icon: <FaWifi color="#00e676" size={28} /> },
  { name: "Информация", icon: <MdInfo color="#fff" size={28} /> },
];

export default function TVScreen() {
  return (
    <div
      style={{
        width: 520,
        height: 340,
        background: "#181c20",
        borderRadius: 18,
        border: "12px solid #23272e",
        boxShadow: "0 12px 48px #000b, 0 2px 16px #222a",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 24,
        padding: 36,
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #2b3a67 0%, #1e2a47 100%)",
        borderRadius: 8,
        boxShadow: "0 2px 12px #0004 inset",
      }}>
        {apps.map((app, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#fff" }}>
            {React.cloneElement(app.icon, { size: 36 })}
            <span style={{ fontSize: 13, marginTop: 4, textAlign: "center", textShadow: "0 1px 2px #000a" }}>{app.name}</span>
          </div>
        ))}
      </div>
      {/* Подставка телевизора */}
      <div style={{ position: "absolute", bottom: -28, left: "50%", transform: "translateX(-50%)", width: 140, height: 18, background: "#23272e", borderRadius: 9, boxShadow: "0 4px 16px #0008" }} />
    </div>
  );
} 