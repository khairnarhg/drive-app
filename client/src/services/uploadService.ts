interface UploadResponse {
  message: string;
}

interface UploadError {
  error?: string;
  message?: string;
}



export const uploadFiles  = async (
  files: FileList,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      console.log("XHR Response:", xhr.response, "Status:", xhr.status);
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error || errorData.message || 'Upload failed'));
        } catch {
          reject(new Error('Upload failed'));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));

    xhr.open("POST", "/api/upload/");
    xhr.send(formData);
  });
};