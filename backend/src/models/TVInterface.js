import BaseModel from './BaseModel.js';

class TVInterface extends BaseModel {
  constructor() {
    super('tv_interfaces');
  }

  // Валидация данных интерфейса ТВ
  validateTVInterface(data) {
    const errors = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Название интерфейса обязательно');
    }

    if (data.name && data.name.length > 255) {
      errors.push('Название не должно превышать 255 символов');
    }

    if (!data.type || !['home', 'settings', 'channels', 'apps', 'guide', 'no-signal', 'error', 'custom'].includes(data.type)) {
      errors.push('Тип интерфейса должен быть одним из: home, settings, channels, apps, guide, no-signal, error, custom');
    }

    if (data.device_id && typeof data.device_id !== 'string') {
      errors.push('ID устройства должно быть строкой');
    }

    if (data.description && data.description.length > 2000) {
      errors.push('Описание не должно превышать 2000 символов');
    }

    if (data.clickable_areas && !Array.isArray(data.clickable_areas)) {
      errors.push('Интерактивные области должны быть массивом');
    }

    if (data.highlight_areas && !Array.isArray(data.highlight_areas)) {
      errors.push('Области подсветки должны быть массивом');
    }

    // Валидация интерактивных областей
    if (data.clickable_areas) {
      data.clickable_areas.forEach((area, index) => {
        if (!area.id || typeof area.id !== 'string') {
          errors.push(`Интерактивная область ${index + 1}: ID обязательно`);
        }
        if (!area.name || typeof area.name !== 'string') {
          errors.push(`Интерактивная область ${index + 1}: название обязательно`);
        }
        if (!area.position || typeof area.position.x !== 'number' || typeof area.position.y !== 'number') {
          errors.push(`Интерактивная область ${index + 1}: позиция должна содержать x и y координаты`);
        }
        if (!area.size || typeof area.size.width !== 'number' || typeof area.size.height !== 'number') {
          errors.push(`Интерактивная область ${index + 1}: размер должен содержать width и height`);
        }
        if (!area.action || typeof area.action !== 'string') {
          errors.push(`Интерактивная область ${index + 1}: действие обязательно`);
        }
      });
    }

    // Валидация областей подсветки
    if (data.highlight_areas) {
      data.highlight_areas.forEach((area, index) => {
        if (!area.id || typeof area.id !== 'string') {
          errors.push(`Область подсветки ${index + 1}: ID обязательно`);
        }
        if (!area.name || typeof area.name !== 'string') {
          errors.push(`Область подсветки ${index + 1}: название обязательно`);
        }
        if (!area.position || typeof area.position.x !== 'number' || typeof area.position.y !== 'number') {
          errors.push(`Область подсветки ${index + 1}: позиция должна содержать x и y координаты`);
        }
        if (!area.color || typeof area.color !== 'string') {
          errors.push(`Область подсветки ${index + 1}: цвет обязателен`);
        }
        if (typeof area.opacity !== 'number' || area.opacity < 0 || area.opacity > 1) {
          errors.push(`Область подсветки ${index + 1}: прозрачность должна быть числом от 0 до 1`);
        }
      });
    }

