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
  return data.map((f: { id: number; name: string; size?: number; created_at?: string }) => ({
    ...f,
    id: String(f.id),
    type: 'file' as const,
  }));
};

export const moveFileToTrash = async (fileId: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/files/${fileId}/trash`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to move to trash');
  }
};

export const restoreFile = async (fileId: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/files/${fileId}/restore`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to restore file');
  }
};

export const deleteFilePermanently = async (fileId: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete permanently');
  }
};