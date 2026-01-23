// app/test/page.tsx
'use client'
import { useSession, signIn } from "next-auth/react"

export default function Test() {
  const { data: session } = useSession()
  if (!session) return <button onClick={() => signIn("drupal")}>Login</button>
  
  return <pre className="mt-24">{JSON.stringify(session.user, null, 2)}</pre>
}