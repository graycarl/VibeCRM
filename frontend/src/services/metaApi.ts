import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export interface MetaObject {
  id: string;
  name: string;
  label: string;
  description?: string;
  source: 'system' | 'custom';
  created_at?: string;
  fields?: MetaField[];
}

export interface MetaField {
  id: string;
  object_id: string;
  name: string;
  label: string;
  data_type: 'Text' | 'Number' | 'Date' | 'Datetime' | 'Boolean' | 'Picklist' | 'Lookup' | 'Metadata';
  options?: any;
  is_required: boolean;
  source: 'system' | 'custom';
}

export interface MetaRole {
  id: string;
  name: string;
  label: string;
  description?: string;
  permissions?: any;
  source: 'system' | 'custom';
}

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const metaApi = {
  getObjects: async () => {
    const response = await axios.get<MetaObject[]>(`${API_URL}/meta/objects`, { headers: getAuthHeader() });
    return response.data;
  },
  
  getObject: async (id: string) => {
    const response = await axios.get<MetaObject>(`${API_URL}/meta/objects/${id}`, { headers: getAuthHeader() });
    return response.data;
  },

  createObject: async (data: Partial<MetaObject>) => {
    const response = await axios.post<MetaObject>(`${API_URL}/meta/objects`, data, { headers: getAuthHeader() });
    return response.data;
  },
  
  deleteObject: async (id: string) => {
    const response = await axios.delete(`${API_URL}/meta/objects/${id}`, { headers: getAuthHeader() });
    return response.data;
  },

  createField: async (objectId: string, data: Partial<MetaField>) => {
    const response = await axios.post<MetaField>(`${API_URL}/meta/objects/${objectId}/fields`, data, { headers: getAuthHeader() });
    return response.data;
  },

  getRoles: async () => {
    const response = await axios.get<MetaRole[]>(`${API_URL}/meta/roles`, { headers: getAuthHeader() });
    return response.data;
  },

  getRole: async (id: string) => {
    const response = await axios.get<MetaRole>(`${API_URL}/meta/roles/${id}`, { headers: getAuthHeader() });
    return response.data;
  },

  createRole: async (data: Partial<MetaRole>) => {
    const response = await axios.post<MetaRole>(`${API_URL}/meta/roles`, data, { headers: getAuthHeader() });
    return response.data;
  },

  updateRole: async (id: string, data: Partial<MetaRole>) => {
    const response = await axios.put<MetaRole>(`${API_URL}/meta/roles/${id}`, data, { headers: getAuthHeader() });
    return response.data;
  },

  deleteRole: async (id: string) => {
    const response = await axios.delete(`${API_URL}/meta/roles/${id}`, { headers: getAuthHeader() });
    return response.data;
  }
};