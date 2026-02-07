/**
 * Permanently deletes a file. Uses backend DELETE /files/:id.
 * For move-to-trash use moveFileToTrash from trashService.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const deleteSingleFile = async (
  fileId: string,
  token: string
): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete file');
  }

  return response.json();
};
