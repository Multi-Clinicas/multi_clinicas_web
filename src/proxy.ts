import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Ignorar todas as rotas de api, _next/static, _next/image, 
     * arquivos de imagem/favicons locais e arquivos publicos do next.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\.png|.*\.svg|.*\.jpg).*)',
  ],
};

export function proxy(req: NextRequest) {
  const url = req.nextUrl;

  // Obter o host da requisição (ex: 'localhost:3000' ou 'clinica.meusistema.com:3000')
  const hostname = req.headers.get('host') || '';

  // Definir o domínio base via variável de ambiente (fallback para localhost:3000 em dev)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  // Analisar se o acesso é no domínio principal ou em um subdomínio
  const isRootDomain = hostname === rootDomain || hostname === `www.${rootDomain}`;

  // Roteamento para Domínio Base — a landing page é renderizada diretamente pela página
  if (isRootDomain) {
    return NextResponse.next();
  }

  // Lógica para Tenants (Subdomínios)
  const subdomain = hostname.replace(`.${rootDomain}`, '');

  if (subdomain && subdomain !== hostname) {
    // Injetar o header 'x-tenant-id' para facilitar o uso no backend/server components
    const response = NextResponse.next();
    response.headers.set('x-tenant-id', subdomain);

    return response;
  }

  return NextResponse.next();
}
