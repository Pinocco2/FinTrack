import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { register, logIn, logOut, refreshUser, selectIsLoggedIn, selectUser, selectIsRefreshing, selectAuthError } from './redux/authStore';

export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const user = useAppSelector(selectUser);
  const isRefreshing = useAppSelector(selectIsRefreshing);
  const apiError = useAppSelector(selectAuthError);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    dispatch(refreshUser());
  }, [dispatch]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(register({ name: regName, email: regEmail, password: regPassword }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(logIn({ email: loginEmail, password: loginPassword }));
  };

  if (isRefreshing) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Завантаження...</div>;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
        <h1>Фінальний Проект</h1>
        {isLoggedIn && (
          <div>
            <span style={{ marginRight: '15px' }}>Вітаємо, <b>{user.name}</b>!</span>
            <button onClick={() => dispatch(logOut())} style={{ padding: '6px 12px', cursor: 'pointer' }}>Вийти</button>
          </div>
        )}
      </header>

      {apiError && <p style={{ color: 'red', backgroundColor: '#fff0f0', padding: '10px', borderRadius: '4px' }}>Помилка: {apiError}</p>}

      {!isLoggedIn ? (
        <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap' }}>
          <form onSubmit={handleRegister} style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2>Створити аккаунт</h2>
            <input type="text" placeholder="Ім'я" value={regName} onChange={e => setRegName(e.target.value)} required style={{ padding: '10px' }} />
            <input type="email" placeholder="Електронна пошта" value={regEmail} onChange={e => setRegEmail(e.target.value)} required style={{ padding: '10px' }} />
            <input type="password" placeholder="Пароль" value={regPassword} onChange={e => setRegPassword(e.target.value)} required style={{ padding: '10px' }} />
            <button type="submit" style={{ padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', cursor: 'pointer' }}>Зареєструватися</button>
          </form>

          <form onSubmit={handleLogin} style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2>Увійти</h2>
            <input type="email" placeholder="Електронна пошта" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required style={{ padding: '10px' }} />
            <input type="password" placeholder="Пароль" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required style={{ padding: '10px' }} />
            <button type="submit" style={{ padding: '10px', backgroundColor: '#000', color: 'white', border: 'none', cursor: 'pointer' }}>Увійти</button>
          </form>
        </div>
      ) : (
        <div style={{ marginTop: '20px', padding: '30px', border: '2px dashed #ccc', textAlign: 'center' }}>
          <h3>Авторизація успішна! 🎉</h3>
          <p>Цей блок відкривається тільки для авторизованих користувачів. Саме сюди ти тепер можеш підключати свої компоненти сторінок, списки, картки чи таблиці з твого ТЗ, які працюватимуть з Supabase або MockAPI.</p>
        </div>
      )}
    </div>
  );
};