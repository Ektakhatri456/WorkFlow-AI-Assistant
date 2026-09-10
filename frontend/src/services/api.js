import axios from 'axios';

// In development Vite proxies /api → backend
// In production you can set VITE_API_URL
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // AI calls can take time
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to extract error message
const getErrorMessage = (error) => {
  if (error.response?.data?.detail) {
    return typeof error.response.data.detail === 'string'
      ? error.response.data.detail
      : JSON.stringify(error.response.data.detail);
  }
  if (error.message) return error.message;
  return 'Something went wrong. Please try again.';
};

export const summarizeText = async (text, tone = 'professional', length = 'medium') => {
  try {
    const { data } = await api.post('/summarize', { text, tone, length });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
};

export const askQuestion = async (context, question) => {
  try {
    const { data } = await api.post('/ask', { context, question });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
};

export const generateContent = async (prompt, content_type = 'general', tone = 'professional', length = 'medium') => {
  try {
    const { data } = await api.post('/generate', { prompt, content_type, tone, length });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
};

export const analyzeText = async (text, focus = 'general') => {
  try {
    const { data } = await api.post('/analyze', { text, focus });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
};

export const getSuggestions = async (text, goal = 'improve productivity') => {
  try {
    const { data } = await api.post('/suggest', { text, goal });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
};

export const analyzeDocument = async (file, question = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (question) formData.append('question', question);

    const { data } = await api.post('/analyze-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
};

export default api;
