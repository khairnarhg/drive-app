// src/services/downloadSingleFile.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const downloadSingleFile = async (fileId: string, fileName: string, token: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || 'Download failed');
    }

    // 1. Convert the response to a Blob (Binary Data)
    const blob = await response.blob();
    
    // 2. Create a hidden URL for this binary data
    const url = window.URL.createObjectURL(blob);
    
    // 3. Create a temporary "anchor" element to trigger the browser's save dialog
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName); // Force the filename
    document.body.appendChild(link);
    
    link.click(); // Programmatically click it
    
    // 4. Cleanup: Remove the link and revoke the URL to free memory
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};