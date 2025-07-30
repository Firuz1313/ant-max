import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ChevronRight,
  Tv,
  Zap,
  Wifi,
  Settings,
  Star,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";

const DeviceSelection = () => {
  const navigate = useNavigate();
  const { getActiveDevices, getProblemsForDevice } = useData();
  const devices = getActiveDevices();

  const handleDeviceSelect = (deviceId: string) => {
    navigate(`/problems/${deviceId}`);
  };

  const handleBack = () => {
    navigate("/");
  };

  const getDeviceIcon = (deviceId: string) => {
    switch (deviceId) {
      case "openbox":
        return <Tv className="h-8 w-8" />;
      case "uclan":
        return <Zap className="h-8 w-8" />;
      case "hdbox":
        return <Settings className="h-8 w-8" />;
      case "openbox_gold":
        return <Star className="h-8 w-8" />;
      default:
        return <Tv className="h-8 w-8" />;
    }
  };

  const getDeviceFeatures = (deviceId: string) => {
    const features: Record<string, string[]> = {
      openbox: ["HD Quality", "DVB-T2", "USB Recording", "HDMI Output"],
      uclan: ["4K Support", "Wi-Fi Built-in", "Android TV", "Voice Control"],
      hdbox: [
        "Professional Grade",
        "Multi-Format",
        "Network Streaming",
        "Advanced Audio",
      ],
      openbox_gold: [
        "Premium Quality",
        "Dual Tuner",
        "Smart Features",
        "Gold Edition",
      ],
    };
    return features[deviceId] || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="text-white hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                <Tv className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl text-white">
                  Выбор приставки
                </span>
                <div className="text-xs text-gray-400 -mt-1">
                  Шаг 1 из 3: Выберите вашу модель приставки
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20 pb-8">
        {/* Page Title */}
        <div className="container mx-auto px-4 mb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Какая у вас приставка?
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Выберите модель вашей ТВ-приставки для получения
              персонализированной помощи
            </p>
          </div>
        </div>

        {/* Devices Grid */}
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {devices.map((device) => {
                const problemsCount = getProblemsForDevice(device.id).length;
                const features = getDeviceFeatures(device.id);

                return (
                  <Card
                    key={device.id}
                    className="group hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:scale-105"
                    onClick={() => handleDeviceSelect(device.id)}
                  >
                    <CardHeader className="text-center pb-4">
                      <div
                        className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${device.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow`}
                      >
                        {getDeviceIcon(device.id)}
                      </div>
                      <CardTitle className="text-xl text-white group-hover:text-blue-300 transition-colors">
                        {device.name}
                      </CardTitle>
                      <p className="text-gray-400 text-sm">{device.model}</p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-gray-300 text-sm text-center">
                        {device.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-2">
                        <h4 className="text-white text-sm font-semibold">
                          Особенности:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {features.slice(0, 3).map((feature, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {feature}
                            </Badge>
                          ))}
                          {features.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{features.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Problems count */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="text-sm text-gray-400">
                          {problemsCount} типов проблем
                        </div>
                        <ChevronRight className="h-5 w-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="container mx-auto px-4 mt-16">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-600/10 border-white/20 backdrop-blur-md hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500">
              <CardContent className="p-10 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Не знаете модель приставки?
                </h3>
                <p className="text-gray-300 mb-6 text-lg leading-relaxed max-w-2xl mx-auto">
                  Обычно модель указана на корпусе приставки или в главном меню системы
                </p>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm px-8 py-3 text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <Wifi className="h-5 w-5 mr-2" />
                  Помощь в определении модели
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceSelection;
