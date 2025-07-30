import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import {
  PlayCircle,
  Tv,
  Settings,
  BarChart3,
  Shield,
  Clock,
  Users,
  ArrowRight,
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { devices, problems, getEntityStats } = useData();

  const deviceStats = getEntityStats("devices");
  const problemStats = getEntityStats("problems");

  const handleStartDiagnostic = () => {
    navigate("/devices");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Удален дублирующий заголовок - заголовок уже есть в Layout */}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Быстрая диагностика проблем
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Пошаговые инструкции для решения проблем с цифровыми
              ТВ-приставками. Простой интерфейс, профессиональные решения.
            </p>

            <Button
              size="lg"
              onClick={handleStartDiagnostic}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium"
            >
              <PlayCircle className="h-5 w-5 mr-2" />
              Начать диагностику
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Tv className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {deviceStats.active}
                </div>
                <div className="text-sm text-gray-600">
                  Поддерживаемых моделей
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {problemStats.total}
                </div>
                <div className="text-sm text-gray-600">Готовых решений</div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">95%</div>
                <div className="text-sm text-gray-600">Успешных решений</div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  24/7
                </div>
                <div className="text-sm text-gray-600">Доступность</div>
              </CardContent>
            </Card>
          </div>

          {/* Supported Devices */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Поддерживаемые устройства
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {devices
                .filter((d) => d.isActive)
                .map((device) => (
                  <Card
                    key={device.id}
                    className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 text-center">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${device.color} rounded-lg flex items-center justify-center mx-auto mb-3`}
                      >
                        <Tv className="h-6 w-6 text-white" />
                      </div>
                      <div className="font-semibold text-gray-900 mb-1">
                        {device.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {device.model}
                      </div>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Доступно
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-gray-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Почему выбирают нас
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Наде��ность
                </h4>
                <p className="text-gray-600">
                  Проверенные решения от профессиональных техников с многолетним
                  опытом
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Быстрота
                </h4>
                <p className="text-gray-600">
                  Среднее время решения проблемы составляет всего 5-10 минут
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Эффективность
                </h4>
                <p className="text-gray-600">
                  95% проблем решаются с первого раза без вызова техника
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Tv className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">ANT Support</div>
                <div className="text-sm text-gray-600">v2.0.0</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              © 2024 ANT Support. Все права защищены.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
