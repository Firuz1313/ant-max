import { APIResponse, PaginatedResponse } from '@/types';
import { apiClient } from './client';

// Типы для API ТВ интерфейсов
export interface TVInterfaceAPI {
  id: string;
  device_id?: string;
  name: string;
  description: string;
  type: 'home' | 'settings' | 'channels' | 'apps' | 'guide' | 'no-signal' | 'error' | 'custom';
  screenshot_url?: string;
  screenshot_data?: string; // base64
  svg_overlay?: string;
  clickable_areas: ClickableArea[];
  highlight_areas: HighlightArea[];
  responsive: boolean;
  breakpoints?: Record<string, any>;
  is_active: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  device?: {
    id: string;
    name: string;
    brand: string;
    model: string;
    color: string;
  };
  usage_stats?: {
    session_count: number;
    step_count: number;
    success_rate: number;
  };
}

export interface ClickableArea {
  id: string;
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  shape: 'rectangle' | 'circle' | 'polygon';
  action: string;
  coordinates?: number[]; // for polygon shapes
}

export interface HighlightArea {
  id: string;
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  opacity: number;
  animation?: 'pulse' | 'glow' | 'blink' | 'none';
  duration?: number;
}

export interface CreateTVInterfaceData {
  name: string;
  description?: string;
  type: TVInterfaceAPI['type'];
  device_id?: string;
  screenshot_url?: string;
  screenshot_data?: string;
  svg_overlay?: string;
  clickable_areas?: ClickableArea[];
  highlight_areas?: HighlightArea[];
  responsive?: boolean;
  breakpoints?: Record<string, any>;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateTVInterfaceData extends Partial<CreateTVInterfaceData> {}

export interface TVInterfaceFilters {
  device_id?: string;
  type?: string;
  search?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

export interface TVInterfaceExportData {
  version: string;
  type: string;
  data: TVInterfaceAPI;
  exported_at: string;
}

// API функции для работы с ТВ интерфейсами
export const tvInterfacesAPI = {
  // Получение списка всех интерфейсов ТВ
  async getAll(filters: TVInterfaceFilters = {}): Promise<PaginatedResponse<TVInterfaceAPI[]>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/tv-interfaces?${params.toString()}`);
    return response.data;
  },

  // Получение интерфейса ТВ по ID
  async getById(id: string): Promise<APIResponse<TVInterfaceAPI>> {
    const response = await apiClient.get(`/tv-interfaces/${id}`);
    return response.data;
  },

  // Создание нового интерфейса ТВ
  async create(data: CreateTVInterfaceData): Promise<APIResponse<TVInterfaceAPI>> {
    const response = await apiClient.post('/tv-interfaces', data);
    return response.data;
  },

  // Обновление интерфейса ТВ
  async update(id: string, data: UpdateTVInterfaceData): Promise<APIResponse<TVInterfaceAPI>> {
    const response = await apiClient.put(`/tv-interfaces/${id}`, data);
    return response.data;
  },

  // Удаление интерфейса ТВ
  async delete(id: string): Promise<APIResponse<void>> {
    const response = await apiClient.delete(`/tv-interfaces/${id}`);
    return response.data;
  },

  // Дублирование интерфейса ТВ
  async duplicate(id: string, name?: string): Promise<APIResponse<TVInterfaceAPI>> {
    const response = await apiClient.post(`/tv-interfaces/${id}/duplicate`, { name });
    return response.data;
  },

  // Активация/деактивация интерфейса ТВ
  async toggleStatus(id: string): Promise<APIResponse<TVInterfaceAPI>> {
    const response = await apiClient.patch(`/tv-interfaces/${id}/toggle`);
    return response.data;
  },

  // Получение интерфейсов по устройству
  async getByDevice(deviceId: string): Promise<APIResponse<TVInterfaceAPI[]>> {
    const response = await apiClient.get(`/tv-interfaces/device/${deviceId}`);
    return response.data;
  },

  // Получение интерфейсов по типу
  async getByType(type: TVInterfaceAPI['type']): Promise<APIResponse<TVInterfaceAPI[]>> {
    const response = await apiClient.get(`/tv-interfaces/type/${type}`);
    return response.data;
  },

  // Экспорт интерфейса в JSON
  async export(id: string): Promise<TVInterfaceExportData> {
    const response = await apiClient.get(`/tv-interfaces/${id}/export`);
    return response.data;
  },

  // Импорт интерфейса из JSON
  async import(data: TVInterfaceExportData): Promise<APIResponse<TVInterfaceAPI>> {
    const response = await apiClient.post('/tv-interfaces/import', data);
    return response.data;
  },

  // Поиск интерфейсов
  async search(query: string, filters: Omit<TVInterfaceFilters, 'search'> = {}): Promise<PaginatedResponse<TVInterfaceAPI[]>> {
    return this.getAll({ ...filters, search: query });
  },

  // Получение активных интерфейсов
  async getActive(filters: Omit<TVInterfaceFilters, 'is_active'> = {}): Promise<PaginatedResponse<TVInterfaceAPI[]>> {
    return this.getAll({ ...filters, is_active: true });
  }
};

// Хуки для React Query/SWR (если используется)
export const tvInterfaceKeys = {
  all: ['tv-interfaces'] as const,
  lists: () => [...tvInterfaceKeys.all, 'list'] as const,
  list: (filters: TVInterfaceFilters) => [...tvInterfaceKeys.lists(), filters] as const,
  details: () => [...tvInterfaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...tvInterfaceKeys.details(), id] as const,
  device: (deviceId: string) => [...tvInterfaceKeys.all, 'device', deviceId] as const,
  type: (type: TVInterfaceAPI['type']) => [...tvInterfaceKeys.all, 'type', type] as const,
};

// Утилитарные функции
export const tvInterfaceUtils = {
  // Генерация ID для новых областей
  generateAreaId: (): string => {
    return `area_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Валидация координат области
  validateArea: (area: Partial<ClickableArea | HighlightArea>): boolean => {
    return !!(
      area.name &&
      area.position &&
      typeof area.position.x === 'number' &&
      typeof area.position.y === 'number' &&
      area.size &&
      typeof area.size.width === 'number' &&
      typeof area.size.height === 'number' &&
      area.position.x >= 0 &&
      area.position.y >= 0 &&
      area.size.width > 0 &&
      area.size.height > 0
    );
  },

  // Преобразование областей для редактора
  convertAreaForEditor: (area: ClickableArea | HighlightArea) => {
    return {
      ...area,
      // Преобразование координат если нужно
      editorPosition: {
        x: area.position.x,
        y: area.position.y
      },
      editorSize: {
        width: area.size.width,
        height: area.size.height
      }
    };
  },

  // Создание области по умолчанию
  createDefaultClickableArea: (position: { x: number; y: number }): ClickableArea => {
    return {
      id: tvInterfaceUtils.generateAreaId(),
      name: 'Новая область',
      position,
      size: { width: 100, height: 50 },
      shape: 'rectangle',
      action: 'click'
    };
  },

  createDefaultHighlightArea: (position: { x: number; y: number }): HighlightArea => {
    return {
      id: tvInterfaceUtils.generateAreaId(),
      name: 'Область подсветки',
      position,
      size: { width: 100, height: 50 },
      color: '#3b82f6',
      opacity: 0.5,
      animation: 'none'
    };
  },

  // Проверка пересечения областей
  checkAreaOverlap: (area1: ClickableArea | HighlightArea, area2: ClickableArea | HighlightArea): boolean => {
    const rect1 = {
      left: area1.position.x,
      top: area1.position.y,
      right: area1.position.x + area1.size.width,
      bottom: area1.position.y + area1.size.height
    };

    const rect2 = {
      left: area2.position.x,
      top: area2.position.y,
      right: area2.position.x + area2.size.width,
      bottom: area2.position.y + area2.size.height
    };

    return !(
      rect1.right < rect2.left ||
      rect2.right < rect1.left ||
      rect1.bottom < rect2.top ||
      rect2.bottom < rect1.top
    );
  },

  // Экспорт в файл
  downloadAsFile: (data: TVInterfaceExportData, filename?: string): void => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `tv_interface_${data.data.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export default tvInterfacesAPI;
