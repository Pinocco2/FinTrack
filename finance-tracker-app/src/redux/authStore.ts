import axios, { AxiosError } from 'axios'; // Імпортуємо AxiosError для типізації помилок

// ... твої інтерфейси, стейт та setAuthHeader залишаються без змін ...

export const register = createAsyncThunk<AuthResponse, Record<string, string>, { rejectValue: string }>(
  'auth/register',
  async (credentials, thunkAPI) => {
    try {
      const res = await axios.post<AuthResponse>('/users/signup', credentials);
      setAuthHeader(res.data.token);
      localStorage.setItem('auth_token', res.data.token);
      return res.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        axiosError.response?.data?.message || axiosError.message || 'Помилка реєстрації'
      );
    }
  }
);

export const logIn = createAsyncThunk<AuthResponse, Record<string, string>, { rejectValue: string }>(
  'auth/login',
  async (credentials, thunkAPI) => {
    try {
      const res = await axios.post<AuthResponse>('/users/login', credentials);
      setAuthHeader(res.data.token);
      localStorage.setItem('auth_token', res.data.token);
      return res.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        axiosError.response?.data?.message || axiosError.message || 'Помилка входу'
      );
    }
  }
);

export const logOut = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      await axios.post('/users/logout');
      clearAuthHeader();
      localStorage.removeItem('auth_token');
      // Помилка ts(7030) зникає, бо при успішному виконанні void-функція просто завершується
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(axiosError.message || 'Помилка виходу');
    }
  }
);

export const refreshUser = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/refresh',
  async (_, thunkAPI) => {
    const savedToken = localStorage.getItem('auth_token');
    
    if (!savedToken) {
      return thunkAPI.rejectWithValue('Токен відсутній у локальному сховищі');
    }

    try {
      setAuthHeader(savedToken);
      const res = await axios.get<User>('/users/current');
      return res.data;
    } catch (error: unknown) {
      localStorage.removeItem('auth_token');
      const axiosError = error as AxiosError;
      return thunkAPI.rejectWithValue(axiosError.message || 'Сесія завершилась');
    }
  }
);