import TVInterface from '../models/TVInterface.js';
import Device from '../models/Device.js';

class TVInterfaceController {
  constructor() {
    this.tvInterface = new TVInterface();
    this.device = new Device();
  }

  // Получение списка всех интерфейсов ТВ
  async getAllTVInterfaces(req, res) {
    try {
      const {
        device_id,
        type,
        search,
        is_active,
        limit = 50,
        offset = 0
      } = req.query;

      let filters = {};
      
      // Фильтр по устройству
      if (device_id && device_id !== 'all') {
        filters.device_id = device_id;
      }

      // Фильтр по типу
      if (type && type !== 'all') {
        filters.type = type;
      }

      // Фильтр по активности
      if (is_active !== undefined) {
        filters.is_active = is_active === 'true';
      }

      let tvInterfaces;
      
      // Поиск по названию/описанию
      if (search && search.trim()) {
        tvInterfaces = await this.tvInterface.search(search.trim());
        
        // Применяем дополнительные фильтры после поиска
        if (Object.keys(filters).length > 0) {
          tvInterfaces = tvInterfaces.filter(tvInterface => {
            return Object.entries(filters).every(([key, value]) => {
              if (key === 'device_id' && value) {
                return tvInterface.device_id === value;
              }
              if (key === 'type') {
                return tvInterface.type === value;
              }
              if (key === 'is_active') {
                return tvInterface.is_active === value;
              }
              return true;
            });
          });
        }
      } else {
        tvInterfaces = await this.tvInterface.findAll(filters);
      }

      // Пагинация
      const total = tvInterfaces.length;
      const paginatedInterfaces = tvInterfaces.slice(
        parseInt(offset), 
        parseInt(offset) + parseInt(limit)
      );

      // Обогащение данными устройств
      const enrichedInterfaces = await Promise.all(
        paginatedInterfaces.map(async (tvInterface) => {
          if (tvInterface.device_id) {
            const device = await this.device.findById(tvInterface.device_id);
            return {
              ...tvInterface,
              device: device ? {
                id: device.id,
                name: device.name,
                brand: device.brand,
                model: device.model,
                color: device.color
              } : null
            };
          }
          return tvInterface;
        })
      );

      res.json({
        success: true,
        data: enrichedInterfaces,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < total
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Ошибка получения интерфейсов ТВ:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Получение интерфейса ТВ по ID
  async getTVInterfaceById(req, res) {
    try {
      const { id } = req.params;

      const tvInterface = await this.tvInterface.findById(id);
      
      if (!tvInterface) {
        return res.status(404).json({
          success: false,
          error: 'Интерфейс ТВ не найден',
          timestamp: new Date().toISOString()
        });
      }

      // Обогащение данными устройства
      if (tvInterface.device_id) {
        const device = await this.device.findById(tvInterface.device_id);
        tvInterface.device = device ? {
          id: device.id,
          name: device.name,
          brand: device.brand,
          model: device.model,
          color: device.color
        } : null;
      }

      // Получение статистики использования
      const usageStats = await this.tvInterface.getUsageStats(id);

      res.json({
        success: true,
        data: {
          ...tvInterface,
          usage_stats: usageStats
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Ошибка получения интерфейса ТВ:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Создание нового интерфейса ТВ
  async createTVInterface(req, res) {
    try {
      const tvInterfaceData = req.body;

      // Проверка существования устройства, если указано
      if (tvInterfaceData.device_id) {
        const device = await this.device.findById(tvInterfaceData.device_id);
        if (!device) {
          return res.status(400).json({
            success: false,
            error: 'Указанное устройство не найдено',
            timestamp: new Date().toISOString()
          });
        }
      }

      const newTVInterface = await this.tvInterface.create(tvInterfaceData);

      res.status(201).json({
        success: true,
        data: newTVInterface,
        message: 'Интерфейс ТВ успешно создан',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Ошибка создания интерфейса ТВ:', error);
      
      const statusCode = error.message.includes('Ошибки валидации') ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: statusCode === 400 ? 'Ошибка валидации данных' : 'Внутренняя ошибка сервера',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Обновление интерфейса ТВ
  async updateTVInterface(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Проверка существования интерфейса
      const existingTVInterface = await this.tvInterface.findById(id);
      if (!existingTVInterface) {
        return res.status(404).json({
          success: false,
          error: 'Интерфейс ТВ не найден',
          timestamp: new Date().toISOString()
        });
      }

      // Проверка существования устройства, если указано
      if (updateData.device_id) {
        const device = await this.device.findById(updateData.device_id);
        if (!device) {
          return res.status(400).json({
            success: false,
            error: 'Указанное устройство не найдено',
            timestamp: new Date().toISOString()
          });
        }
      }

      const updatedTVInterface = await this.tvInterface.update(id, updateData);

      res.json({
        success: true,
        data: updatedTVInterface,
        message: 'Интерфейс ТВ успешно обновлен',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Ошибка обновления интерфейса ТВ:', error);
      
      const statusCode = error.message.includes('Ошибки валидации') ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: statusCode === 400 ? 'Ошибка валидации данных' : 'Внутренняя ошибка сервера',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Удаление интерфейса ТВ
  async deleteTVInterface(req, res) {
    try {
      const { id } = req.params;

      // Проверка существования интерфейса
      const existingTVInterface = await this.tvInterface.findById(id);
      if (!existingTVInterface) {
        return res.status(404).json({
          success: false,
          error: 'Интерфейс ТВ не найден',
          timestamp: new Date().toISOString()
        });
      }

      // Проверка возможности удаления
      const deleteCheck = await this.tvInterface.canDelete(id);
      if (!deleteCheck.canDelete) {
        return res.status(400).json({
          success: false,
          error: 'Невозможно удалить интерфейс ТВ',
          message: deleteCheck.reason,
          timestamp: new Date().toISOString()
        });
      }

      await this.tvInterface.delete(id);

      res.json({
        success: true,
        message: 'Интерфейс ТВ успешно удален',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Ошибка удаления интерфейса ТВ:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Дублирование интерфейса ТВ
  async duplicateTVInterface(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const duplicatedTVInterface = await this.tvInterface.duplicate(id, name);

      res.status(201).json({
        success: true,
        data: duplicatedTVInterface,
        message: 'Интерфейс ТВ успешно дублирован',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Ошибка дублирования интерфейса ТВ:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Получение интерфейсов по устройству
  async getTVInterfacesByDevice(req, res) {
    try {
      const { deviceId } = req.params;

      // Проверка существования устройства
      const device = await this.device.findById(deviceId);
      if (!device) {
        return res.status(404).json({
          success: false,
          error: 'Устройство не найдено',
          timestamp: new Date().toISOString()
        });
      }

      const tvInterfaces = await this.tvInterface.findByDeviceId(deviceId);

      res.json({
        success: true,
        data: tvInterfaces,
        device: {
          id: device.id,
          name: device.name,
          brand: device.brand,
          model: device.model,
          color: device.color
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Ошибка получения интерфейсов по устройству:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Получение интерфейсов по типу
  async getTVInterfacesByType(req, res) {
    try {
      const { type } = req.params;

      const validTypes = ['home', 'settings', 'channels', 'apps', 'guide', 'no-signal', 'error', 'custom'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Неверный тип интерфейса',
          message: `Тип должен быть одним из: ${validTypes.join(', ')}`,
          timestamp: new Date().toISOString()
        });
      }

      const tvInterfaces = await this.tvInterface.findByType(type);

      res.json({
        success: true,
        data: tvInterfaces,
        type: type,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Ошибка получения интерфейсов по типу:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Экспорт интерфейса в JSON
  async exportTVInterface(req, res) {
    try {
      const { id } = req.params;

      const exportData = await this.tvInterface.exportToJson(id);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="tv_interface_${id}.json"`);
      res.json(exportData);

    } catch (error) {
      console.error('Ошибка экспорта интерфейса ТВ:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Импорт интерфейса из JSON
  async importTVInterface(req, res) {
    try {
      const importData = req.body;

      const importedTVInterface = await this.tvInterface.importFromJson(importData);

      res.status(201).json({
        success: true,
        data: importedTVInterface,
        message: 'Интерфейс ТВ успешно импортирован',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Ошибка импорта интерфейса ТВ:', error);
      res.status(400).json({
        success: false,
        error: 'Ошибка импорта',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Активация/деактивация интерфейса ТВ
  async toggleTVInterfaceStatus(req, res) {
    try {
      const { id } = req.params;

      // Проверка существования интерфейса
      const existingTVInterface = await this.tvInterface.findById(id);
      if (!existingTVInterface) {
        return res.status(404).json({
          success: false,
          error: 'Интерфейс ТВ не найден',
          timestamp: new Date().toISOString()
        });
      }

      const updatedTVInterface = await this.tvInterface.update(id, {
        is_active: !existingTVInterface.is_active
      });

      res.json({
        success: true,
        data: updatedTVInterface,
        message: `Интерфейс ТВ ${updatedTVInterface.is_active ? 'активирован' : 'деактивирован'}`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Ошибка изменения статуса интерфейса ТВ:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = TVInterfaceController;
