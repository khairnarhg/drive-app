import { LayoutGrid, List, Plus, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import Breadcrumb from '../file/Breadcrumb';
import Button from '../common/Button';
import { uploadFiles } from '../../services/uploadService';

interface ToolbarProps {
  currentPath: string;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  onUpload: () => void;
  onUploadComplete?: (message: string) => void;
}

const Toolbar = ({ currentPath, view, onViewChange, onUpload, onUploadComplete  }: ToolbarProps) => {
    // Create a ref to access the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for upload status
  const [isUploading, setIsUploading] = useState(false);


  // Handle file selection and upload
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    if (!files || files.length === 0) {
      return;
    }

    setIsUploading(true);
    
    try {
      // Call our upload service
      const response = await uploadFiles(files);
      
      // Show success message
      alert(response.message);
      
      // Notify parent component if callback provided
      onUploadComplete?.(response.message);
      
      // Clear the file input
      event.target.value = '';
      
    } catch (error) {
      // Handle error
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      alert(`Upload failed: ${errorMessage}`);
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };
  return (
   <div className="flex items-center justify-between">
      <Breadcrumb path={currentPath} />
      
      <div className="flex items-center gap-2">
        {/* View toggle buttons */}
        <Button 
          variant="secondary" 
          onClick={() => onViewChange('list')} 
          className={view === 'list' ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <List className="w-4 h-4" />
        </Button>
        
        <Button 
          variant="secondary" 
          onClick={() => onViewChange('grid')} 
          className={view === 'grid' ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <LayoutGrid className="w-4 h-4" />
        </Button>
        
        {/* New Folder button */}
        <Button variant="secondary">
          <Plus className="w-4 h-4 mr-1" /> New Folder
        </Button>
        
        {/* Upload button */}
        <Button 
          onClick={onUpload}
          disabled={isUploading}
        >
          <UploadCloud className="w-4 h-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="*/*" // Allow all file types, or specify like "image/*,.pdf,.doc"
        />
      </div>
    </div>
  );
};

export default Toolbar;