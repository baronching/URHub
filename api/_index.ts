import app from '../server';

export default function handler(req: any, res: any) {
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/auth')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
}
