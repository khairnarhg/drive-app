

export const uploadFiles = async (files: FileList | File[], folderId?: number, token?: string) => {
  // Use document.cookie to get the token on the client side
 


  if (!token) {
    throw new Error("You are not authenticated. Please log in again.");
  }

  const formData = new FormData();

  // Append each file to the 'files' key
  Array.from(files).forEach((file) => {
    formData.append('files', file);
  });

  if (folderId) {
    formData.append('folder_id', folderId.toString());
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // No Content-Type header here, the browser handles it for FormData
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Upload failed');
  }

  return response.json();
};