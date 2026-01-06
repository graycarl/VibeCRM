import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export const login = async (username: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await axios.post(`${API_URL}/login/access-token`, formData, {        headers: { 'Content-Type': 'application/x-www-form-urlencoded' } 
    });
    return response.data;
};
