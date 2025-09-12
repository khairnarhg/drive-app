import { ChevronRight } from 'lucide-react';

const Breadcrumb = ({ path }: { path: string }) => {
  const parts = path.split('/').filter(Boolean);

  return (
    <nav className="flex items-center text-lg font-bold text-gray-800 dark:text-gray-200">
      {parts.map((part, index) => (
        <div key={index} className="flex items-center">
          <a href="#" className="hover:underline">{part}</a>
          {index < parts.length - 1 && <ChevronRight className="w-5 h-5 mx-1 text-gray-400" />}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;