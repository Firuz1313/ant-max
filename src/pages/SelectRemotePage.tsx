import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tv,
  Cpu,
  Wifi,
  HardDrive,
  ArrowRight,
  Star,
  Users,
  CheckCircle,
} from "lucide-react";
import RemoteControl from "../components/RemoteControl";
import TVScreen from "../components/TVScreen";

const devices = [
  {
    id: "openbox",
    name: "OpenBox",
    model: "S4 Pro+",
    image: "/placeholder.svg",
    description: "Professional-grade receiver with advanced features",
    price: "Popular Choice",
    features: [
      "4K Ultra HD Support",
      "Dual Boot Android/Linux",
      "Built-in WiFi",
      "USB Recording",
      "HDMI 2.0",
    ],
    specs: {
      cpu: "ARM Cortex-A53 Quad Core",
      ram: "1GB DDR3",
      storage: "8GB eMMC",
      wifi: "802.11 b/g/n",
    },
    rating: 4.8,
    users: "2.3M+",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "openbox-gold",
    name: "OpenBox Gold",
    model: "A7 Plus",
    image: "/placeholder.svg",
    description: "Premium model with enhanced performance",
    price: "Premium",
    features: [
      "4K/8K Ready",
      "Advanced EPG",
      "Multi-stream Support",
      "Cloud Recording",
      "Voice Control",
    ],
    specs: {
      cpu: "ARM Cortex-A73 Quad Core",
      ram: "2GB DDR4",
      storage: "16GB eMMC",
      wifi: "802.11 ac/ax",
    },
    rating: 4.9,
    users: "1.8M+",
    color: "from-amber-500 to-amber-600",
  },
  {
    id: "uclan",
    name: "Uclan",
    model: "Denys H.265",
    image: "/placeholder.svg",
    description: "Reliable and efficient digital receiver",
    price: "Budget Friendly",
    features: [
      "H.265 HEVC Support",
      "Full HD 1080p",
      "Ethernet & WiFi",
      "USB Media Player",
      "DiSEqC 1.2",
    ],
    specs: {
      cpu: "ARM Cortex-A7 Dual Core",
      ram: "512MB DDR3",
      storage: "4GB Flash",
      wifi: "802.11 b/g/n",
    },
    rating: 4.6,
    users: "1.2M+",
    color: "from-green-500 to-green-600",
  },
  {
    id: "hdbox",
    name: "HDBox",
    model: "FS-9200 PVR",
    image: "/placeholder.svg",
    description: "Feature-rich PVR with recording capabilities",
    price: "Best Value",
    features: [
      "Twin Tuner DVB-S2",
      "500GB HDD Included",
      "TimeShift Function",
      "Network Streaming",
      "CI+ Slot",
    ],
    specs: {
      cpu: "MIPS 600MHz",
      ram: "256MB DDR2",
      storage: "500GB HDD",
      wifi: "Optional USB",
    },
    rating: 4.7,
    users: "950K+",
    color: "from-purple-500 to-purple-600",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export default function SelectRemotePage() {
  const navigate = useNavigate();
  // По умолчанию выбран Openbox Gold
  const selectedDevice = devices.find((d) => d.id === "openbox-gold");

  const handleDeviceSelect = (deviceId: string) => {
    navigate(`/device/${deviceId}/menu`);
  };

  return (
    <Layout showBackButton title="Пульт управления">
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
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{selectedDevice?.name || "Openbox Gold"}</div>
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
    </Layout>
  );
}
