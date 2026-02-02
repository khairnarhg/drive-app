import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  pathStack: { id: number; name: string }[];
  onNavigate: (index: number) => void;
}

const Breadcrumb = ({ pathStack, onNavigate }: BreadcrumbProps) => {
  return (
    <nav className="flex items-center text-lg font-bold text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
      {pathStack.map((folder, index) => (
        <div key={`${folder.id}-${index}`} className="flex items-center">
          {/* 1. Added transition and padding for a better click target */}
          <button 
            onClick={() => onNavigate(index)}
            className={`transition-colors px-1 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 ${
              index === pathStack.length - 1 
                ? 'text-gray-900 dark:text-white cursor-default' 
                : 'text-gray-400 dark:text-gray-500 hover:text-mac-selection'
            }`}
          >
            {folder.name}
          </button>
          
          {/* 2. Added conditional separator with explicit horizontal margins */}
          {index < pathStack.length - 1 && (
            <ChevronRight className="w-5 h-5 mx-2 text-gray-300 dark:text-gray-600 flex-shrink-0" />
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;