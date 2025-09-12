

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const deleteSingleFile = async (fileId: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/deleteSingleFile/${fileId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete file');
  }

  return response.json();
};