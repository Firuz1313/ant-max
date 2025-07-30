import React, { useState } from "react";
import { FaPowerOff, FaVolumeUp, FaVolumeDown, FaChevronUp, FaChevronDown, FaChevronLeft, FaChevronRight, FaRegCircle, FaPlay, FaPause, FaStop, FaYoutube, FaArrowLeft, FaArrowRight, FaArrowUp, FaArrowDown, FaMicrophone, FaTv, FaTh, FaListUl, FaRegSquare, FaRegDotCircle, FaStepBackward, FaStepForward, FaCircle } from "react-icons/fa";
import { MdMenu, MdSubtitles, MdTextFields, MdSettingsVoice } from "react-icons/md";
import { IoMdReturnLeft } from "react-icons/io";

const buttonMap = [
  // Верхний ряд
  [
    { label: "Power", icon: <FaPowerOff color="#e53935" />, key: "power" },
    { label: "Mute", icon: <FaRegCircle />, key: "mute" },
  ],
  // Цветные кнопки
  [
    { label: "ZOOM", color: "#e53935", key: "zoom" },
    { label: "GOTO", color: "#43a047", key: "goto" },
    { label: "PAUSE", color: "#fbc02d", key: "pause" },
    { label: "TV/R", color: "#1e88e5", key: "tv_radio" },
  ],
  // Новые кнопки управления медиа (верхний ряд)
  [
    { label: "Prev", icon: <FaStepBackward size={8} />, key: "prev" },
    { label: "Play", icon: <FaPlay size={8} />, key: "play" },
    { label: "Next", icon: <FaStepForward size={8} />, key: "next" },
    { label: "Stop", icon: <FaStop size={8} />, key: "stop" },
  ],
  // Новые кнопки управления медиа (нижний ряд)
  [
    { label: "Back", icon: <FaArrowLeft size={8} />, key: "back" },
    { label: "Pause", icon: <FaPause size={8} />, key: "pause_media" },
    { label: "Forward", icon: <FaArrowRight size={8} />, key: "forward" },
    { label: "Record", icon: <FaCircle size={8} color="#e53935" />, key: "record" },
  ],
  // Кнопки управления
  [
    { label: "YouTube", icon: <FaYoutube color="#e53935" />, key: "youtube" },
    { label: "IPTV", color: "#1e88e5", key: "iptv" },
    { label: "FAV", key: "fav" },
    { label: "EPG", key: "epg" },
  ],
  // Стрелки и OK
  [
    { label: "Menu", key: "menu" },
    { label: "Up", icon: <FaChevronUp />, key: "up" },
    { label: "Exit", key: "exit" },
  ],
  [
    { label: "Left", icon: <FaChevronLeft />, key: "left" },
    { label: "OK", icon: <FaRegCircle />, key: "ok", big: true },
    { label: "Right", icon: <FaChevronRight />, key: "right" },
  ],
  [
    { label: "Audio", key: "audio" },
    { label: "Down", icon: <FaChevronDown />, key: "down" },
    { label: "INFO", key: "info" },
  ],
  // Громкость и каналы
  [
    { label: "VOL-", icon: <FaVolumeDown />, key: "vol_down" },
    { label: "SAT", key: "sat" },
    { label: "CH-", key: "ch_down" },
  ],
  [
    { label: "VOL+", icon: <FaVolumeUp />, key: "vol_up" },
    { label: "RECALL", key: "recall" },
    { label: "CH+", key: "ch_up" },
  ],
  // Цифровой блок
  [
    { label: "1", key: "1" },
    { label: "2", key: "2" },
    { label: "3", key: "3" },
  ],
  [
    { label: "4", key: "4" },
    { label: "5", key: "5" },
    { label: "6", key: "6" },
  ],
  [
    { label: "7", key: "7" },
    { label: "8", key: "8" },
    { label: "9", key: "9" },
  ],
  [
    { label: "SUBTL", icon: <MdSubtitles />, key: "subtl" },
    { label: "0", key: "0" },
    { label: "TXT", icon: <MdTextFields />, key: "txt" },
  ],
];

