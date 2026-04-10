import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = import.meta.env.VITE_API_ENDPOINT;

export const createLore = async (title: string, content: string) => {
  // 1. Mevcut oturumdan guvenlik biletini (Token) al
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) throw new Error('Oturum bulunamadi, lutfen tekrar giris yapin.');

  // 2. AWS API'ye istegi gonder
  const response = await fetch(`${API_URL}/lore`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token, // Cognito bileti burada iletiliyor
    },
    body: JSON.stringify({ title, content }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Kayit sirasinda hata olustu.');
  }

  return await response.json();
};
