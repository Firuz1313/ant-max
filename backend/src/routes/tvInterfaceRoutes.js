const express = require('express');
const router = express.Router();
const TVInterfaceController = require('../controllers/tvInterfaceController');
const validateRequest = require('../middleware/validateRequest');

// Создание экземпляра контроллера
const tvInterfaceController = new TVInterfaceController();

// Схемы валидации для Joi
const createTVInterfaceSchema = {
  body: {
    name: {
      type: 'string',
      required: true,
      min: 1,
      max: 255,
      label: 'Название интерфейса'
    },
    description: {
      type: 'string',
      max: 2000,
      label: 'Описание'
    },
    type: {
      type: 'string',
      valid: ['home', 'settings', 'channels', 'apps', 'guide', 'no-signal', 'error', 'custom'],
      required: true,
      label: 'Тип интерфейса'
    },
    device_id: {
      type: 'string',
      label: 'ID устройства'
    },
    screenshot_url: {
      type: 'string',
      label: 'URL скриншота'
    },
    screenshot_data: {
      type: 'string',
      label: 'Данные скриншота (base64)'
    },
    svg_overlay: {
      type: 'string',
      label: 'SVG overlay'
    },
    clickable_areas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', required: true },
          name: { type: 'string', required: true },
          position: {
            type: 'object',
            properties: {
              x: { type: 'number', required: true },
              y: { type: 'number', required: true }
            },
            required: true
          },
          size: {
            type: 'object',
            properties: {
              width: { type: 'number', required: true },
              height: { type: 'number', required: true }
            },
            required: true
          },
          shape: {
            type: 'string',
            valid: ['rectangle', 'circle', 'polygon'],
            default: 'rectangle'
          },
          action: { type: 'string', required: true },
          coordinates: { type: 'array', items: { type: 'number' } }
        }
      },
      label: 'Интерактивные области'
    },
    highlight_areas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', required: true },
          name: { type: 'string', required: true },
          position: {
            type: 'object',
            properties: {
              x: { type: 'number', required: true },
              y: { type: 'number', required: true }
            },
            required: true
          },
          size: {
            type: 'object',
            properties: {
              width: { type: 'number', required: true },
              height: { type: 'number', required: true }
            },
            required: true
          },
          color: { type: 'string', required: true },
          opacity: { type: 'number', min: 0, max: 1, required: true },
          animation: {
            type: 'string',
            valid: ['pulse', 'glow', 'blink', 'none'],
            default: 'none'
          },
          duration: { type: 'number', min: 0 }
        }
      },
      label: 'Области подсветки'
    },
    responsive: {
      type: 'boolean',
      default: false,
      label: 'Адаптивность'
    },
    breakpoints: {
      type: 'object',
      label: 'Точки перелома'
    },
    is_active: {
      type: 'boolean',
      default: true,
      label: 'Активность'
    },
    metadata: {
      type: 'object',
      label: 'Метаданные'
    }
  }
};

const updateTVInterfaceSchema = {
  body: {
    name: {
      type: 'string',
      min: 1,
      max: 255,
      label: 'Название интерфейса'
    },
    description: {
      type: 'string',
      max: 2000,
      label: 'Описание'
    },
    type: {
      type: 'string',
      valid: ['home', 'settings', 'channels', 'apps', 'guide', 'no-signal', 'error', 'custom'],
      label: 'Тип интерфейса'
    },
    device_id: {
      type: 'string',
      label: 'ID устройства'
    },
    screenshot_url: {
      type: 'string',
      label: 'URL скриншота'
    },
    screenshot_data: {
      type: 'string',
      label: 'Данные скриншота (base64)'
    },
    svg_overlay: {
      type: 'string',
      label: 'SVG overlay'
    },
    clickable_areas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', required: true },
          name: { type: 'string', required: true },
          position: {
            type: 'object',
            properties: {
              x: { type: 'number', required: true },
              y: { type: 'number', required: true }
            },
            required: true
          },
          size: {
            type: 'object',
            properties: {
              width: { type: 'number', required: true },
              height: { type: 'number', required: true }
            },
            required: true
          },
          shape: {
            type: 'string',
            valid: ['rectangle', 'circle', 'polygon'],
            default: 'rectangle'
          },
          action: { type: 'string', required: true },
          coordinates: { type: 'array', items: { type: 'number' } }
        }
      },
      label: 'Интерактивные области'
    },
    highlight_areas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', required: true },
          name: { type: 'string', required: true },
          position: {
            type: 'object',
            properties: {
              x: { type: 'number', required: true },
              y: { type: 'number', required: true }
            },
            required: true
          },
          size: {
            type: 'object',
            properties: {
              width: { type: 'number', required: true },
              height: { type: 'number', required: true }
            },
            required: true
          },
          color: { type: 'string', required: true },
          opacity: { type: 'number', min: 0, max: 1, required: true },
          animation: {
            type: 'string',
            valid: ['pulse', 'glow', 'blink', 'none'],
            default: 'none'
          },
          duration: { type: 'number', min: 0 }
        }
      },
      label: 'Области подсветки'
    },
    responsive: {
      type: 'boolean',
      label: 'Адаптивность'
    },
    breakpoints: {
      type: 'object',
      label: 'Точки перелома'
    },
    is_active: {
      type: 'boolean',
      label: 'Активность'
    },
    metadata: {
      type: 'object',
      label: 'Метаданные'
    }
  }
};