export default function RemoteControl({ onButtonClick }: { onButtonClick?: (key: string) => void }) {
  const [pressed, setPressed] = useState<string | null>(null);

  const handlePress = (key: string) => {
    setPressed(key);
    if (onButtonClick) onButtonClick(key);
    setTimeout(() => setPressed(null), 150);
  };

  return (
    <div
      style={{
        width: 90,
        background: "linear-gradient(135deg, #23272e 60%, #181c20 100%)",
        borderRadius: 22,
        boxShadow: "0 6px 32px #000a, 0 1px 8px #2227",
        padding: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        border: "2px solid #333",
      }}
    >
      {buttonMap.map((row, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "center", gap: 4 }}>
          {row.map((btn) => (
            <button
              key={btn.key}
              onClick={() => handlePress(btn.key)}
              style={{
                width: [
                  "ZOOM", "GOTO", "PAUSE", "TV/R", "IPTV", "FAV", "EPG", "Prev", "Play", "Next", "Stop", "Back", "Pause", "Forward", "Record"
                ].includes(btn.label) ? 14 : (btn.big ? 26 : 18),
                height: [
                  "ZOOM", "PAUSE", "GOTO", "TV/R", "IPTV", "FAV", "EPG", "YouTube", "Prev", "Play", "Next", "Stop", "Back", "Pause", "Forward", "Record"
                ].includes(btn.label) ? (btn.big ? 18 : 13) : (btn.big ? 26 : 18),
                margin: "1px 2px",
                borderRadius: ["SAT", "RECALL", "INFO", "Audio", "Exit", "Menu"].includes(btn.label) ? "50%" : (btn.big ? 13 : 6),
                background: pressed === btn.key ? "#444" : btn.color || "#333",
                color: btn.color ? "#fff" : "#eee",
                border: btn.big ? "2px solid #fff" : "1px solid #666",
                fontWeight: btn.big ? 700 : 500,
                fontSize: btn.big ? 11 : 8.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: pressed === btn.key ? "0 0 0 2px #2196f3" : "0 1px 2px #0006",
                transition: "all 0.1s",
                outline: "none",
                cursor: "pointer",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                letterSpacing: 0.2,
              }}
              title={btn.label}
            >
              {btn.icon || (
                <span
                  style={{
                    fontSize: [
                      "Menu", "Audio", "INFO", "SAT", "RECALL", "IPTV", "FAV", "EPG", "ZOOM", "GOTO", "PAUSE", "TV/R", "Prev", "Play", "Next", "Stop", "Back", "Pause", "Forward", "Record"
                    ].includes(btn.label)
                      ? 5
                      : [
                        "Recall", "Audio", "GOTO", "PAUSE", "TV/R"
                      ].includes(btn.label)
                      ? 4 
                      : [
                        "VOL-", "VOL+", "CH-", "CH+", "SUBTL", "TXT", "Menu", "Exit", "SAT", "IPTV", "YouTube", "FAV", "EPG", "ZOOM"
                      ].includes(btn.label)
                      ? 6.5
                      : btn.big
                      ? 11
                      : 8.5,
                    width: "100%",
                    display: "block",
                    lineHeight: 1.2,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                    padding: "0 1px",
                    boxSizing: "border-box",
                    textAlign: "center",
                    textShadow: "0 1px 1px #000",
                  }}
                >
                  {btn.label}
                </span>
              )}
            </button>
          ))}
        </div>
      ))}
      <div style={{ 
        marginTop: 6, 
        color: "#f44336", 
        fontWeight: 700, 
        fontSize: 6, 
        letterSpacing: 0.5, 
        textShadow: "0 1px 2px #000a",
        textAlign: "center",
        background: "#000",
        padding: "4px 4px",
        borderRadius: 4,
        border: "1px solid #333",
        display: "inline-block",
        whiteSpace: "nowrap"
      }}>
        OPENBOX GOLD
      </div>
    </div>
  );
} 