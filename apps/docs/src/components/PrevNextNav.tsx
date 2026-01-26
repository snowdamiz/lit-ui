import { Link } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavLink {
  title: string;
  href: string;
}

interface PrevNextNavProps {
  prev?: NavLink;
  next?: NavLink;
}

export function PrevNextNav({ prev, next }: PrevNextNavProps) {
  return (
    <nav className="mt-16 flex justify-between gap-4">
      {prev ? (
        <Link
          to={prev.href}
          className="group flex-1 max-w-xs flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 group-hover:-translate-x-0.5" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Previous</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300">{prev.title}</div>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          to={next.href}
          className="group flex-1 max-w-xs flex items-center justify-end gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm text-right ml-auto"
        >
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Next</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300">{next.title}</div>
          </div>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
