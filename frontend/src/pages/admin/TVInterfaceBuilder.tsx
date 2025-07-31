import { useState, useRef, useEffect } from "react";
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
  Upload,
  Download,
  Copy,
  Eye,
  MoreVertical,
  Monitor,
  Palette,
  Settings,
  ImageIcon,
  Target,
  Save,
  MousePointer,
  Crosshair,
  AlertTriangle,
  Filter,
  X,
  Home,
  Grid3X3,
  PlayCircle,
  Layers,
  Move,
  Square,
  Circle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { useData } from "@/contexts/DataContext";
import { tvInterfacesAPI, TVInterfaceAPI, ClickableArea, HighlightArea } from "@/api/tvInterfaces";

// Интерфейсы для элементов
interface TVInterfaceElement extends ClickableArea {
  type: 'clickable';
}

interface TVInterfaceHighlight extends HighlightArea {
  type: 'highlight';
}

type InterfaceElement = TVInterfaceElement | TVInterfaceHighlight;

const TVInterfaceBuilder = () => {
  const { getActiveDevices, getDeviceById } = useData();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Состояние компонента
  const [tvInterfaces, setTVInterfaces] = useState<TVInterfaceAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterface, setSelectedInterface] = useState<TVInterfaceAPI | null>(null);
  const [selectedElement, setSelectedElement] = useState<InterfaceElement | null>(null);
  
  // Состояние диалогов
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditorDialogOpen, setIsEditorDialogOpen] = useState(false);
  
  // Состояние фильтров
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDevice, setFilterDevice] = useState<string>("all");

  // Состояние редактора
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isCreatingElement, setIsCreatingElement] = useState(false);
  const [elementCreationType, setElementCreationType] = useState<'clickable' | 'highlight'>('clickable');
  const [currentImageFile, setCurrentImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isPickingMode, setIsPickingMode] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);

  // Данные форм
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "custom" as TVInterfaceAPI['type'],
    device_id: "",
    responsive: false,
  });

  const [elementFormData, setElementFormData] = useState({
    name: "",
    action: "",
    shape: "rectangle" as ClickableArea['shape'],
    color: "#3b82f6",
    opacity: 0.7,
    animation: "none" as HighlightArea['animation'],
  });

  const devices = getActiveDevices();

  const interfaceTypes = [
    { value: "home", label: "Главное меню", icon: Home },
    { value: "settings", label: "Настройки", icon: Settings },
    { value: "channels", label: "Каналы", icon: PlayCircle },
    { value: "apps", label: "Приложения", icon: Grid3X3 },
    { value: "guide", label: "��рограмма передач", icon: Layers },
    { value: "no-signal", label: "Нет сигнала", icon: Monitor },
    { value: "error", label: "Ошибка", icon: AlertTriangle },
    { value: "custom", label: "Пользовательский", icon: Settings },
  ];

  const elementShapes = [
    { value: "rectangle", label: "Прямоугольник", icon: Square },
    { value: "circle", label: "Круг", icon: Circle },
    { value: "polygon", label: "Многоугольник", icon: Target },
  ];

  const animations = [
    { value: "none", label: "Без анимации" },
    { value: "pulse", label: "Пульсация" },
    { value: "glow", label: "Свечение" },
    { value: "blink", label: "Мига��ие" },
  ];

  const actionTypes = [
    "navigate",
    "click",
    "select",
    "confirm",
    "back",
    "home",
    "menu",
    "info",
    "exit",
    "settings",
    "volume-up",
    "volume-down",
    "mute",
    "channel-up",
    "channel-down",
    "play",
    "pause",
    "stop",
    "record",
    "fast-forward",
    "rewind",
  ];

  // Загрузка данных
  useEffect(() => {
    loadTVInterfaces();
  }, []);

  const loadTVInterfaces = async () => {
    try {
      setLoading(true);
      console.log('Loading TV interfaces...');
      console.log('API Base URL being used:', import.meta.env.VITE_API_BASE_URL || 'default');

      // Добавляем простую проверку доступности API
      try {
        const testResponse = await fetch('/api/health');
        console.log('API health check:', testResponse.status, testResponse.statusText);
      } catch (healthError) {
        console.warn('API health check failed:', healthError);
      }

      const response = await tvInterfacesAPI.getAll({ limit: 100 });
      console.log('TV interfaces response:', response);

      if (response && response.success && response.data) {
        setTVInterfaces(response.data);
        console.log('Successfully loaded', response.data.length, 'TV interfaces');
      } else {
        console.warn('Invalid response format:', response);
        setTVInterfaces([]);
      }
    } catch (error) {
      console.error("Error loading TV interfaces:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
      console.error("Error stack:", error instanceof Error ? error.stack : 'N/A');

      // Fallback - создаем пустой массив чтобы интерфейс работал
      setTVInterfaces([]);

      // Показываем уведомление пользователю
      alert('Не удалось загрузить интерфейсы ТВ. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация интерфейсов
  const filteredInterfaces = tvInterfaces.filter((iface) => {
    const matchesSearch =
      iface.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iface.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || iface.type === filterType;
    const matchesDevice = 
      filterDevice === "all" || 
      iface.device_id === filterDevice ||
      (filterDevice === "universal" && !iface.device_id);
    return matchesSearch && matchesType && matchesDevice;
  });

  // Обработчики событий
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCurrentImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    try {
      console.log('Creating TV interface with data:', {
        ...formData,
        device_id: formData.device_id === "universal" ? undefined : formData.device_id,
        screenshot_data: previewImageUrl ? 'base64_image_data' : undefined,
      });

      const newInterface = await tvInterfacesAPI.create({
        ...formData,
        device_id: formData.device_id === "universal" ? undefined : formData.device_id,
        screenshot_data: previewImageUrl || undefined,
      });

      console.log('TV interface creation response:', newInterface);

      if (newInterface.success && newInterface.data) {
        setTVInterfaces(prev => [...prev, newInterface.data!]);
        setIsCreateDialogOpen(false);
        resetForm();
        console.log('TV interface created successfully');
      } else {
        console.error('Invalid response from create API:', newInterface);
      }
    } catch (error) {
      console.error("Error creating TV interface:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
        console.error("Error stack:", error.stack);
      }
    }
  };

  const handleEdit = async () => {
    if (!selectedInterface) return;

    try {
      const updatedInterface = await tvInterfacesAPI.update(selectedInterface.id, {
        ...formData,
        device_id: formData.device_id === "universal" ? undefined : formData.device_id,
        screenshot_data: previewImageUrl || selectedInterface.screenshot_data,
      });

      if (updatedInterface.success && updatedInterface.data) {
        setTVInterfaces(prev => 
          prev.map(iface => 
            iface.id === selectedInterface.id ? updatedInterface.data! : iface
          )
        );
        setIsEditDialogOpen(false);
        setSelectedInterface(null);
        resetForm();
      }
    } catch (error) {
      console.error("Error updating TV interface:", error);
    }
  };

  const handleDelete = async (interfaceId: string) => {
    try {
      const result = await tvInterfacesAPI.delete(interfaceId);
      if (result.success) {
        setTVInterfaces(prev => prev.filter(iface => iface.id !== interfaceId));
      }
    } catch (error) {
      console.error("Error deleting TV interface:", error);
      alert("Ошибка при удалении интерфейса");
    }
  };

  const handleToggleStatus = async (interfaceId: string) => {
    try {
      const result = await tvInterfacesAPI.toggleStatus(interfaceId);
      if (result.success && result.data) {
        setTVInterfaces(prev => 
          prev.map(iface => 
            iface.id === interfaceId ? result.data! : iface
          )
        );
      }
    } catch (error) {
      console.error("Error toggling interface status:", error);
    }
  };

  const handleDuplicate = async (iface: TVInterfaceAPI) => {
    try {
      const result = await tvInterfacesAPI.duplicate(iface.id, `${iface.name} (копия)`);
      if (result.success && result.data) {
        setTVInterfaces(prev => [...prev, result.data!]);
      }
    } catch (error) {
      console.error("Error duplicating TV interface:", error);
    }
  };

  // Обработчики редактора
  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    setCursorPosition({ x, y });
  };

  const handleCanvasClick = async (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCreatingElement || !canvasRef.current || !selectedInterface) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const newElement: ClickableArea | HighlightArea = elementCreationType === 'clickable' 
      ? {
          id: `clickable_${Date.now()}`,
          name: elementFormData.name || "Новая область",
          position: { x, y },
          size: { width: 100, height: 50 },
          shape: elementFormData.shape,
          action: elementFormData.action || "click",
        }
      : {
          id: `highlight_${Date.now()}`,
          name: elementFormData.name || "Область подсветки",
          position: { x, y },
          size: { width: 100, height: 50 },
          color: elementFormData.color,
          opacity: elementFormData.opacity,
          animation: elementFormData.animation,
        };

    try {
      const updateData = elementCreationType === 'clickable'
        ? {
            clickable_areas: [...selectedInterface.clickable_areas, newElement as ClickableArea]
          }
        : {
            highlight_areas: [...selectedInterface.highlight_areas, newElement as HighlightArea]
          };

      const result = await tvInterfacesAPI.update(selectedInterface.id, updateData);
      
      if (result.success && result.data) {
        setSelectedInterface(result.data);
        setTVInterfaces(prev => 
          prev.map(iface => 
            iface.id === selectedInterface.id ? result.data! : iface
          )
        );
      }
    } catch (error) {
      console.error("Error adding element:", error);
    }

    setIsCreatingElement(false);
    resetElementForm();
  };

  const handleElementEdit = (element: ClickableArea | HighlightArea, type: 'clickable' | 'highlight') => {
    const elementWithType = { ...element, type } as InterfaceElement;
    setSelectedElement(elementWithType);
    
    if (type === 'clickable') {
      const clickableElement = element as ClickableArea;
      setElementFormData({
        name: clickableElement.name,
        action: clickableElement.action,
        shape: clickableElement.shape,
        color: elementFormData.color,
        opacity: elementFormData.opacity,
        animation: elementFormData.animation,
      });
    } else {
      const highlightElement = element as HighlightArea;
      setElementFormData({
        name: highlightElement.name,
        action: elementFormData.action,
        shape: elementFormData.shape,
        color: highlightElement.color,
        opacity: highlightElement.opacity,
        animation: highlightElement.animation || "none",
      });
    }
  };

  const handleElementUpdate = async () => {
    if (!selectedElement || !selectedInterface) return;

    try {
      let updateData: any = {};

      if (selectedElement.type === 'clickable') {
        const updatedElement = {
          ...selectedElement,
          name: elementFormData.name,
          action: elementFormData.action,
          shape: elementFormData.shape,
        };

        updateData.clickable_areas = selectedInterface.clickable_areas.map(el =>
          el.id === selectedElement.id ? updatedElement : el
        );
      } else {
        const updatedElement = {
          ...selectedElement,
          name: elementFormData.name,
          color: elementFormData.color,
          opacity: elementFormData.opacity,
          animation: elementFormData.animation,
        };

        updateData.highlight_areas = selectedInterface.highlight_areas.map(el =>
          el.id === selectedElement.id ? updatedElement : el
        );
      }

      const result = await tvInterfacesAPI.update(selectedInterface.id, updateData);
      
      if (result.success && result.data) {
        setSelectedInterface(result.data);
        setTVInterfaces(prev => 
          prev.map(iface => 
            iface.id === selectedInterface.id ? result.data! : iface
          )
        );
        setSelectedElement(null);
        resetElementForm();
      }
    } catch (error) {
      console.error("Error updating element:", error);
    }
  };

  const handleElementDelete = async (elementId: string, type: 'clickable' | 'highlight') => {
    if (!selectedInterface) return;

    try {
      let updateData: any = {};

      if (type === 'clickable') {
        updateData.clickable_areas = selectedInterface.clickable_areas.filter(el => el.id !== elementId);
      } else {
        updateData.highlight_areas = selectedInterface.highlight_areas.filter(el => el.id !== elementId);
      }

      const result = await tvInterfacesAPI.update(selectedInterface.id, updateData);
      
      if (result.success && result.data) {
        setSelectedInterface(result.data);
        setTVInterfaces(prev => 
          prev.map(iface => 
            iface.id === selectedInterface.id ? result.data! : iface
          )
        );
      }
    } catch (error) {
      console.error("Error deleting element:", error);
    }
  };

  // Диалоги
  const openEditDialog = (iface: TVInterfaceAPI) => {
    setSelectedInterface(iface);
    setFormData({
      name: iface.name,
      description: iface.description,
      type: iface.type,
      device_id: iface.device_id || "universal",
      responsive: iface.responsive,
    });
    setPreviewImageUrl(iface.screenshot_data || null);
    setIsEditDialogOpen(true);
  };

  const openEditorDialog = (iface: TVInterfaceAPI) => {
    setSelectedInterface(iface);
    setPreviewImageUrl(iface.screenshot_data || null);
    setIsEditorDialogOpen(true);
    setIsEditingMode(false);
    setSelectedElement(null);
    setIsPickingMode(false);
  };

  // Сброс форм
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "custom",
      device_id: "",
      responsive: false,
    });
    setPreviewImageUrl(null);
    setCurrentImageFile(null);
  };

  const resetElementForm = () => {
    setElementFormData({
      name: "",
      action: "",
      shape: "rectangle",
      color: "#3b82f6",
      opacity: 0.7,
      animation: "none",
    });
  };

  // Сохранение изменений редактора
  const saveInterfaceChanges = async () => {
    if (!selectedInterface) return;

    try {
      const updateData = {
        screenshot_data: previewImageUrl || selectedInterface.screenshot_data,
      };

      const result = await tvInterfacesAPI.update(selectedInterface.id, updateData);
      
      if (result.success && result.data) {
        setTVInterfaces(prev => 
          prev.map(iface => 
            iface.id === selectedInterface.id ? result.data! : iface
          )
        );
        setIsEditorDialogOpen(false);
      }
    } catch (error) {
      console.error("Error saving interface changes:", error);
    }
  };

  // Рендер редактора
  const renderInterfaceEditor = () => {
    if (!selectedInterface) return null;

    const allElements = [
      ...selectedInterface.clickable_areas.map(el => ({ ...el, type: 'clickable' as const })),
      ...selectedInterface.highlight_areas.map(el => ({ ...el, type: 'highlight' as const }))
    ];

    return (
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Canvas Area */}
        <div className="flex-1">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              className={`border border-gray-300 dark:border-gray-600 rounded mx-auto ${
                isCreatingElement ? "cursor-crosshair" : "cursor-default"
              }`}
              style={{
                backgroundImage: previewImageUrl
                  ? `url(${previewImageUrl})`
                  : "none",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundColor: previewImageUrl ? "transparent" : "#f3f4f6",
              }}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
            />

            {/* Курсор */}
            {isCreatingElement && cursorPosition && (
              <div
                className="absolute bg-blue-500 text-white px-2 py-1 rounded text-xs pointer-events-none"
                style={{
                  left: `${(cursorPosition.x / 800) * 100}%`,
                  top: `${(cursorPosition.y / 450) * 100 + 10}%`,
                  transform: "translateX(-50%)",
                }}
              >
                {Math.round(cursorPosition.x)}, {Math.round(cursorPosition.y)}
              </div>
            )}

            {/* Рендер элементов */}
            {allElements.map((element) => (
              <div
                key={element.id}
                className={`absolute border-2 cursor-pointer hover:border-blue-700 transition-colors ${
                  selectedElement?.id === element.id ? "border-blue-500" : 
                  element.type === 'clickable' ? "border-green-500" : "border-orange-500"
                }`}
                style={{
                  left: `${(element.position.x / 800) * 100}%`,
                  top: `${(element.position.y / 450) * 100}%`,
                  width: `${(element.size.width / 800) * 100}%`,
                  height: `${(element.size.height / 450) * 100}%`,
                  backgroundColor: element.type === 'highlight' 
                    ? (element as HighlightArea).color + Math.round((element as HighlightArea).opacity * 255).toString(16).padStart(2, '0')
                    : "rgba(34, 197, 94, 0.3)",
                  borderRadius: (element as ClickableArea).shape === "circle" ? "50%" : "4px",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleElementEdit(element, element.type);
                }}
              >
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                  {element.name}
                </span>
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${
                  element.type === 'clickable' ? 'bg-green-500' : 'bg-orange-500'
                }`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-full lg:w-80 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Управление
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant={isCreatingElement && elementCreationType === 'clickable' ? "default" : "outline"}
                  onClick={() => {
                    setIsCreatingElement(!isCreatingElement || elementCreationType !== 'clickable');
                    setElementCreationType('clickable');
                    setSelectedElement(null);
                  }}
                  className="w-full"
                >
                  <Crosshair className="h-4 w-4 mr-2" />
                  {isCreatingElement && elementCreationType === 'clickable' ? "Отменить" : "Интерактивная область"}
                </Button>
                <Button
                  variant={isCreatingElement && elementCreationType === 'highlight' ? "default" : "outline"}
                  onClick={() => {
                    setIsCreatingElement(!isCreatingElement || elementCreationType !== 'highlight');
                    setElementCreationType('highlight');
                    setSelectedElement(null);
                  }}
                  className="w-full"
                >
                  <Target className="h-4 w-4 mr-2" />
                  {isCreatingElement && elementCreationType === 'highlight' ? "Отменить" : "Область подсветки"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Изображение
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {isCreatingElement && (
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <Crosshair className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-3">
                      <p className="text-sm">
                        Кликните на изображение для создания {elementCreationType === 'clickable' ? 'интерактивной области' : 'области подсветки'}
                      </p>
                      <div>
                        <Label htmlFor="element-name">Название</Label>
                        <Input
                          id="element-name"
                          value={elementFormData.name}
                          onChange={(e) =>
                            setElementFormData({
                              ...elementFormData,
                              name: e.target.value,
                            })
                          }
                          placeholder="Название области"
                        />
                      </div>
                      {elementCreationType === 'clickable' && (
                        <div>
                          <Label htmlFor="element-action">Действие</Label>
                          <Select
                            value={elementFormData.action}
                            onValueChange={(value) =>
                              setElementFormData({
                                ...elementFormData,
                                action: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите действие" />
                            </SelectTrigger>
                            <SelectContent>
                              {actionTypes.map((action) => (
                                <SelectItem key={action} value={action}>
                                  {action}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {elementCreationType === 'highlight' && (
                        <>
                          <div>
                            <Label htmlFor="element-color">Цвет</Label>
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
                        </>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {selectedElement && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <Edit className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-3">
                      <p className="text-sm font-medium">
                        Редактирование: {selectedElement.name}
                      </p>
                      <div>
                        <Label htmlFor="edit-element-name">Название</Label>
                        <Input
                          id="edit-element-name"
                          value={elementFormData.name}
                          onChange={(e) =>
                            setElementFormData({
                              ...elementFormData,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      
                      {selectedElement.type === 'clickable' && (
                        <div>
                          <Label htmlFor="edit-element-action">Действие</Label>
                          <Select
                            value={elementFormData.action}
                            onValueChange={(value) =>
                              setElementFormData({
                                ...elementFormData,
                                action: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {actionTypes.map((action) => (
                                <SelectItem key={action} value={action}>
                                  {action}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {selectedElement.type === 'highlight' && (
                        <>
                          <div>
                            <Label htmlFor="edit-element-color">Цвет</Label>
                            <Input
                              id="edit-element-color"
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
                            <Label htmlFor="edit-element-opacity">
                              Прозрачность: {Math.round(elementFormData.opacity * 100)}%
                            </Label>
                            <Slider
                              id="edit-element-opacity"
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
                            <Label htmlFor="edit-element-animation">Анимация</Label>
                            <Select
                              value={elementFormData.animation}
                              onValueChange={(value) =>
                                setElementFormData({
                                  ...elementFormData,
                                  animation: value as HighlightArea['animation'],
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {animations.map((anim) => (
                                  <SelectItem key={anim.value} value={anim.value}>
                                    {anim.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <Button onClick={handleElementUpdate} size="sm">
                          <Save className="h-3 w-3 mr-1" />
                          Сохранить
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleElementDelete(selectedElement.id, selectedElement.type)}
                          size="sm"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Elements List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Элементы ({allElements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {allElements.map((element) => (
                  <div
                    key={element.id}
                    className={`flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      selectedElement?.id === element.id
                        ? "ring-2 ring-blue-500"
                        : ""
                    }`}
                    onClick={() => handleElementEdit(element, element.type)}
                  >
                    <div>
                      <div className="font-medium text-sm">{element.name}</div>
                      <div className="text-xs text-gray-500">
                        {element.type === 'clickable' ? `Действие: ${(element as ClickableArea).action}` : 'Подсветка'}
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      element.type === 'clickable' ? 'bg-green-500' : 'bg-orange-500'
                    }`}></div>
                  </div>
                ))}
                {allElements.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Нет элементов</p>
                    <p className="text-xs">
                      Добавьте интерактивные области или подсветку
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Monitor className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Загрузка интерфейсов ТВ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Конструктор интерфейса ТВ
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            ��оздание и настройка интерактивных интерфейсов ТВ-приставок с привязкой к устройствам
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
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Создать новый интерфейс ТВ</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                          type: value as TVInterfaceAPI['type'],
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
                              <type.icon className="h-4 w-4 mr-2" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="device">Приставка</Label>
                  <Select
                    value={formData.device_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, device_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите приставку" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="universal">Универсальный</SelectItem>
                      {devices.map((device) => (
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
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Введите описание интерфейса"
                  />
                </div>

                <div>
                  <Label htmlFor="image-upload">Скриншот интерфейса</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {previewImageUrl
                        ? "Изменить изображение"
                        : "Загрузить изображение"}
                    </Button>
                  </div>
                  {previewImageUrl && (
                    <div className="mt-2">
                      <img
                        src={previewImageUrl}
                        alt="Предварительный просмотр"
                        className="w-full h-32 object-contain bg-gray-100 dark:bg-gray-800 rounded"
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
            <div className="flex gap-2">
              <Select value={filterDevice} onValueChange={setFilterDevice}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Приставка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все приставки</SelectItem>
                  <SelectItem value="universal">Ун��версальные</SelectItem>
                  {devices.map((device) => (
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
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Тип" />
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

      {/* Interfaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInterfaces.map((iface) => {
          const device = iface.device_id
            ? getDeviceById(iface.device_id)
            : null;
          const totalElements = iface.clickable_areas.length + iface.highlight_areas.length;

          return (
            <Card key={iface.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{iface.name}</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Badge variant={iface.is_active ? "default" : "secondary"}>
                      {iface.is_active ? "Активный" : "Неактивный"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Device Badge */}
                  {device && (
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <Badge
                        variant="outline"
                        className={`bg-gradient-to-r ${device.color} text-white`}
                      >
                        {device.name}
                      </Badge>
                    </div>
                  )}

                  {/* Interface Preview */}
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-48 flex items-center justify-center relative">
                    {iface.screenshot_data ? (
                      <img
                        src={iface.screenshot_data}
                        alt={iface.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <Monitor className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Нет изображения</p>
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2" variant="outline">
                      {totalElements} элементов
                    </Badge>
                  </div>

                  {/* Interface Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Тип:
                      </span>
                      <span className="font-medium">
                        {interfaceTypes.find((t) => t.value === iface.type)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Интерактивных областей:
                      </span>
                      <span className="font-medium">{iface.clickable_areas.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Областей подсветки:
                      </span>
                      <span className="font-medium">{iface.highlight_areas.length}</span>
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
                        onClick={() => openEditorDialog(iface)}
                      >
                        <Palette className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(iface)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicate(iface)}
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
                          {iface.is_active ? "Деактивировать" : "Активировать"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Экспортировать
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(iface.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Interface Editor Dialog */}
      <Dialog open={isEditorDialogOpen} onOpenChange={setIsEditorDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crosshair className="h-5 w-5" />
              Интерактивный редактор: {selectedInterface?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">{renderInterfaceEditor()}</div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditorDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={saveInterfaceChanges}>
              <Save className="h-4 w-4 mr-2" />
              Сохранить изменения
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать интерфейс ТВ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="edit-type">Тип интерфейса</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      type: value as TVInterfaceAPI['type'],
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
                          <type.icon className="h-4 w-4 mr-2" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-device">Приставка</Label>
              <Select
                value={formData.device_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, device_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите приставку" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="universal">Универсальный</SelectItem>
                  {devices.map((device) => (
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

            <div>
              <Label htmlFor="edit-image-upload">Скриншот интерфейса</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {previewImageUrl
                    ? "Изменить изображение"
                    : "Загрузить изображение"}
                </Button>
              </div>
              {previewImageUrl && (
                <div className="mt-2">
                  <img
                    src={previewImageUrl}
                    alt="Предварительный просмотр"
                    className="w-full h-32 object-contain bg-gray-100 dark:bg-gray-800 rounded"
                  />
                </div>
              )}
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
