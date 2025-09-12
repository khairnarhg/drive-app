
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const downloadSingleFile = async (fileId: string, fileName:string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/downloadSingleFile/${fileId}`);

    if (!response.ok) {
      // Try to parse error JSON, otherwise throw a generic error
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || 'Download failed');
    }

    // Get the file data as a Binary Large Object (blob)
    const blob = await response.blob();
    
    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary <a> element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName; // Set the desired file name
    document.body.appendChild(a); // Append to the DOM
    a.click(); // Programmatically click the link
    
    // Clean up by removing the element and revoking the URL
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Download error:', error);
    // Re-throw the error so the component can handle it (e.g., show an alert)
    throw error;
  }
};