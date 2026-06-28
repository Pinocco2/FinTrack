import { configureStore, createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';

axios.defaults.baseURL = 'https://connections-api.goit.global';

// --- 1. ІНТЕРФЕЙСИ ТА ТИПИ ---
export interface User {
  name: string | null;
  email: string | null;
}

export interface AuthState {
  user: User;
  token: string | null;
  isLoggedIn: boolean;
  isRefreshing: boolean;
  error: string | null;
}

interface AuthResponse {
  user: User;
  token: string;
}

// Очікуваний формат помилки від Connections API
interface BackendErrorResponse {
  message?: string;
  name?: string;
  code?: number;
}

// --- 2. ДОПОМІЖНІ ФУНКЦІЇ ДЛЯ AXIOS ---
const setAuthHeader = (token: string): void => {
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
};

const clearAuthHeader = (): void => {
  axios.defaults.headers.common.Authorization = '';
};

// --- 3. АСИНХРОННІ ЗАПИТИ (THUNKS) ---
export const register = createAsyncThunk<AuthResponse, Record<string, string>, { rejectValue: string }>(
  'auth/register',
  async (credentials, thunkAPI) => {
    try {
      const res = await axios.post<AuthResponse>('/users/signup', credentials);
      setAuthHeader(res.data.token);
      localStorage.setItem('auth_token', res.data.token);
      return res.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<BackendErrorResponse>;
      // Витягуємо точний опис помилки, який прислав нам сервер GoIT
      const serverMessage = axiosError.response?.data?.message;
      
      if (axiosError.response?.status === 400) {
        return thunkAPI.rejectWithValue(
          serverMessage || 'Помилка реєстрації: Перевірте унікальність email (можливо вже зайнятий) або пароль (мінімум 7 символів).'
        );
      }
      return thunkAPI.rejectWithValue(serverMessage || axiosError.message || 'Помилка реєстрації');
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
      const axiosError = error as AxiosError<BackendErrorResponse>;
      const serverMessage = axiosError.response?.data?.message;
      
      if (axiosError.response?.status === 400) {
        return thunkAPI.rejectWithValue('Неправильна електронна пошта або пароль.');
      }
      return thunkAPI.rejectWithValue(serverMessage || axiosError.message || 'Помилка входу');
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
      return; // Явно повертаємо undefined (void) для вирішення помилки ts(7030)
    } catch (error: unknown) {
      const axiosError = error as AxiosError<BackendErrorResponse>;
      return thunkAPI.rejectWithValue(axiosError.response?.data?.message || axiosError.message || 'Помилка виходу');
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
      const axiosError = error as AxiosError<BackendErrorResponse>;
      return thunkAPI.rejectWithValue(axiosError.response?.data?.message || axiosError.message || 'Сесія завершилась');
    }
  }
);

// --- 4. СЛАЙС (РЕДЮСЕР) ---
const initialState: AuthState = {
  user: { name: null, email: null },
  token: localStorage.getItem('auth_token'),
  isLoggedIn: false,
  isRefreshing: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoggedIn = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload ?? 'Помилка реєстрації';
      })
      .addCase(logIn.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoggedIn = true;
        state.error = null;
      })
      .addCase(logIn.rejected, (state, action) => {
        state.error = action.payload ?? 'Помилка входу';
      })
      .addCase(logOut.fulfilled, (state) => {
        state.user = { name: null, email: null };
        state.token = null;
        state.isLoggedIn = false;
        state.error = null;
      })
      .addCase(refreshUser.pending, (state) => {
        state.isRefreshing = true;
      })
      .addCase(refreshUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        state.isRefreshing = false;
        state.error = null;
      })
      .addCase(refreshUser.rejected, (state) => {
        state.isRefreshing = false;
      });
  },
});

// --- 5. СТВОРЕННЯ STORE ---
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});

// --- 6. СЕЛЕКТОРИ ТА ТИПИ СТОРУ ---
export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsRefreshing = (state: RootState) => state.auth.isRefreshing;
export const selectAuthError = (state: RootState) => state.auth.error;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



