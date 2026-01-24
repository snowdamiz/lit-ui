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
    <nav className="mt-16 pt-8 border-t border-gray-200 flex justify-between">
      {prev ? (
        <Link
          to={prev.href}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <div>
            <div className="text-sm text-gray-500">Previous</div>
            <div className="font-medium">{prev.title}</div>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          to={next.href}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-right"
        >
          <div>
            <div className="text-sm text-gray-500">Next</div>
            <div className="font-medium">{next.title}</div>
          </div>
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
