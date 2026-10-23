let appInstance: any = null;

async function getApp() {
  if (appInstance) return appInstance;
  try {
    // @ts-ignore
    const serverPkg = await import('../dist/server.cjs');
    appInstance = serverPkg.app || serverPkg.default || serverPkg;
  } catch (err) {
    try {
      // @ts-ignore
      const serverModule = await import('../server');
      appInstance = serverModule.app || serverModule.default || serverModule;
    } catch (innerErr) {
      console.error('Failed to load Express application:', innerErr);
      throw innerErr;
    }
  }
  return appInstance;
}

export default async function handler(req: any, res: any) {
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/auth')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  const app = await getApp();
  return app(req, res);
}