    return errors;
  }

  // Создание нового интерфейса ТВ
  async create(data) {
    const validationErrors = this.validateTVInterface(data);
    if (validationErrors.length > 0) {
      throw new Error(`Ошибки валидации: ${validationErrors.join(', ')}`);
    }

    const tvInterfaceData = {
      id: data.id || this.generateId(),
      device_id: data.device_id || null,
      name: data.name.trim(),
      description: data.description || '',
      type: data.type,
      screenshot_url: data.screenshot_url || null,
      screenshot_data: data.screenshot_data || null,
      svg_overlay: data.svg_overlay || null,
      clickable_areas: JSON.stringify(data.clickable_areas || []),
      highlight_areas: JSON.stringify(data.highlight_areas || []),
      responsive: data.responsive || false,
      breakpoints: data.breakpoints ? JSON.stringify(data.breakpoints) : null,
      is_active: data.is_active !== undefined ? data.is_active : true,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null
    };

    return await super.create(tvInterfaceData);
  }

  // Обновление интерфейса ТВ
  async update(id, data) {
    const validationErrors = this.validateTVInterface(data);
    if (validationErrors.length > 0) {
      throw new Error(`Ошибки валидации: ${validationErrors.join(', ')}`);
    }

    const updateData = {};
    
    const allowedFields = [
      'device_id', 'name', 'description', 'type', 'screenshot_url', 
      'screenshot_data', 'svg_overlay', 'clickable_areas', 'highlight_areas',
      'responsive', 'breakpoints', 'is_active', 'metadata'
    ];

    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        if (['clickable_areas', 'highlight_areas', 'breakpoints', 'metadata'].includes(field)) {
          updateData[field] = typeof data[field] === 'string' ? data[field] : JSON.stringify(data[field]);
        } else {
          updateData[field] = data[field];
        }
      }
    });

    return await super.update(id, updateData);
  }

  // Получение интерфейса с парсингом JSON полей
  async findById(id) {
    const tvInterface = await super.findById(id);
    if (tvInterface) {
      return this.parseJsonFields(tvInterface);
    }
    return null;
  }

  // Получение всех интерфейсов с парсингом JSON полей
  async findAll(filters = {}) {
    const tvInterfaces = await super.findAll(filters);
    return tvInterfaces.map(tvInterface => this.parseJsonFields(tvInterface));
  }

  // Получение интерфейсов по устройству
  async findByDeviceId(deviceId) {
    const filters = { device_id: deviceId, is_active: true };
    return await this.findAll(filters);
  }

  // ��олучение интерфейсов по типу
  async findByType(type) {
    const filters = { type: type, is_active: true };
    return await this.findAll(filters);
  }

  // Получение активных интерфейсов
  async findActive() {
    const filters = { is_active: true };
    return await this.findAll(filters);
  }

  // Поиск интерфейсов по названию
  async search(query) {
    const sql = `
      SELECT * FROM ${this.tableName} 
      WHERE (
        LOWER(name) LIKE LOWER($1) 
        OR LOWER(description) LIKE LOWER($1)
      ) 
      AND is_active = true
      ORDER BY name ASC
    `;
    
    const searchPattern = `%${query}%`;
    const result = await this.query(sql, [searchPattern]);
    return result.rows.map(tvInterface => this.parseJsonFields(tvInterface));
  }

  // Получение интерфейса по умолчанию для типа
  async findDefaultForType(type) {
    const sql = `
      SELECT * FROM ${this.tableName} 
      WHERE type = $1 AND is_active = true
      ORDER BY created_at ASC
      LIMIT 1
    `;
    
    const result = await this.query(sql, [type]);
    if (result.rows.length > 0) {
      return this.parseJsonFields(result.rows[0]);
    }
    return null;
  }

  // Дублир��вание интерфейса
  async duplicate(id, newName) {
    const original = await this.findById(id);
    if (!original) {
      throw new Error('Интерфейс не найден');
    }

    const duplicateData = {
      ...original,
      id: this.generateId(),
      name: newName || `${original.name} (копия)`,
      created_at: undefined,
      updated_at: undefined
    };

    return await this.create(duplicateData);
  }

  // Получение статистики использования
  async getUsageStats(id) {
    const sql = `
      SELECT 
        COUNT(DISTINCT ds.id) as session_count,
        COUNT(dst.id) as step_count,
        AVG(CASE WHEN ds.success THEN 1 ELSE 0 END) as success_rate
      FROM ${this.tableName} ti
      LEFT JOIN diagnostic_steps dst ON dst.tv_interface_id = ti.id
      LEFT JOIN diagnostic_sessions ds ON ds.problem_id = dst.problem_id
      WHERE ti.id = $1
    `;
    
    const result = await this.query(sql, [id]);
    return result.rows[0];
  }

  // Проверка возможности удаления
  async canDelete(id) {
    const sql = `
      SELECT COUNT(*) as usage_count
      FROM diagnostic_steps 
      WHERE tv_interface_id = $1
    `;
    
    const result = await this.query(sql, [id]);
    const usageCount = parseInt(result.rows[0].usage_count);
    
    return {
      canDelete: usageCount === 0,
      reason: usageCount > 0 ? `Интерфейс используется в ${usageCount} диагностических шагах` : null
    };
  }

  // Парсинг JSON полей
  parseJsonFields(tvInterface) {
    if (!tvInterface) return null;

    return {
      ...tvInterface,
      clickable_areas: this.parseJson(tvInterface.clickable_areas, []),
      highlight_areas: this.parseJson(tvInterface.highlight_areas, []),
      breakpoints: this.parseJson(tvInterface.breakpoints, null),
      metadata: this.parseJson(tvInterface.metadata, {})
    };
  }

  // Экспорт интерфейса в JSON
  async exportToJson(id) {
    const tvInterface = await this.findById(id);
    if (!tvInterface) {
      throw new Error('Интерфейс не найден');
    }

    // Исключаем служебные поля
    const { created_at, updated_at, is_active, ...exportData } = tvInterface;
    
    return {
      version: '1.0',
      type: 'tv_interface',
      data: exportData,
      exported_at: new Date().toISOString()
    };
  }

  // Импорт интерфейса из JSON
  async importFromJson(jsonData) {
    if (!jsonData.data || jsonData.type !== 'tv_interface') {
      throw new Error('Неверный формат файла импорта');
    }

    const importData = {
      ...jsonData.data,
      id: this.generateId(),
      name: `${jsonData.data.name} (импортированный)`
    };

    return await this.create(importData);
  }

  // Генерация уникального ID
  generateId() {
    return `tv_interface_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default TVInterface;
