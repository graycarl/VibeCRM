import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export const dataApi = {
  listRecords: async (objectName: string, skip = 0, limit = 50, sortField?: string, sortOrder?: string): Promise<PaginatedResponse<any>> => {
    const params: any = { skip, limit };
    if (sortField) params.sort_field = sortField;
    if (sortOrder) params.sort_order = sortOrder;

    const response = await axios.get(`${API_URL}/data/${objectName}`, {
      params,
      headers: getAuthHeader()
    });
    return response.data;
  },

  getRecord: async (objectName: string, uid: string) => {
    const response = await axios.get(`${API_URL}/data/${objectName}/${uid}`, { headers: getAuthHeader() });
    return response.data;
  },

  createRecord: async (objectName: string, data: any) => {
    const response = await axios.post(`${API_URL}/data/${objectName}`, data, { headers: getAuthHeader() });
    return response.data;
  },
  
  updateRecord: async (objectName: string, uid: string, data: any) => {
    const response = await axios.put(`${API_URL}/data/${objectName}/${uid}`, data, { headers: getAuthHeader() });
    return response.data;
  },

  deleteRecord: async (objectName: string, uid: string) => {
    const response = await axios.delete(`${API_URL}/data/${objectName}/${uid}`, { headers: getAuthHeader() });
    return response.data;
  }
};
