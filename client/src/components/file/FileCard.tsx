import { motion } from 'framer-motion';
import { Folder, FileText, ImageIcon, Video, Music } from 'lucide-react';
import { FileItem } from '@/types/file';
import { formatBytes } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface FileCardProps {
  file: FileItem;
  isSelected: boolean;
  onSelect: () => void;
}

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) return <ImageIcon className="w-12 h-12 text-blue-400" />;
  if (fileName.endsWith('.mp4') || fileName.endsWith('.mov')) return <Video className="w-12 h-12 text-red-400" />;
  if (fileName.endsWith('.mp3')) return <Music className="w-12 h-12 text-purple-400" />;
  return <FileText className="w-12 h-12 text-gray-400" />;
};

const FileCard = ({ file, isSelected, onSelect }: FileCardProps) => {
  return (
    <motion.div
      onClick={onSelect}
      className={cn(
        'group relative flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-colors duration-150',
        isSelected ? 'bg-mac-selection/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800/60'
      )}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex-shrink-0">
        {file.type === 'folder' ? <Folder className="w-12 h-12 text-blue-500" /> : getFileIcon(file.name)}
      </div>
      <div className="mt-2 text-center">
        <p className="text-xs font-medium truncate w-24">{file.name}</p>
        {file.size && <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>}
      </div>
    </motion.div>
  );
};

export default FileCard;