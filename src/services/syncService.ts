import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = import.meta.env.VITE_API_ENDPOINT;

// Buluttan state'i çek
export const fetchStateFromCloud = async () => {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) throw new Error('Oturum bulunamadı.');

  const response = await fetch(`${API_URL}/sync`, {
    method: 'GET',
    headers: {
      Authorization: token,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Buluttan veri çekilirken hata oluştu.');
  }

  return await response.json();
};

// Buluta state'i kaydet
export const syncStateToCloud = async (statePayload: any) => {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) throw new Error('Oturum bulunamadı.');

  const response = await fetch(`${API_URL}/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(statePayload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Buluta kayıt sırasında hata oluştu.');
  }

  return await response.json();
};
