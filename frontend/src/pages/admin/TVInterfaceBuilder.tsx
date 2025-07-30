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
  Eye,
  MoreVertical,
  Monitor,
  Grid3X3,
  Home,
  Settings,
  PlayCircle,
  Wifi,
  ArrowUp,
  ArrowDown,
  Save,
  Copy,
  Download,
  Upload,
  ImageIcon,
  Palette,
  Layout,
  Layers2,
  Target,
  MousePointer,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import TVDisplay from "@/components/TVDisplay";
import { useData } from "@/contexts/DataContext";

interface TVInterface {
  id: string;
  name: string;
  type: "home" | "settings" | "channels" | "no-signal" | "custom";
  description: string;
  elements: TVInterfaceElement[];
  backgroundColor: string;
  backgroundImage?: string;
  isDefault: boolean;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TVInterfaceElement {
  id: string;
  type:
    | "menu-item"
    | "button"
    | "text"
    | "image"
    | "grid"
    | "notification"
    | "progress";
  label: string;
  icon: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  backgroundColor: string;
  highlightArea?: string;
  action?: string;
  order: number;
  opacity: number;
  borderRadius: number;
  fontSize: number;
  animation?: "none" | "pulse" | "bounce" | "fade";
}

const TVInterfaceBuilder = () => {
  const { updateTVInterfaces } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [interfaces, setInterfaces] = useState<TVInterface[]>([
    {
      id: "home-interface",
      name: "Главное меню",
      type: "home",
      description: "Современный интерфейс главного меню с анимациями",
      elements: [
        {
          id: "live-tv",
          type: "menu-item",
          label: "Прямой эфир",
          icon: "PlayCircle",
          position: { x: 20, y: 20 },
          size: { width: 200, height: 120 },
          color: "#ffffff",
          backgroundColor: "#ef4444",
          highlightArea: "live-tv",
          action: "navigate-live-tv",
          order: 1,
          opacity: 1,
          borderRadius: 12,
          fontSize: 16,
          animation: "none",
        },
        {
          id: "settings-menu",
          type: "menu-item",
          label: "Настройки",
          icon: "Settings",
          position: { x: 240, y: 20 },
          size: { width: 200, height: 120 },
          color: "#ffffff",
          backgroundColor: "#3b82f6",
          highlightArea: "settings-menu",
          action: "navigate-settings",
          order: 2,
          opacity: 1,
          borderRadius: 12,
          fontSize: 16,
          animation: "none",
        },
        {
          id: "apps",
          type: "menu-item",
          label: "Приложения",
          icon: "Grid3X3",
          position: { x: 460, y: 20 },
          size: { width: 200, height: 120 },
          color: "#ffffff",
          backgroundColor: "#10b981",
          highlightArea: "apps",
          action: "navigate-apps",
          order: 3,
          opacity: 1,
          borderRadius: 12,
          fontSize: 16,
          animation: "none",
        },
      ],
      backgroundColor: "#1f2937",
      isDefault: true,
      isActive: true,
      usageCount: 1847,
      createdAt: "2024-01-15",
      updatedAt: "2024-01-20",
    },
  ]);

  const [selectedInterface, setSelectedInterface] =
    useState<TVInterface | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isElementDialogOpen, setIsElementDialogOpen] = useState(false);
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const [selectedElement, setSelectedElement] =
    useState<TVInterfaceElement | null>(null);
  const [isPositioningMode, setIsPositioningMode] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "custom" as TVInterface["type"],
    description: "",
    backgroundColor: "#1f2937",
  });

  const [elementFormData, setElementFormData] = useState({
    type: "menu-item" as TVInterfaceElement["type"],
    label: "",
    icon: "Home",
    color: "#ffffff",
    backgroundColor: "#374151",
    highlightArea: "",
    action: "",
    opacity: 1,
    borderRadius: 8,
    fontSize: 14,
    animation: "none" as TVInterfaceElement["animation"],
  });

  const interfaceTypes = [
    { value: "home", label: "Главное меню", icon: "Home" },
    { value: "settings", label: "Настройки", icon: "Settings" },
    { value: "channels", label: "Каналы", icon: "PlayCircle" },
    { value: "no-signal", label: "Нет сигнала", icon: "Monitor" },
    { value: "custom", label: "Пользовательский", icon: "Layout" },
  ];

  const elementTypes = [
    { value: "menu-item", label: "Пункт меню", icon: "Grid3X3" },
    { value: "button", label: "Кнопка", icon: "MousePointer" },
    { value: "text", label: "Текст", icon: "Type" },
    { value: "image", label: "Изображение", icon: "ImageIcon" },
    { value: "grid", label: "Сетка", icon: "Layers2" },
    { value: "notification", label: "Уведомление", icon: "Bell" },
    { value: "progress", label: "Прогресс-бар", icon: "BarChart" },
  ];

  const iconOptions = [
    "Home",
    "Settings",
    "PlayCircle",
    "Grid3X3",
    "Wifi",
    "Monitor",
    "Volume2",
    "VolumeX",
    "Smartphone",
    "Shield",
    "Users",
    "Star",
    "Search",
    "Bell",
    "Mail",
    "Calendar",
    "Camera",
    "Music",
    "Video",
    "Download",
    "Upload",
    "Heart",
    "Bookmark",
    "Share",
  ];

  const animationOptions = [
    { value: "none", label: "Без анимации" },
    { value: "pulse", label: "Пульсация" },
    { value: "bounce", label: "Подпрыгивание" },
    { value: "fade", label: "Затухание" },
  ];

  const filteredInterfaces = interfaces.filter((iface) => {
    const matchesSearch =
      iface.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iface.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || iface.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleCreate = () => {
    const newInterface: TVInterface = {
      id: Date.now().toString(),
      ...formData,
      elements: [],
      backgroundImage: backgroundImage || undefined,
      isDefault: false,
      isActive: true,
      usageCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    const newInterfaces = [...interfaces, newInterface];
    setInterfaces(newInterfaces);
    updateTVInterfaces(newInterfaces);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedInterface) return;

    const updatedInterfaces = interfaces.map((iface) =>
      iface.id === selectedInterface.id
        ? {
            ...iface,
            ...formData,
            backgroundImage: backgroundImage || iface.backgroundImage,
            updatedAt: new Date().toISOString().split("T")[0],
          }
        : iface,
    );
    setInterfaces(updatedInterfaces);
    updateTVInterfaces(updatedInterfaces);
    setIsEditDialogOpen(false);
    setSelectedInterface(null);
    resetForm();
  };

  const handleDelete = (interfaceId: string) => {
    const newInterfaces = interfaces.filter(
      (iface) => iface.id !== interfaceId,
    );
    setInterfaces(newInterfaces);
    updateTVInterfaces(newInterfaces);
  };

  const handleToggleStatus = (interfaceId: string) => {
    const updatedInterfaces = interfaces.map((iface) =>
      iface.id === interfaceId
        ? {
            ...iface,
            isActive: !iface.isActive,
            updatedAt: new Date().toISOString().split("T")[0],
          }
        : iface,
    );
    setInterfaces(updatedInterfaces);
    updateTVInterfaces(updatedInterfaces);
  };

  const handleSetDefault = (interfaceId: string, type: TVInterface["type"]) => {
    const updatedInterfaces = interfaces.map((iface) => ({
      ...iface,
      isDefault: iface.id === interfaceId && iface.type === type,
      updatedAt:
        iface.id === interfaceId && iface.type === type
          ? new Date().toISOString().split("T")[0]
          : iface.updatedAt,
    }));
    setInterfaces(updatedInterfaces);
    updateTVInterfaces(updatedInterfaces);
  };

  const handleDuplicate = (iface: TVInterface) => {
    const duplicated: TVInterface = {
      ...iface,
      id: Date.now().toString(),
      name: `${iface.name} (копия)`,
      isDefault: false,
      usageCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    const newInterfaces = [...interfaces, duplicated];
    setInterfaces(newInterfaces);
    updateTVInterfaces(newInterfaces);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPositioningMode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    if (selectedElement && selectedInterface) {
      const updatedElement = {
        ...selectedElement,
        position: { x, y },
      };

      const updatedElements = selectedInterface.elements.map((el) =>
        el.id === selectedElement.id ? updatedElement : el,
      );

      const updatedInterface = {
        ...selectedInterface,
        elements: updatedElements,
        updatedAt: new Date().toISOString().split("T")[0],
      };

      const updatedInterfaces = interfaces.map((iface) =>
        iface.id === selectedInterface.id ? updatedInterface : iface,
      );

      setInterfaces(updatedInterfaces);
      updateTVInterfaces(updatedInterfaces);
      setSelectedInterface(updatedInterface);
      setSelectedElement(updatedElement);
    }

    setIsPositioningMode(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddElement = () => {
    if (!selectedInterface) return;

    const newElement: TVInterfaceElement = {
      id: Date.now().toString(),
      ...elementFormData,
      position: { x: 20, y: 20 },
      size: { width: 200, height: 80 },
      order: selectedInterface.elements.length + 1,
    };

    const updatedInterface = {
      ...selectedInterface,
      elements: [...selectedInterface.elements, newElement],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    const updatedInterfaces = interfaces.map((iface) =>
      iface.id === selectedInterface.id ? updatedInterface : iface,
    );

    setInterfaces(updatedInterfaces);
    updateTVInterfaces(updatedInterfaces);
    setSelectedInterface(updatedInterface);
    setIsElementDialogOpen(false);
    resetElementForm();
  };

  const handleEditElement = () => {
    if (!selectedInterface || !selectedElement) return;

    const updatedElement = {
      ...selectedElement,
      ...elementFormData,
    };

    const updatedElements = selectedInterface.elements.map((element) =>
      element.id === selectedElement.id ? updatedElement : element,
    );

    const updatedInterface = {
      ...selectedInterface,
      elements: updatedElements,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    const updatedInterfaces = interfaces.map((iface) =>
      iface.id === selectedInterface.id ? updatedInterface : iface,
    );

    setInterfaces(updatedInterfaces);
    updateTVInterfaces(updatedInterfaces);
    setSelectedInterface(updatedInterface);
    setIsElementDialogOpen(false);
    setSelectedElement(null);
    resetElementForm();
  };

  const handleDeleteElement = (elementId: string) => {
    if (!selectedInterface) return;

    const updatedElements = selectedInterface.elements.filter(
      (element) => element.id !== elementId,
    );

    const updatedInterface = {
      ...selectedInterface,
      elements: updatedElements,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    const updatedInterfaces = interfaces.map((iface) =>
      iface.id === selectedInterface.id ? updatedInterface : iface,
    );

    setInterfaces(updatedInterfaces);
    updateTVInterfaces(updatedInterfaces);
    setSelectedInterface(updatedInterface);
  };

  const renderDesigner = () => {
    if (!selectedInterface) return null;

    const currentBackground =
      backgroundImage || selectedInterface.backgroundImage;

    return (
      <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
        {/* Canvas Area */}
        <div className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Визуальный редактор</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={isPositioningMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsPositioningMode(!isPositioningMode)}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    {isPositioningMode
                      ? "Выход из режима"
                      : "Режим позиционирования"}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-full relative">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={450}
                  className="border border-gray-300 dark:border-gray-600 rounded cursor-crosshair mx-auto max-w-full h-auto"
                  style={{
                    backgroundImage: currentBackground
                      ? `url(${currentBackground})`
                      : "none",
                    backgroundColor: selectedInterface.backgroundColor,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                  onClick={handleCanvasClick}
                />

                {/* Render elements as overlays */}
                {selectedInterface.elements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute border-2 cursor-pointer hover:border-blue-500 ${
                      selectedElement?.id === element.id
                        ? "border-blue-500"
                        : "border-transparent"
                    }`}
                    style={{
                      left: `${(element.position.x / 800) * 100}%`,
                      top: `${(element.position.y / 450) * 100}%`,
                      width: `${(element.size.width / 800) * 100}%`,
                      height: `${(element.size.height / 450) * 100}%`,
                      backgroundColor: element.backgroundColor,
                      color: element.color,
                      borderRadius: `${element.borderRadius}px`,
                      opacity: element.opacity,
                      fontSize: `${element.fontSize}px`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElement(element);
                      setElementFormData({
                        type: element.type,
                        label: element.label,
                        icon: element.icon,
                        color: element.color,
                        backgroundColor: element.backgroundColor,
                        highlightArea: element.highlightArea || "",
                        action: element.action || "",
                        opacity: element.opacity,
                        borderRadius: element.borderRadius,
                        fontSize: element.fontSize,
                        animation: element.animation || "none",
                      });
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                      {element.label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Panel */}
        <div className="w-full lg:w-80 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Свойства интерфейса</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="interface-bg-color">Цвет фона</Label>
                <Input
                  id="interface-bg-color"
                  type="color"
                  value={selectedInterface.backgroundColor}
                  onChange={(e) => {
                    const updatedInterface = {
                      ...selectedInterface,
                      backgroundColor: e.target.value,
                    };
                    setSelectedInterface(updatedInterface);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="interface-bg-image">Фоновое изображение</Label>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {currentBackground
                    ? "Изменить изображение"
                    : "Загрузить изображение"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {selectedElement && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Свойства элемента</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="element-label">Название</Label>
                  <Input
                    id="element-label"
                    value={elementFormData.label}
                    onChange={(e) =>
                      setElementFormData({
                        ...elementFormData,
                        label: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="element-color">Цвет текста</Label>
                    <Input
                      id="element-color"
                      type="color"
                      value={elementFormData.color}
                      onChange={(e) =>
                        setElementFormData({
                          ...elementFormData,
                          color: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="element-bg-color">Цвет фона</Label>
                    <Input
                      id="element-bg-color"
                      type="color"
                      value={elementFormData.backgroundColor}
                      onChange={(e) =>
                        setElementFormData({
                          ...elementFormData,
                          backgroundColor: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="element-opacity">
                    Прозрачность: {Math.round(elementFormData.opacity * 100)}%
                  </Label>
                  <Slider
                    id="element-opacity"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[elementFormData.opacity]}
                    onValueChange={(value) =>
                      setElementFormData({
                        ...elementFormData,
                        opacity: value[0],
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="element-border-radius">
                    Скругление углов: {elementFormData.borderRadius}px
                  </Label>
                  <Slider
                    id="element-border-radius"
                    min={0}
                    max={50}
                    step={1}
                    value={[elementFormData.borderRadius]}
                    onValueChange={(value) =>
                      setElementFormData({
                        ...elementFormData,
                        borderRadius: value[0],
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="element-font-size">
                    Размер шрифта: {elementFormData.fontSize}px
                  </Label>
                  <Slider
                    id="element-font-size"
                    min={8}
                    max={32}
                    step={1}
                    value={[elementFormData.fontSize]}
                    onValueChange={(value) =>
                      setElementFormData({
                        ...elementFormData,
                        fontSize: value[0],
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="element-animation">Анимация</Label>
                  <Select
                    value={elementFormData.animation}
                    onValueChange={(value) =>
                      setElementFormData({
                        ...elementFormData,
                        animation: value as TVInterfaceElement["animation"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {animationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleEditElement}
                    size="sm"
                    className="flex-1"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Применить
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsPositioningMode(true)}
                    size="sm"
                  >
                    <Move className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteElement(selectedElement.id)}
                    size="sm"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Элементы ({selectedInterface.elements.length})
              </CardTitle>
              <Button
                onClick={() => openElementDialog()}
                size="sm"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить элемент
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedInterface.elements
                  .sort((a, b) => a.order - b.order)
                  .map((element) => (
                    <div
                      key={element.id}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        selectedElement?.id === element.id
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "bg-gray-50 dark:bg-gray-800"
                      }`}
                      onClick={() => setSelectedElement(element)}
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {element.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {element.type}
                        </div>
                      </div>
                      <MousePointer className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                {selectedInterface.elements.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    Нет элементов
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const openEditDialog = (iface: TVInterface) => {
    setSelectedInterface(iface);
    setFormData({
      name: iface.name,
      type: iface.type,
      description: iface.description,
      backgroundColor: iface.backgroundColor,
    });
    setBackgroundImage(iface.backgroundImage || null);
    setIsEditDialogOpen(true);
  };

  const openDesigner = (iface: TVInterface) => {
    setSelectedInterface(iface);
    setBackgroundImage(iface.backgroundImage || null);
    setIsDesignerOpen(true);
    setSelectedElement(null);
  };

  const openElementDialog = (element?: TVInterfaceElement) => {
    if (element) {
      setSelectedElement(element);
      setElementFormData({
        type: element.type,
        label: element.label,
        icon: element.icon,
        color: element.color,
        backgroundColor: element.backgroundColor,
        highlightArea: element.highlightArea || "",
        action: element.action || "",
        opacity: element.opacity,
        borderRadius: element.borderRadius,
        fontSize: element.fontSize,
        animation: element.animation || "none",
      });
    } else {
      setSelectedElement(null);
      resetElementForm();
    }
    setIsElementDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "custom",
      description: "",
      backgroundColor: "#1f2937",
    });
    setBackgroundImage(null);
  };

  const resetElementForm = () => {
    setElementFormData({
      type: "menu-item",
      label: "",
      icon: "Home",
      color: "#ffffff",
      backgroundColor: "#374151",
      highlightArea: "",
      action: "",
      opacity: 1,
      borderRadius: 8,
      fontSize: 14,
      animation: "none",
    });
  };

  const getTypeLabel = (type: string) => {
    return interfaceTypes.find((t) => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Конструктор интерфейса ТВ
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Профессиональное создание интерфейсов ТВ-приставки с визуальным
            редактором
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Импорт
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Создать интерфейс
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать новый интерфейс</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Название</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Введите название интерфейса"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Тип интерфейса</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        type: value as TVInterface["type"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {interfaceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center">
                            <span className="mr-2">{type.icon}</span>
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Введите описание интерфейса"
                  />
                </div>

                <div>
                  <Label htmlFor="backgroundColor">Цвет фона</Label>
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        backgroundColor: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="bg-image-upload">Фоновое изображение</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {backgroundImage
                      ? "Изменить изображение"
                      : "Загрузить изображение"}
                  </Button>
                  {backgroundImage && (
                    <div className="mt-2">
                      <img
                        src={backgroundImage}
                        alt="Предварительный просмотр"
                        className="w-full h-32 object-cover bg-gray-100 dark:bg-gray-800 rounded"
                      />
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button onClick={handleCreate} disabled={!formData.name}>
                    Создать
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Monitor className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск интерфейсов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Тип интерфейса" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  {interfaceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Designer Dialog */}
      <Dialog open={isDesignerOpen} onOpenChange={setIsDesignerOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Визуальный редактор: {selectedInterface?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">{renderDesigner()}</div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsDesignerOpen(false)}>
              Закрыть
            </Button>
            <Button
              onClick={() => {
                // Save interface changes
                if (selectedInterface) {
                  const updatedInterfaces = interfaces.map((iface) =>
                    iface.id === selectedInterface.id
                      ? {
                          ...selectedInterface,
                          backgroundImage:
                            backgroundImage ||
                            selectedInterface.backgroundImage,
                        }
                      : iface,
                  );
                  setInterfaces(updatedInterfaces);
                  updateTVInterfaces(updatedInterfaces);
                }
                setIsDesignerOpen(false);
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Сохранить изменения
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Interfaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredInterfaces.map((iface) => (
          <Card
            key={iface.id}
            className="group hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{iface.name}</CardTitle>
                <div className="flex items-center space-x-1">
                  {iface.isDefault && (
                    <Badge variant="default">По умолчанию</Badge>
                  )}
                  <Badge variant={iface.isActive ? "default" : "secondary"}>
                    {iface.isActive ? "Активный" : "Неактивный"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* TV Preview */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 relative overflow-hidden">
                  <div
                    className="w-full h-32 rounded"
                    style={{
                      backgroundColor: iface.backgroundColor,
                      backgroundImage: iface.backgroundImage
                        ? `url(${iface.backgroundImage})`
                        : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Mini preview of elements */}
                    {iface.elements.slice(0, 3).map((element, index) => (
                      <div
                        key={element.id}
                        className="absolute rounded"
                        style={{
                          left: `${(element.position.x / 800) * 100}%`,
                          top: `${(element.position.y / 450) * 100}%`,
                          width: `${Math.min((element.size.width / 800) * 100, 20)}%`,
                          height: `${Math.min((element.size.height / 450) * 100, 15)}%`,
                          backgroundColor: element.backgroundColor,
                          opacity: 0.8,
                        }}
                      />
                    ))}
                  </div>
                  <Badge className="absolute top-2 right-2" variant="outline">
                    {iface.elements.length} элементов
                  </Badge>
                </div>

                {/* Interface Info */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Тип:
                    </span>
                    <span className="font-medium">
                      {getTypeLabel(iface.type)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Элементов:
                    </span>
                    <span className="font-medium">{iface.elements.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Использований:
                    </span>
                    <span className="font-medium">{iface.usageCount}</span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {iface.description}
                </p>

                {/* Actions */}
                <div className="flex justify-between items-center pt-2">
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDesigner(iface)}
                      title="Визуальный редактор"
                    >
                      <Palette className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(iface)}
                      title="Редактировать"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(iface)}
                      title="Дублировать"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(iface.id)}
                      >
                        {iface.isActive ? "Деактивировать" : "Активировать"}
                      </DropdownMenuItem>
                      {!iface.isDefault && (
                        <DropdownMenuItem
                          onClick={() => handleSetDefault(iface.id, iface.type)}
                        >
                          Сделать по умолчанию
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Экспортировать
                      </DropdownMenuItem>
                      {!iface.isDefault && (
                        <DropdownMenuItem
                          onClick={() => handleDelete(iface.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Element Dialog */}
      <Dialog open={isElementDialogOpen} onOpenChange={setIsElementDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedElement ? "Редактировать элемент" : "Добавить элемент"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="element-type">Тип элемента</Label>
              <Select
                value={elementFormData.type}
                onValueChange={(value) =>
                  setElementFormData({
                    ...elementFormData,
                    type: value as TVInterfaceElement["type"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {elementTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="element-label">Название</Label>
              <Input
                id="element-label"
                value={elementFormData.label}
                onChange={(e) =>
                  setElementFormData({
                    ...elementFormData,
                    label: e.target.value,
                  })
                }
                placeholder="Название элемента"
              />
            </div>

            <div>
              <Label htmlFor="element-icon">Иконка</Label>
              <Select
                value={elementFormData.icon}
                onValueChange={(value) =>
                  setElementFormData({ ...elementFormData, icon: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="element-color">Цвет текста</Label>
                <Input
                  id="element-color"
                  type="color"
                  value={elementFormData.color}
                  onChange={(e) =>
                    setElementFormData({
                      ...elementFormData,
                      color: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="element-backgroundColor">Цвет фона</Label>
                <Input
                  id="element-backgroundColor"
                  type="color"
                  value={elementFormData.backgroundColor}
                  onChange={(e) =>
                    setElementFormData({
                      ...elementFormData,
                      backgroundColor: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsElementDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button
                onClick={selectedElement ? handleEditElement : handleAddElement}
                disabled={!elementFormData.label}
              >
                {selectedElement ? "Сохранить" : "Добавить"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Interface Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать интерфейс</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Название</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Введите название интерфейса"
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Описание</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Введите описание интерфейса"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button onClick={handleEdit} disabled={!formData.name}>
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {filteredInterfaces.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Интерфейсы не найдены
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Попробуйте изменить фильтры поиска или создайте новый интерфейс.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TVInterfaceBuilder;
