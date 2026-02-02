// src/services/trashFetchService.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const getTrashedFiles = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/files/trash`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch trash');
  }

  const data = await response.json();
  // Ensure the UI knows these are files for rendering purposes
  return data.map((f: any) => ({ ...f, type: 'file' })); 
};