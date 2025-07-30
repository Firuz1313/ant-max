import { cn } from "@/lib/utils";
import { Monitor, Wifi, Settings, Home, PlayCircle, Grid3X3 } from "lucide-react";

interface TVDisplayProps {
  currentStep?: number;
  highlightArea?: string;
  showInterface?: boolean;
  interfaceScreen?: "home" | "settings" | "channels" | "no-signal";
}

const TVDisplay = ({ currentStep, highlightArea, showInterface = true, interfaceScreen = "home" }: TVDisplayProps) => {
  const renderInterface = () => {
    switch (interfaceScreen) {
      case "no-signal":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Monitor className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-300 mb-2">НЕТ СИГНАЛА</h2>
            <p className="text-gray-400">Проверьте подключение кабелей</p>
          </div>
        );
      
      case "settings":
        return (
          <div className="p-6 h-full">
            <div className="border-b border-gray-600 pb-4 mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Settings className="h-6 w-6 mr-2" />
                Настройки
              </h2>
            </div>
            <div className="space-y-4">
              <div className={cn(
                "p-3 rounded bg-gray-700/50 border transition-all duration-300",
                highlightArea === "network" ? "border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/30" : "border-gray-600"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Wifi className="h-5 w-5 text-blue-400 mr-2" />
                    <span className="text-white">Сеть и интернет</span>
                  </div>
                  <span className="text-gray-400">▶</span>
                </div>
              </div>
              <div className={cn(
                "p-3 rounded bg-gray-700/50 border transition-all duration-300",
                highlightArea === "display" ? "border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/30" : "border-gray-600"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Monitor className="h-5 w-5 text-green-400 mr-2" />
                    <span className="text-white">Дисплей</span>
                  </div>
                  <span className="text-gray-400">▶</span>
                </div>
              </div>
              <div className="p-3 rounded bg-gray-700/50 border border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Settings className="h-5 w-5 text-purple-400 mr-2" />
                    <span className="text-white">Система</span>
                  </div>
                  <span className="text-gray-400">▶</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "channels":
        return (
          <div className="p-6 h-full">
            <div className="border-b border-gray-600 pb-4 mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Grid3X3 className="h-6 w-6 mr-2" />
                Каналы
              </h2>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "aspect-video bg-gray-700/50 rounded border border-gray-600 flex items-center justify-center transition-all duration-300",
                    highlightArea === `channel-${i + 1}` ? "border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/30" : ""
                  )}
                >
                  <span className="text-white font-semibold">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        );
      
      default: // home
        return (
          <div className="p-6 h-full">
            <div className="border-b border-gray-600 pb-4 mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Home className="h-6 w-6 mr-2" />
                Главное меню
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className={cn(
                "p-4 rounded bg-gray-700/50 border transition-all duration-300 cursor-pointer",
                highlightArea === "live-tv" ? "border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/30" : "border-gray-600"
              )}>
                <PlayCircle className="h-8 w-8 text-red-400 mb-2" />
                <span className="text-white text-sm">Прямой эфир</span>
              </div>
              <div className={cn(
                "p-4 rounded bg-gray-700/50 border transition-all duration-300 cursor-pointer",
                highlightArea === "settings-menu" ? "border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/30" : "border-gray-600"
              )}>
                <Settings className="h-8 w-8 text-blue-400 mb-2" />
                <span className="text-white text-sm">Настройки</span>
              </div>
              <div className={cn(
                "p-4 rounded bg-gray-700/50 border transition-all duration-300 cursor-pointer",
                highlightArea === "apps" ? "border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/30" : "border-gray-600"
              )}>
                <Grid3X3 className="h-8 w-8 text-green-400 mb-2" />
                <span className="text-white text-sm">Приложения</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* TV Frame */}
      <div className="bg-gray-900 p-2 sm:p-4 rounded-2xl shadow-2xl border-2 border-gray-700 w-full max-w-full">
        {/* TV Screen */}
        <div className="aspect-video bg-black rounded-lg overflow-hidden border border-gray-800 relative w-full max-w-full" style={{minHeight:'320px', height:'min(60vw,60vh)', maxHeight:'calc(100vh - 180px)'}}>
          {showInterface ? (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 text-white">
              {renderInterface()}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Monitor className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-400">Экран выключен</p>
              </div>
            </div>
          )}
          {/* Step indicator on TV */}
          {currentStep && (
            <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
              Шаг {currentStep}
            </div>
          )}
        </div>
        {/* TV Brand */}
        <div className="text-center mt-2">
          <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1 animate-pulse" />
          <span className="text-gray-400 text-xs font-semibold">SMART TV</span>
        </div>
      </div>
    </div>
  );
};

export default TVDisplay;
