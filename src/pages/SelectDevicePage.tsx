import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Triangle } from "lucide-react";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, RoundedBox } from '@react-three/drei';

const devices = [
  {
    id: "openbox",
    name: "OpenBox",
    description: "Спутниковый цифровой приемник стандарта DVB-S/S2",
    image:
      "https://cdn.builder.io/api/v1/image/assets%2F95b82fa70d144d2883c004e62e43cf14%2F8b3a75dde80c48a8bd40ad05b1f05482?format=webp&width=800",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "openbox-gold",
    name: "OpenBox Gold",
    description: "Премиум модель с расширенным функционалом",
    image:
      "https://cdn.builder.io/api/v1/image/assets%2F95b82fa70d144d2883c004e62e43cf14%2F8b3a75dde80c48a8bd40ad05b1f05482?format=webp&width=800",
    color: "from-amber-500 to-amber-600",
  },
  {
    id: "uclan",
    name: "Uclan",
    description: "Надежный цифровой ресивер для всех ТВ каналов",
    image:
      "https://cdn.builder.io/api/v1/image/assets%2F95b82fa70d144d2883c004e62e43cf14%2F8b3a75dde80c48a8bd40ad05b1f05482?format=webp&width=800",
    color: "from-green-500 to-green-600",
  },
  {
    id: "hdbox",
    name: "HDBox",
    description: "HD тюнер с функцией записи и воспроизведения",
    image:
      "https://cdn.builder.io/api/v1/image/assets%2F95b82fa70d144d2883c004e62e43cf14%2F8b3a75dde80c48a8bd40ad05b1f05482?format=webp&width=800",
    color: "from-purple-500 to-purple-600",
  },
];

function Device3DBox({ color = '#222' }) {
  return (
    <group>
      {/* Увеличенный корпус приставки */}
      <RoundedBox
        args={[3.2, 1.1, 1.5]}
        radius={0.18}
        smoothness={10}
        position={[0, 0.2, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={color}
          metalness={0.6}
          roughness={0.12}
          clearcoat={0.8}
          clearcoatRoughness={0.07}
          reflectivity={0.36}
        />
      </RoundedBox>
    </group>
  );
}

const SelectDevicePage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  const handleDeviceSelect = (deviceId: string) => {
    navigate(`/device/${deviceId}`);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-[#1877f2] relative"
      style={{ backgroundImage: `linear-gradient(180deg, #1877f2 0%, #3997ff 100%)`, minHeight: '100vh' }}
    >
      {/* Сетка фона */}
      <div className="absolute inset-0 -z-10" style={{
            backgroundImage: `
          linear-gradient(0deg, rgba(255,255,255,0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
      }} />
      {/* Шапка */}
      <header className="w-full max-w-3xl mx-auto flex flex-col items-center pt-10 pb-2">
        <div className="flex items-center mb-2">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg mr-3">
            <span className="font-bold text-2xl text-[#1877f2]">A</span>
          </div>
          <span className="text-white text-2xl font-bold tracking-wide">АНТ</span>
        </div>
        <div className="text-white text-lg font-semibold mb-2">Выберите модель вашей ТВ-приставки</div>
      </header>
      {/* Сетка устройств */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full mx-auto mt-4 mb-8">
        {devices.map((device) => (
          <div key={device.id} className="bg-white rounded-3xl shadow-2xl flex flex-col items-center px-8 py-7 min-w-[280px] max-w-[340px] w-full border-2 border-white">
            {/* 2D приставка */}
            <div className="w-full flex items-center justify-center mb-4">
              <div className="relative w-40 h-14 bg-black rounded-xl shadow-md flex items-end justify-center">
                {/* Детали: индикаторы, порты */}
                <div className="absolute left-3 bottom-2 w-2 h-2 bg-gray-300 rounded-full" />
                <div className="absolute left-7 bottom-2 w-1.5 h-1.5 bg-green-400 rounded-full" />
                <div className="absolute right-4 bottom-2 w-8 h-1 bg-gray-200 rounded" />
              </div>
                </div>
                {/* Название */}
            <div className="text-xl font-bold text-[#1877f2] text-center mb-1">{device.name}</div>
                {/* Описание */}
            <div className="text-gray-500 text-center text-base mb-5">{device.description}</div>
                {/* Кнопка выбора */}
                <Button
                  onClick={() => handleDeviceSelect(device.id)}
              className="w-full bg-[#1877f2] hover:bg-[#145dc1] text-white font-bold py-3 rounded-xl text-base shadow-md transition-all duration-200"
                >
                  Выбрать
                </Button>
            </div>
          ))}
        </div>
      {/* Кнопка "Назад" */}
      <div className="text-center mb-8">
          <Button
            onClick={handleBack}
            variant="ghost"
          className="text-white border border-white/30 hover:bg-white/10 font-medium transition-all duration-300 rounded-lg px-6 py-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
      </div>
    </div>
  );
};

export default SelectDevicePage;
