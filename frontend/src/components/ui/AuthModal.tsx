import React, { useState } from 'react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/useAuthStore';
import { useRunStore } from '../../store/useRunStore';

export const AuthModal: React.FC = () => {
  const { login } = useAuthStore();
  const { setToastMessage } = useRunStore();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setToastMessage('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      if (isLoginMode) {
        // 로그인
        const res = await authApi.post('/auth/login', { username, password });
        login(res.data.token, res.data.username);
        setToastMessage(`환영합니다, ${res.data.username}님!`);
      } else {
        // 회원가입
        const res = await authApi.post('/auth/register', { username, password });
        login(res.data.token, res.data.username);
        setToastMessage(`가입 성공! ${res.data.username}님 환영합니다.`);
      }

      // 로그인(또는 회원가입 직후 로그인)이 성공하면 런 데이터를 서버에서 불러옴
      const { useRunStore: getRunStore } = await import('../../store/useRunStore');
      await getRunStore.getState().loadRunData();
    } catch (error: any) {
      if (error.response?.data?.message) {
        setToastMessage(error.response.data.message);
      } else {
        setToastMessage(isLoginMode ? '로그인에 실패했습니다.' : '회원가입에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        width: '400px', padding: '40px', backgroundColor: '#2a1f1a',
        borderRadius: '16px', border: '2px solid #aa7700',
        display: 'flex', flexDirection: 'column', gap: '20px',
        boxShadow: '0 0 30px rgba(170, 119, 0, 0.3)'
      }}>
        <h2 style={{ color: '#ffd700', fontSize: '32px', textAlign: 'center', margin: 0 }}>
          {isLoginMode ? '웨이스트랜드 접속' : '새로운 생존자 등록'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>요원명 (ID)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%', padding: '12px', boxSizing: 'border-box',
                backgroundColor: '#1a120f', color: '#fff', border: '1px solid #554422',
                borderRadius: '8px', fontSize: '16px'
              }}
              placeholder="멋진 이름을 입력하세요"
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '12px', boxSizing: 'border-box',
                backgroundColor: '#1a120f', color: '#fff', border: '1px solid #554422',
                borderRadius: '8px', fontSize: '16px'
              }}
              placeholder="비밀번호"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '16px', marginTop: '10px', fontSize: '18px', fontWeight: 'bold',
              backgroundColor: isLoading ? '#555' : '#4a3a10',
              color: isLoading ? '#999' : '#ffd700',
              border: isLoading ? '2px solid #555' : '2px solid #cca500',
              borderRadius: '8px', cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#5a4a20'; }}
            onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#4a3a10'; }}
          >
            {isLoading ? '통신 중...' : (isLoginMode ? '로그인' : '회원가입')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            style={{
              background: 'none', border: 'none', color: '#888',
              textDecoration: 'underline', cursor: 'pointer', fontSize: '14px'
            }}
          >
            {isLoginMode ? '아직 황무지 ID가 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
};
