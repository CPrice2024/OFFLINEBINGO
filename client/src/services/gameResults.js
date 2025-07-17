import axios from 'axios';

const API_URL = '/api/game-results';

const saveGameResult = async (resultData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const response = await axios.post(API_URL, resultData, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to save game result');
  }
};

const getGameResults = async (params = {}, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params
  };

  try {
    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch results');
  }
};

const getWinners = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const response = await axios.get(`${API_URL}/winners`, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch winners');
  }
};

const getGameStats = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const response = await axios.get(`${API_URL}/stats`, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch stats');
  }
};

export default {
  saveGameResult,
  getGameResults,
  getWinners,
  getGameStats
};