import axios from 'axios';
import { PicklistOption, MetaObjectRecordType, MetaObject, MetaField, MetaRole } from '../types/metadata';

const API_URL = 'http://localhost:8000/api/v1';

export type { MetaObject, MetaField, MetaRole, MetaObjectRecordType };

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
  
  updateObject: async (id: string, data: { label?: string, description?: string, has_record_type?: boolean, name_field?: string }) => {
    const response = await axios.patch<MetaObject>(`${API_URL}/meta/objects/${id}`, data, { headers: getAuthHeader() });
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

  updateField: async (fieldId: string, data: { label?: string, is_required?: boolean, description?: string }) => {
    const response = await axios.patch<MetaField>(`${API_URL}/meta/fields/${fieldId}`, data, { headers: getAuthHeader() });
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
  },

  // Picklist Options
  addOption: async (fieldId: string, option: PicklistOption) => {
    const response = await axios.post<MetaField>(`${API_URL}/meta/fields/${fieldId}/options`, option, { headers: getAuthHeader() });
    return response.data;
  },

  updateOption: async (fieldId: string, name: string, label: string) => {
    const response = await axios.patch<MetaField>(`${API_URL}/meta/fields/${fieldId}/options/${name}`, { label }, { headers: getAuthHeader() });
    return response.data;
  },

  reorderOptions: async (fieldId: string, names: string[]) => {
    const response = await axios.put<MetaField>(`${API_URL}/meta/fields/${fieldId}/options/reorder`, { names }, { headers: getAuthHeader() });
    return response.data;
  },

  deleteOption: async (fieldId: string, name: string, migrateTo?: string) => {
    const url = migrateTo 
      ? `${API_URL}/meta/fields/${fieldId}/options/${name}?migrate_to=${migrateTo}`
      : `${API_URL}/meta/fields/${fieldId}/options/${name}`;
    const response = await axios.delete<MetaField>(url, { headers: getAuthHeader() });
    return response.data;
  },

  // Record Type Options
  addRecordTypeOption: async (objectId: string, option: Partial<MetaObjectRecordType>) => {
    const response = await axios.post<MetaObjectRecordType>(`${API_URL}/meta/objects/${objectId}/record-types`, option, { headers: getAuthHeader() });
    return response.data;
  },

  updateRecordTypeOption: async (rtId: string, data: { label?: string, description?: string }) => {
    const response = await axios.patch<MetaObjectRecordType>(`${API_URL}/meta/record-types/${rtId}`, data, { headers: getAuthHeader() });
    return response.data;
  },

  deleteRecordTypeOption: async (rtId: string) => {
    const response = await axios.delete(`${API_URL}/meta/record-types/${rtId}`, { headers: getAuthHeader() });
    return response.data;
  },
  
  reorderRecordTypeOptions: async (objectId: string, ids: string[]) => {
    const response = await axios.put<MetaObjectRecordType[]>(
      `${API_URL}/meta/objects/${objectId}/record-types/reorder`,
      { id_list: ids },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  getMetadataOptions: async (metadataName?: string) => {
    const url = metadataName 
      ? `${API_URL}/meta/options?metadata_name=${metadataName}`
      : `${API_URL}/meta/options`;
    const response = await axios.get<{value: string, label: string}[]>(url, { headers: getAuthHeader() });
    return response.data;
  }
};