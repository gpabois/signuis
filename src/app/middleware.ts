import { getAbility } from '@/actions/authz/getAbility'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const ability = await getAbility()
  
  // Admin panel
  if(request.nextUrl.pathname.startsWith('/admin') && !ability.can("access", "administration"))
    return NextResponse.redirect(new URL('/403', request.url))

  return NextResponse.next()
}