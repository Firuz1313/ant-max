// Mock database implementation for development environments where PostgreSQL is not available
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock data storage
let mockData = {
  devices: [
    {
      id: 1,
      name: 'Samsung TV 55" QLED',
      brand: 'Samsung',
      model: 'QE55Q70C',
      type: 'tv',
      description: 'Smart TV с QLED экраном диагональю 55 дюймов',
      image_url: '/images/devices/samsung-qled-55.jpg',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'LG STB',
      brand: 'LG',
      model: 'LG-STB-2024',
      type: 'set_top_box',
      description: 'Цифровая приставка LG',
      image_url: '/images/devices/lg-stb.jpg',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  problems: [
    {
      id: 1,
      title: 'Нет сигнала на экране',
      description: 'Экран остается черным, нет изображения',
      severity: 'high',
      category: 'display',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Проблемы со звуком',
      description: 'Звук не воспроизводится или искажен',
      severity: 'medium',
      category: 'audio',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  diagnostic_steps: [
    {
      id: 1,
      problem_id: 1,
      step_number: 1,
      title: 'Проверка подключения кабелей',
      description: 'Убедитесь, что все кабели подключены правильно',
      instruction: 'Проверьте HDMI кабель, кабель питания',
      expected_result: 'Кабели подключены надежно',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  diagnostic_sessions: [
    {
      id: 1,
      device_id: 1,
      problem_id: 1,
      user_name: 'Тестовый пользователь',
      status: 'in_progress',
      start_time: new Date().toISOString(),
      end_time: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

// Mock query function that simulates PostgreSQL query interface
export async function query(text, params = []) {
  // Simulate database latency
  await new Promise(resolve => setTimeout(resolve, 10));
  
  const lowercaseText = text.toLowerCase().trim();
  
  // Handle SELECT queries
  if (lowercaseText.startsWith('select')) {
    if (lowercaseText.includes('from devices')) {
      if (lowercaseText.includes('where id =')) {
        const id = parseInt(params[0]);
        const device = mockData.devices.find(d => d.id === id);
        return { rows: device ? [device] : [], rowCount: device ? 1 : 0 };
      }
      return { rows: mockData.devices, rowCount: mockData.devices.length };
    }
    
    if (lowercaseText.includes('from problems')) {
      if (lowercaseText.includes('where id =')) {
        const id = parseInt(params[0]);
        const problem = mockData.problems.find(p => p.id === id);
        return { rows: problem ? [problem] : [], rowCount: problem ? 1 : 0 };
      }
      return { rows: mockData.problems, rowCount: mockData.problems.length };
    }
    
    if (lowercaseText.includes('from diagnostic_steps')) {
      if (lowercaseText.includes('where problem_id =')) {
        const problemId = parseInt(params[0]);
        const steps = mockData.diagnostic_steps.filter(s => s.problem_id === problemId);
        return { rows: steps, rowCount: steps.length };
      }
      return { rows: mockData.diagnostic_steps, rowCount: mockData.diagnostic_steps.length };
    }
    
    if (lowercaseText.includes('from diagnostic_sessions')) {
      return { rows: mockData.diagnostic_sessions, rowCount: mockData.diagnostic_sessions.length };
    }
    
    // Health check query
    if (lowercaseText.includes('select now()') || lowercaseText.includes('select 1')) {
      return { 
        rows: [{ 
          current_time: new Date().toISOString(), 
          postgres_version: 'Mock Database v1.0.0'
        }], 
        rowCount: 1 
      };
    }
  }
  
  // Handle INSERT queries
  if (lowercaseText.startsWith('insert')) {
    return { rows: [], rowCount: 1 };
  }
  
  // Handle UPDATE queries
  if (lowercaseText.startsWith('update')) {
    return { rows: [], rowCount: 1 };
  }
  
  // Handle DELETE queries
  if (lowercaseText.startsWith('delete')) {
    return { rows: [], rowCount: 1 };
  }
  
  // Default response
  return { rows: [], rowCount: 0 };
}

// Mock transaction function
export async function transaction(callback) {
  // For mock implementation, just execute the callback
  const mockClient = {
    query: query
  };
  return await callback(mockClient);
}

// Mock test connection function
export async function testConnection() {
  console.log('✅ Mock database connection successful');
  return {
    success: true,
    serverTime: new Date().toISOString(),
    version: 'Mock Database v1.0.0'
  };
}

// Mock database creation
export async function createDatabase() {
  console.log('📊 Mock database created (no-op)');
}

// Mock migrations
export async function runMigrations() {
  console.log('🔄 Mock migrations completed (no-op)');
}

// Mock database stats
export async function getDatabaseStats() {
  return {
    tables: [
      { tablename: 'devices', live_rows: mockData.devices.length },
      { tablename: 'problems', live_rows: mockData.problems.length },
      { tablename: 'diagnostic_steps', live_rows: mockData.diagnostic_steps.length },
      { tablename: 'diagnostic_sessions', live_rows: mockData.diagnostic_sessions.length }
    ],
    databaseSize: '1.2 MB (mock)',
    timestamp: new Date().toISOString()
  };
}

// Mock close pool
export async function closePool() {
  console.log('✅ Mock database pool closed');
}

// Create a mock pool object
export const pool = {
  connect: async () => ({
    query: query,
    release: () => {},
  }),
  on: () => {},
  end: async () => {}
};

export default {
  query,
  transaction,
  testConnection,
  createDatabase,
  runMigrations,
  getDatabaseStats,
  closePool,
  pool
};
