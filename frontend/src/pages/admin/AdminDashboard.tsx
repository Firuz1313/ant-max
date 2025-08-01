import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useData } from "@/contexts/DataContext";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Monitor,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminDashboard = () => {
  const {
    devices,
    problems,
    steps,
    remotes,
    sessions,
    changeLogs,
    getEntityStats,
    getActiveSessions,
    refreshData,
    exportData,
    siteSettings,
  } = useData();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  // Statistics
  const deviceStats = getEntityStats("devices");
  const problemStats = getEntityStats("problems");
  const stepStats = getEntityStats("steps");
  const remoteStats = getEntityStats("remotes");
  const activeSessions = getActiveSessions();

  // Recent activity
  const recentChanges = changeLogs.slice(0, 10);

  // Performance metrics
  const totalProblems = problemStats.total;
  const publishedProblems = problems.filter(
    (p) => p.status === "published",
  ).length;
  const completionRate =
    totalProblems > 0
      ? Math.round((publishedProblems / totalProblems) * 100)
      : 0;

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refreshData();
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportData({
        format: "json",
        entities: ["devices", "problems", "steps", "remotes"],
        includeMetadata: true,
        includeMedia: false,
      });

      // Create download link
      const link = document.createElement("a");
      link.href = result.downloadUrl;
      link.download = `ant-support-backup-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Панель управления
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Общий обзор системы диагностики ТВ-приставок
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Обновить
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                {selectedPeriod === "week"
                  ? "Неделя"
                  : selectedPeriod === "month"
                    ? "Месяц"
                    : "Год"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedPeriod("week")}>
                За неделю
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPeriod("month")}>
                За месяц
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPeriod("year")}>
                За год
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Устройства</CardTitle>
            <Monitor className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceStats.active}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{deviceStats.active}</span>{" "}
              активных
            </p>
            <Progress
              value={(deviceStats.active / deviceStats.total) * 100}
              className="mt-3"
            />
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Проблемы</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{problemStats.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{publishedProblems}</span>{" "}
              опубликованы
            </p>
            <Progress value={completionRate} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Шаги</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stepStats.active}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">{stepStats.total}</span> всего
            </p>
            <Progress
              value={(stepStats.active / stepStats.total) * 100}
              className="mt-3"
            />
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Активные сессии
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> за сегодня
            </p>
            <Progress value={75} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Распределение проблем по устройствам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {devices.map((device) => {
                const deviceProblems = problems.filter(
                  (p) => p.deviceId === device.id,
                );
                const percentage =
                  totalProblems > 0
                    ? (deviceProblems.length / totalProblems) * 100
                    : 0;

                return (
                  <div key={device.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded bg-gradient-to-r ${device.color} mr-2`}
                        />
                        <span className="font-medium">{device.name}</span>
                      </div>
                      <span className="text-gray-600">
                        {deviceProblems.length} проблем
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Состояние системы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">База данных</span>
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Работает
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API</span>
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Работает
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Файловое хранилище</span>
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Работает
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Кэш</span>
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Обновляется
                </Badge>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600 mb-2">
                  Использование хранилища
                </div>
                <Progress value={67} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">
                  6.7 GB из 10 GB
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Последние изменения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentChanges.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Пока нет активности</p>
                </div>
              ) : (
                recentChanges.map((change) => (
                  <div
                    key={change.id}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex-shrink-0">
                      {change.action === "create" && (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Plus className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                      {change.action === "update" && (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      {change.action === "delete" && (
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {change.action === "create" && "Создано"}
                        {change.action === "update" && "Обновлено"}
                        {change.action === "delete" && "Удалено"}{" "}
                        {change.entityType === "device" && "устройство"}
                        {change.entityType === "problem" && "проблема"}
                        {change.entityType === "step" && "шаг"}
                        {change.entityType === "remote" && "пульт"}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {change.userId} •{" "}
                        {new Date(change.createdAt).toLocaleString("ru")}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Быстрые действия
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Добавить устройство
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Создать проблему
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Импорт данных
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Экспорт резервной копии
              </Button>

              <div className="border-t pt-3 mt-4">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Системные настройки
                </div>
                <Button
                  className="w-full justify-start"
                  variant="ghost"
                  size="sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Общие настройки
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="ghost"
                  size="sm"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Управление пользователями
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="ghost"
                  size="sm"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Аналитика
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Problems */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Последние проблемы
            </CardTitle>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Посмотреть все
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {problems.slice(0, 5).map((problem) => {
              const device = devices.find((d) => d.id === problem.deviceId);
              const problemSteps = steps.filter(
                (s) => s.problemId === problem.id,
              );

              return (
                <div
                  key={problem.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 bg-gradient-to-br ${problem.color} rounded-lg flex items-center justify-center`}
                    >
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {problem.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {device?.name} • {problemSteps.length} шагов
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        problem.status === "published" ? "default" : "secondary"
                      }
                      className={
                        problem.status === "published" ? "bg-green-600" : ""
                      }
                    >
                      {problem.status === "published"
                        ? "Опубликовано"
                        : "Черновик"}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Просмотр
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
