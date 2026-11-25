import type { AppPage } from './types';

export const PAGE_ROUTES: Record<AppPage, string> = {
  'delivery': '/delivery',
  'scheduler': '/scheduler',
  'birthdays': '/birthdays',
  'custom-groups': '/custom-groups',
  'templates': '/templates',
  'status': '/status',
  'logs': '/logs',
  'sms-gateway': '/settings/sms-gateway',
  'birthday-settings': '/settings/birthday',
  'system-messages': '/settings/system-messages',
  'database-indexer': '/settings/database-indexer',
};

export function getPageFromPath(pathname: string): AppPage {
  // Normalize trailing slash and query params
  const cleanPath = pathname.split('?')[0].split('#')[0];
  const path = cleanPath.length > 1 && cleanPath.endsWith('/') ? cleanPath.slice(0, -1) : cleanPath;

  switch (path) {
    case '':
    case '/':
    case '/delivery':
      return 'delivery';
    case '/scheduler':
    case '/scheduled-messages':
      return 'scheduler';
    case '/birthdays':
      return 'birthdays';
    case '/custom-groups':
      return 'custom-groups';
    case '/templates':
      return 'templates';
    case '/status':
      return 'status';
    case '/logs':
    case '/broadcast-logs':
      return 'logs';
    case '/settings/sms-gateway':
    case '/sms-gateway':
      return 'sms-gateway';
    case '/settings/birthday':
    case '/birthday-settings':
    case '/settings/birthday-settings':
      return 'birthday-settings';
    case '/settings/system-messages':
    case '/system-messages':
      return 'system-messages';
    case '/settings/database-indexer':
    case '/database-indexer':
      return 'database-indexer';
    default:
      return 'delivery';
  }
}