const duplicateTVInterfaceSchema = {
  body: {
    name: {
      type: 'string',
      min: 1,
      max: 255,
      label: 'Новое название'
    }
  }
};

const idParamSchema = {
  params: {
    id: {
      type: 'string',
      required: true,
      label: 'ID интерфейса ТВ'
    }
  }
};

const deviceIdParamSchema = {
  params: {
    deviceId: {
      type: 'string',
      required: true,
      label: 'ID устройства'
    }
  }
};

const typeParamSchema = {
  params: {
    type: {
      type: 'string',
      valid: ['home', 'settings', 'channels', 'apps', 'guide', 'no-signal', 'error', 'custom'],
      required: true,
      label: 'Тип интерфейса'
    }
  }
};

// Роуты для ТВ интерфейсов

// GET /api/v1/tv-interfaces - Получение списка всех интерфейсов ТВ
router.get('/', tvInterfaceController.getAllTVInterfaces.bind(tvInterfaceController));

// GET /api/v1/tv-interfaces/:id - Получение интерфейса ТВ по ID
router.get('/:id', 
  validateRequest(idParamSchema),
  tvInterfaceController.getTVInterfaceById.bind(tvInterfaceController)
);

// POST /api/v1/tv-interfaces - Создание нового интерфейса ТВ
router.post('/',
  validateRequest(createTVInterfaceSchema),
  tvInterfaceController.createTVInterface.bind(tvInterfaceController)
);

// PUT /api/v1/tv-interfaces/:id - Обновление интерфейса ТВ
router.put('/:id',
  validateRequest({ ...updateTVInterfaceSchema, ...idParamSchema }),
  tvInterfaceController.updateTVInterface.bind(tvInterfaceController)
);

// DELETE /api/v1/tv-interfaces/:id - Удаление интерфейса ТВ
router.delete('/:id',
  validateRequest(idParamSchema),
  tvInterfaceController.deleteTVInterface.bind(tvInterfaceController)
);

// POST /api/v1/tv-interfaces/:id/duplicate - Дублирование интерфейса ТВ
router.post('/:id/duplicate',
  validateRequest({ ...duplicateTVInterfaceSchema, ...idParamSchema }),
  tvInterfaceController.duplicateTVInterface.bind(tvInterfaceController)
);

// PATCH /api/v1/tv-interfaces/:id/toggle - Активация/деактивация интерфейса ТВ
router.patch('/:id/toggle',
  validateRequest(idParamSchema),
  tvInterfaceController.toggleTVInterfaceStatus.bind(tvInterfaceController)
);

// GET /api/v1/tv-interfaces/device/:deviceId - Получение интерфейсов по устройству
router.get('/device/:deviceId',
  validateRequest(deviceIdParamSchema),
  tvInterfaceController.getTVInterfacesByDevice.bind(tvInterfaceController)
);

// GET /api/v1/tv-interfaces/type/:type - Получение интерфейсов по типу
router.get('/type/:type',
  validateRequest(typeParamSchema),
  tvInterfaceController.getTVInterfacesByType.bind(tvInterfaceController)
);

// GET /api/v1/tv-interfaces/:id/export - Экспорт интерфейса в JSON
router.get('/:id/export',
  validateRequest(idParamSchema),
  tvInterfaceController.exportTVInterface.bind(tvInterfaceController)
);

// POST /api/v1/tv-interfaces/import - Импорт интерфейса из JSON
router.post('/import',
  tvInterfaceController.importTVInterface.bind(tvInterfaceController)
);

module.exports = router;
