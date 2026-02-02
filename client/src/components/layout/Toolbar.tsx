import { LayoutGrid, List, Plus, UploadCloud } from 'lucide-react';
import Breadcrumb from '../file/Breadcrumb';
import Button from '../common/Button';

interface ToolbarProps {
  pathStack: {id: number, name: string}[];
  onNavigate: (index: number) => void;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  onUpload: () => void;
  onNewFolder: () => void;
}

const Toolbar = ({ pathStack, onNavigate, view, onViewChange, onUpload, onNewFolder }: ToolbarProps) => {
  return (
    <div className="flex items-center justify-between">
      {/* UPDATED BREADCRUMB CALL */}
      <Breadcrumb pathStack={pathStack} onNavigate={onNavigate} />
      
      <div className="flex items-center gap-2">
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
        
        {/* UPDATED NEW FOLDER BUTTON */}
        <Button variant="secondary" onClick={onNewFolder}>
          <Plus className="w-4 h-4 mr-1" /> New Folder
        </Button>
        
        <Button onClick={onUpload}>
          <UploadCloud className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;