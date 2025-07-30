import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Move,
  Search,
  ArrowUp,
  ArrowDown,
  Eye,
  MoreVertical,
  Layers,
  PlayCircle,
  MousePointer,
  Target,
  Palette,
  ImageIcon,
  Save,
  Tv,
  EyeOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";

interface DiagnosticStep {
  id: string;
  problemId: string;
  deviceId: string;
  stepNumber: number;
  title: string;
  description: string;
  instruction: string;
  highlightRemoteButton?: string;
  highlightTVArea?: string;
  tvInterface?: "home" | "settings" | "channels" | "no-signal";
  requiredAction?: string;
  hint?: string;
  remoteId?: string;
  buttonPosition?: { x: number; y: number };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const StepsManager = () => {
  const {
    steps,
    createStep,
    updateStep,
    deleteStep,
    reorderSteps,
    problems,
    devices,
    remotes,
    getActiveDevices,
    getActiveRemotes,
    getRemoteById,
    getProblemsForDevice,
    getRemotesForDevice,
    getDefaultRemoteForDevice,
  } = useData();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDevice, setFilterDevice] = useState<string>("all");
  const [filterProblem, setFilterProblem] = useState<string>("all");
  const [filterRemote, setFilterRemote] = useState<string>("all");
  const [selectedStep, setSelectedStep] = useState<DiagnosticStep | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRemoteEditorOpen, setIsRemoteEditorOpen] = useState(false);

  // Remote editor state
  const [selectedRemote, setSelectedRemote] = useState<any>(null);
  const [isPickingButton, setIsPickingButton] = useState(false);
  const [customRemoteImage, setCustomRemoteImage] = useState<string | null>(
    null,
  );

  const [formData, setFormData] = useState({
    deviceId: "",
    problemId: "",
    title: "",
    description: "",
    instruction: "",
    highlightRemoteButton: "none",
    highlightTVArea: "none",
    tvInterface: "home" as DiagnosticStep["tvInterface"],
    requiredAction: "",
    hint: "",
    remoteId: "none",
    buttonPosition: { x: 0, y: 0 },
  });

  const tvAreas = [
    "settings-menu",
    "live-tv",
    "apps",
    "network",
    "display",
    "channel-1",
    "channel-2",
    "channel-3",
    "channel-4",
  ];

  const filteredSteps = steps.filter((step) => {
    const matchesSearch =
      step.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      step.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDevice =
      filterDevice === "all" || step.deviceId === filterDevice;
    const matchesProblem =
      filterProblem === "all" || step.problemId === filterProblem;
    const matchesRemote =
      filterRemote === "all" ||
      step.remoteId === filterRemote ||
      (!step.remoteId && filterRemote === "none");
    return matchesSearch && matchesDevice && matchesProblem && matchesRemote;
  });

  const getAvailableProblems = () => {
    if (formData.deviceId) {
      return getProblemsForDevice(formData.deviceId);
    }
    return problems.filter((p) => p.status === "active");
  };

  const getAvailableRemotes = () => {
    if (formData.deviceId) {
      return getRemotesForDevice(formData.deviceId);
    }
    return getActiveRemotes();
  };

  const getFilteredRemotes = () => {
    if (filterDevice === "all") {
      return getActiveRemotes();
    }
    return getRemotesForDevice(filterDevice);
  };

  const handleCreate = async () => {
    const deviceSteps = steps.filter(
      (s) =>
        s.deviceId === formData.deviceId && s.problemId === formData.problemId,
    );
    const maxStepNumber =
      deviceSteps.length > 0
        ? Math.max(...deviceSteps.map((s) => s.stepNumber))
        : 0;

    const newStep: DiagnosticStep = {
      id: `step-${formData.deviceId}-${formData.problemId}-${Date.now()}`,
      ...formData,
      highlightRemoteButton:
        formData.highlightRemoteButton === "none"
          ? undefined
          : formData.highlightRemoteButton,
      highlightTVArea:
        formData.highlightTVArea === "none"
          ? undefined
          : formData.highlightTVArea,
      remoteId: formData.remoteId === "none" ? undefined : formData.remoteId,
      buttonPosition:
        formData.buttonPosition.x === 0 && formData.buttonPosition.y === 0
          ? undefined
          : formData.buttonPosition,
      stepNumber: maxStepNumber + 1,
      isActive: true,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    try {
      await createStep(newStep);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating step:", error);
    }
  };

  const handleEdit = async () => {
    if (!selectedStep) return;

    const updatedFormData = {
      ...formData,
      highlightRemoteButton:
        formData.highlightRemoteButton === "none"
          ? undefined
          : formData.highlightRemoteButton,
      highlightTVArea:
        formData.highlightTVArea === "none"
          ? undefined
          : formData.highlightTVArea,
      remoteId: formData.remoteId === "none" ? undefined : formData.remoteId,
      buttonPosition:
        formData.buttonPosition.x === 0 && formData.buttonPosition.y === 0
          ? undefined
          : formData.buttonPosition,
    };

    try {
      await updateStep(selectedStep.id, updatedFormData);
      setIsEditDialogOpen(false);
      setSelectedStep(null);
      resetForm();
    } catch (error) {
      console.error("Error updating step:", error);
    }
  };

  const handleDelete = async (stepId: string) => {
    const stepToDelete = steps.find((s) => s.id === stepId);
    if (!stepToDelete) return;

    // Remove the step
    const remainingSteps = steps.filter((step) => step.id !== stepId);

    // Reorder step numbers for the same problem
    const reorderedSteps = remainingSteps.map((step) => {
      if (
        step.problemId === stepToDelete.problemId &&
        step.stepNumber > stepToDelete.stepNumber
      ) {
        return { ...step, stepNumber: step.stepNumber - 1 };
      }
      return step;
    });

    try {
      await deleteStep(stepId);
      // The DataContext should handle step reordering automatically
    } catch (error) {
      console.error("Error deleting step:", error);
    }
  };

  const handleToggleStatus = async (stepId: string) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;

    try {
      await updateStep(stepId, {
        isActive: !step.isActive,
      });
    } catch (error) {
      console.error("Error toggling step status:", error);
    }
  };

  const handleMoveStep = async (stepId: string, direction: "up" | "down") => {
    const stepIndex = steps.findIndex((s) => s.id === stepId);
    const step = steps[stepIndex];
    if (!step) return;

    const problemSteps = steps
      .filter((s) => s.problemId === step.problemId)
      .sort((a, b) => a.stepNumber - b.stepNumber);

    const currentIndex = problemSteps.findIndex((s) => s.id === stepId);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= problemSteps.length) return;

    const updatedSteps = steps.map((s) => {
      if (s.id === stepId) {
        return { ...s, stepNumber: problemSteps[newIndex].stepNumber };
      }
      if (s.id === problemSteps[newIndex].id) {
        return { ...s, stepNumber: step.stepNumber };
      }
      return s;
    });

    try {
      // Use the reorderSteps function from DataContext
      const problemStepIds = problemSteps.map((s) => {
        if (s.id === stepId) return problemSteps[newIndex].id;
        if (s.id === problemSteps[newIndex].id) return stepId;
        return s.id;
      });
      await reorderSteps(step.problemId, problemStepIds);
    } catch (error) {
      console.error("Error moving step:", error);
    }
  };

  const openEditDialog = (step: DiagnosticStep) => {
    setSelectedStep(step);
    setFormData({
      deviceId: step.deviceId,
      problemId: step.problemId,
      title: step.title,
      description: step.description,
      instruction: step.instruction,
      highlightRemoteButton: step.highlightRemoteButton || "none",
      highlightTVArea: step.highlightTVArea || "none",
      tvInterface: step.tvInterface || "home",
      requiredAction: step.requiredAction || "",
      hint: step.hint || "",
      remoteId: step.remoteId || "none",
      buttonPosition: step.buttonPosition || { x: 0, y: 0 },
    });
    setIsEditDialogOpen(true);
  };

  const openRemoteEditor = () => {
    const remote = getRemoteById(formData.remoteId);
    if (remote) {
      setSelectedRemote(remote);
      setIsRemoteEditorOpen(true);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPickingButton || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    setFormData({
      ...formData,
      buttonPosition: { x, y },
    });

    setIsPickingButton(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomRemoteImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      deviceId: "",
      problemId: "",
      title: "",
      description: "",
      instruction: "",
      highlightRemoteButton: "none",
      highlightTVArea: "none",
      tvInterface: "home",
      requiredAction: "",
      hint: "",
      remoteId: "none",
      buttonPosition: { x: 0, y: 0 },
    });
    setCustomRemoteImage(null);
  };

  const getDeviceName = (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId);
    return device?.name || "Н��известная п��иставка";
  };

  const getProblemTitle = (problemId: string) => {
    const problem = problems.find((p) => p.id === problemId);
    return problem?.title || "Неизвестная проблема";
  };

  const getGroupedSteps = () => {
    return filteredSteps.reduce(
      (acc, step) => {
        const key = `${step.deviceId}-${step.problemId}`;
        if (!acc[key]) {
          acc[key] = {
            deviceId: step.deviceId,
            problemId: step.problemId,
            steps: [],
          };
        }
        acc[key].steps.push(step);
        return acc;
      },
      {} as Record<
        string,
        { deviceId: string; problemId: string; steps: DiagnosticStep[] }
      >,
    );
  };

  const renderRemoteEditor = () => {
    const remoteImage = customRemoteImage || selectedRemote?.imageData;

    return (
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Canvas Area */}
        <div className="flex-1">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 relative">
            <canvas
              ref={canvasRef}
              width={400}
              height={600}
              className="border border-gray-300 dark:border-gray-600 rounded cursor-crosshair mx-auto"
              style={{
                backgroundImage: remoteImage ? `url(${remoteImage})` : "none",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundColor: remoteImage ? "transparent" : "#f3f4f6",
              }}
              onClick={handleCanvasClick}
            />

            {/* Show selected position */}
            {formData.buttonPosition.x > 0 && formData.buttonPosition.y > 0 && (
              <div
                className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${(formData.buttonPosition.x / 400) * 100}%`,
                  top: `${(formData.buttonPosition.y / 600) * 100}%`,
                }}
              />
            )}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-full lg:w-80 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Пипетка позиции</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant={isPickingButton ? "default" : "outline"}
                  onClick={() => setIsPickingButton(!isPickingButton)}
                  className="w-full"
                >
                  <Target className="h-4 w-4 mr-2" />
                  {isPickingButton ? "Отмени��ь выбор" : "Выбрать позицию"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Загрузить изображение
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {isPickingButton && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Кликните на изображение пульта, чтобы указать позицию кнопки
                  </p>
                </div>
              )}

              {formData.buttonPosition.x > 0 &&
                formData.buttonPosition.y > 0 && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Позиция выбрана: ({Math.round(formData.buttonPosition.x)},{" "}
                      {Math.round(formData.buttonPosition.y)})
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const StepFormFields = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={isEdit ? "edit-deviceId" : "deviceId"}>
            Приставка
          </Label>
          <Select
            value={formData.deviceId}
            onValueChange={(value) => {
              const defaultRemote = getDefaultRemoteForDevice(value);
              setFormData({
                ...formData,
                deviceId: value,
                problemId: "",
                remoteId: defaultRemote?.id || "none",
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите приставку" />
            </SelectTrigger>
            <SelectContent>
              {getActiveDevices().map((device) => (
                <SelectItem key={device.id} value={device.id}>
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded bg-gradient-to-br ${device.color} mr-2`}
                    />
                    {device.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor={isEdit ? "edit-problemId" : "problemId"}>
            Проблема
          </Label>
          <Select
            value={formData.problemId}
            onValueChange={(value) =>
              setFormData({ ...formData, problemId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите проблему" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableProblems().map((problem) => (
                <SelectItem key={problem.id} value={problem.id}>
                  {problem.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor={isEdit ? "edit-title" : "title"}>Название шага</Label>
        <Input
          id={isEdit ? "edit-title" : "title"}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Введите название шага"
        />
      </div>

      <div>
        <Label htmlFor={isEdit ? "edit-description" : "description"}>
          Описание
        </Label>
        <Textarea
          id={isEdit ? "edit-description" : "description"}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Краткое описание шага"
        />
      </div>

      <div>
        <Label htmlFor={isEdit ? "edit-instruction" : "instruction"}>
          Инструкция
        </Label>
        <Textarea
          id={isEdit ? "edit-instruction" : "instruction"}
          value={formData.instruction}
          onChange={(e) =>
            setFormData({ ...formData, instruction: e.target.value })
          }
          placeholder="Подробная инструкция для пользователя"
        />
      </div>

      <div>
        <Label htmlFor={isEdit ? "edit-tvInterface" : "tvInterface"}>
          Интерфейс ТВ
        </Label>
        <Select
          value={formData.tvInterface}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              tvInterface: value as DiagnosticStep["tvInterface"],
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="home">Главное меню</SelectItem>
            <SelectItem value="settings">Настройки</SelectItem>
            <SelectItem value="channels">Каналы</SelectItem>
            <SelectItem value="no-signal">Нет сигнала</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor={isEdit ? "edit-remoteId" : "remoteId"}>Пульт</Label>
        <div className="flex space-x-2">
          <Select
            value={formData.remoteId}
            onValueChange={(value) =>
              setFormData({ ...formData, remoteId: value })
            }
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Выберите пульт" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Без пульта</SelectItem>
              {getAvailableRemotes().map((remote) => {
                const device = devices.find((d) => d.id === remote.deviceId);
                return (
                  <SelectItem key={remote.id} value={remote.id}>
                    <div className="flex items-center">
                      {device && (
                        <div
                          className={`w-3 h-3 rounded bg-gradient-to-br ${device.color} mr-2`}
                        />
                      )}
                      {remote.name}
                      {remote.isDefault && (
                        <span className="ml-2 text-xs text-blue-600">
                          (по умолчанию)
                        </span>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {formData.remoteId !== "none" && (
            <Button variant="outline" onClick={openRemoteEditor} size="sm">
              <MousePointer className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={isEdit ? "edit-highlightTVArea" : "highlightTVArea"}>
            Область ТВ
          </Label>
          <Select
            value={formData.highlightTVArea}
            onValueChange={(value) =>
              setFormData({ ...formData, highlightTVArea: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите область" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Без подсветки</SelectItem>
              {tvAreas.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={isEdit ? "edit-requiredAction" : "requiredAction"}>
            Требуемое действие
          </Label>
          <Input
            id={isEdit ? "edit-requiredAction" : "requiredAction"}
            value={formData.requiredAction}
            onChange={(e) =>
              setFormData({ ...formData, requiredAction: e.target.value })
            }
            placeholder="Действие для автоперехода"
          />
        </div>
      </div>

      <div>
        <Label htmlFor={isEdit ? "edit-hint" : "hint"}>Подсказка</Label>
        <Textarea
          id={isEdit ? "edit-hint" : "hint"}
          value={formData.hint}
          onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
          placeholder="Дополнительная подсказка для пользователя"
        />
      </div>

      {formData.buttonPosition.x > 0 && formData.buttonPosition.y > 0 && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">
            Позиция кнопки: ({Math.round(formData.buttonPosition.x)},{" "}
            {Math.round(formData.buttonPosition.y)})
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Управление шагами
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Создание ш��гов диагностики с привязкой к приставкам и проблемам
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Создать шаг
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Создать новый шаг</DialogTitle>
            </DialogHeader>
            <StepFormFields />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  !formData.deviceId || !formData.problemId || !formData.title
                }
              >
                Создать
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск шагов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={filterDevice}
                onValueChange={(value) => {
                  setFilterDevice(value);
                  setFilterRemote("all"); // Reset remote filter when device changes
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Приставка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все приставки</SelectItem>
                  {getActiveDevices().map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded bg-gradient-to-br ${device.color} mr-2`}
                        />
                        {device.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterProblem} onValueChange={setFilterProblem}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Проблема" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все проблемы</SelectItem>
                  {problems
                    .filter((p) => p.status === "active")
                    .map((problem) => (
                      <SelectItem key={problem.id} value={problem.id}>
                        {problem.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select value={filterRemote} onValueChange={setFilterRemote}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Пульт" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все пульты</SelectItem>
                  <SelectItem value="none">Без пульта</SelectItem>
                  {getFilteredRemotes().map((remote) => {
                    const device = devices.find(
                      (d) => d.id === remote.deviceId,
                    );
                    return (
                      <SelectItem key={remote.id} value={remote.id}>
                        <div className="flex items-center">
                          {device && (
                            <div
                              className={`w-3 h-3 rounded bg-gradient-to-br ${device.color} mr-2`}
                            />
                          )}
                          {remote.name}
                          {remote.isDefault && (
                            <span className="ml-2 text-xs text-blue-600">
                              (умолч.)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps List - Grouped by Device and Problem */}
      <div className="space-y-6">
        {Object.entries(getGroupedSteps()).map(([key, group]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="h-5 w-5 mr-2" />
                <Tv className="h-4 w-4 mr-2" />
                {getDeviceName(group.deviceId)} -{" "}
                {getProblemTitle(group.problemId)}
                <Badge variant="secondary" className="ml-2">
                  {group.steps.length} шагов
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.steps
                  .sort((a, b) => a.stepNumber - b.stepNumber)
                  .map((step) => (
                    <div
                      key={step.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                {step.stepNumber}
                              </span>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleMoveStep(step.id, "up")}
                                disabled={step.stepNumber === 1}
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleMoveStep(step.id, "down")}
                                disabled={
                                  step.stepNumber === group.steps.length
                                }
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {step.title}
                              </h4>
                              <Badge
                                variant={
                                  step.isActive ? "default" : "secondary"
                                }
                              >
                                {step.isActive ? "Активен" : "Неактивен"}
                              </Badge>
                              {step.requiredAction && (
                                <Badge variant="outline">
                                  <PlayCircle className="h-3 w-3 mr-1" />
                                  Автопереход
                                </Badge>
                              )}
                              {step.remoteId && (
                                <Badge variant="outline">
                                  <MousePointer className="h-3 w-3 mr-1" />
                                  Пульт
                                </Badge>
                              )}
                              {step.buttonPosition && (
                                <Badge variant="outline">
                                  <Target className="h-3 w-3 mr-1" />
                                  Позиция
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                              {step.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              {step.remoteId && (
                                <span>
                                  Пульт:{" "}
                                  {getRemoteById(step.remoteId)?.name ||
                                    "Неизвестный"}
                                </span>
                              )}
                              {step.buttonPosition && (
                                <span>
                                  Позиция: ({Math.round(step.buttonPosition.x)},{" "}
                                  {Math.round(step.buttonPosition.y)})
                                </span>
                              )}
                              {step.highlightTVArea && (
                                <span>ТВ: {step.highlightTVArea}</span>
                              )}
                              {step.tvInterface && (
                                <span>Интерфейс: {step.tvInterface}</span>
                              )}
                              <span>Обновлено: {step.updatedAt}</span>
                            </div>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openEditDialog(step)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(step.id)}
                            >
                              {step.isActive ? (
                                <EyeOff className="h-4 w-4 mr-2" />
                              ) : (
                                <Eye className="h-4 w-4 mr-2" />
                              )}
                              {step.isActive
                                ? "Деактивировать"
                                : "Активировать"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(step.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Remote Editor Dialog */}
      <Dialog open={isRemoteEditorOpen} onOpenChange={setIsRemoteEditorOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Выбор позиции на пульте: {selectedRemote?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">{renderRemoteEditor()}</div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsRemoteEditorOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={() => setIsRemoteEditorOpen(false)}>
              <Save className="h-4 w-4 mr-2" />
              Сохранить позицию
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать шаг</DialogTitle>
          </DialogHeader>
          <StepFormFields isEdit={true} />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleEdit}
              disabled={
                !formData.deviceId || !formData.problemId || !formData.title
              }
            >
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {Object.keys(getGroupedSteps()).length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Шаги не найдены
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Попробуйте изменить фильтры поиска или создайте новый шаг.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StepsManager;
