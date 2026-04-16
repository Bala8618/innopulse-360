import { useMemo } from 'react';

export default function useAuth() {
  const user = useMemo(() => {
    const raw = localStorage.getItem('innopulse_user');
    return raw ? JSON.parse(raw) : null;
  }, []);

  return { user };
}
