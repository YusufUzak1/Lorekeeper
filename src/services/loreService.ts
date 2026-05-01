import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = import.meta.env.VITE_API_ENDPOINT;

export const submitLoreNote = async (universeId: string, noteText: string) => {
  // 1. Mevcut oturumdan güvenlik biletini (Token) al
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  const userId = session.tokens?.idToken?.payload?.sub as string;

  if (!token) throw new Error('Oturum bulunamadı, lütfen tekrar giriş yapın.');

  // 2. AWS API'ye notu gönder (SQS kuyruğuna eklenir)
  const response = await fetch(`${API_URL}/lore`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({ userId, universeId, noteText }),
  });

  // SQS entegrasyonu 200 döner (mesaj kuyruğa eklendi)
  if (!response.ok) {
    throw new Error('Not gönderilirken hata oluştu.');
  }

  return true;
};
