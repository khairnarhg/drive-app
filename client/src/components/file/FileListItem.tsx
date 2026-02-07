import { motion } from 'framer-motion';
import { Folder, FileText, ImageIcon } from 'lucide-react';
import { FileItem } from '@/types/file';
import { cn } from '@/lib/utils';

interface FileListItemProps {
  file: FileItem;
  isSelected: boolean;
  onSelect: () => void;
  path?: string;
}

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith('.png') || fileName.endsWith('.jpg')) return <ImageIcon className="w-5 h-5 text-blue-400" />;
  return <FileText className="w-5 h-5 text-gray-400" />;
};

const FileListItem = ({ file, isSelected, onSelect, path }: FileListItemProps) => {
  const fileType = file.type === 'folder' ? 'Folder' : file.name.split('.').pop()?.toUpperCase() || 'File';
  const showPath = path !== undefined;

  return (
    <motion.div
      onClick={onSelect}
      className={cn(
        "grid items-center gap-4 px-4 py-2 rounded-md cursor-pointer text-sm",
        showPath ? "grid-cols-[2fr_1fr_1fr_1.5fr_2fr]" : "grid-cols-[3fr_1fr_1fr_2fr]",
        isSelected ? "bg-mac-selection text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800/60"
      )}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-3 truncate">
        {file.type === 'folder'
          ? <Folder className={cn("w-5 h-5 flex-shrink-0", isSelected ? "text-white" : "text-blue-500")} />
          : <div className="flex-shrink-0">{getFileIcon(file.name)}</div>}
        <span className="truncate">{file.name}</span>
      </div>
      {showPath && (
        <div className={cn("truncate text-xs", isSelected ? "text-gray-200" : "text-gray-500 dark:text-gray-400")}>
          {path}
        </div>
      )}
      <div className={cn("truncate", isSelected ? "text-gray-200" : "text-gray-600 dark:text-gray-400")}>
        {fileType}
      </div>
      <div className={cn("truncate", isSelected ? "text-gray-200" : "text-gray-600 dark:text-gray-400")}>
        {file.created_at ? new Date(file.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}
      </div>
    </motion.div>
  );
};

export default FileListItem;