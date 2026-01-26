// app/login/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Auto-detect OAuth errors from URL (e.g., ?error=AccessDenied)
    useEffect(() => {
        const urlError = searchParams.get('error');
        if (urlError) {
            if (urlError === 'AccessDenied') {
                setError('Access denied. Please contact support or check your account permissions.');
            } else if (urlError === 'Callback') {
                setError('Login canceled or failed by the server.');
            } else {
                setError('An authentication error occurred.');
            }
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError('Invalid email or password');
            setLoading(false);
        } else {
            router.push('/');
            router.refresh();
        }
    };

    const handleDrupalLogin = () => {
        setLoading(true);
        // We use the 'drupal' provider defined in auth.ts
        signIn('drupal', { callbackUrl: '/' });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#013A33] px-4">
            <div className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl border border-[#00FFCC]/10">
                <div className="p-8">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-black text-[#002A28] mb-2 tracking-tight">Welcome Back</h1>
                        <p className="text-gray-500 font-medium">Sign in to your portal</p>
                    </div>

                    <button
                        onClick={handleDrupalLogin}
                        disabled={loading}
                        className="group w-full mb-6 flex items-center justify-center gap-3 bg-white border-2 border-[#002A28] text-[#002A28] font-bold py-3.5 rounded-xl hover:bg-[#002A28] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-lg"
                    >
                        <div className="relative w-6 h-6 transition-transform group-hover:scale-110">
                            {/* Assuming drupal-logo is present, typically requires explicit width/height in Next.js if remote, or imported if local. Using a placeholder or fallback logic is safer if the file might be missing. */}
                            <Image 
                                src="/drupal-logo.png" 
                                alt="Drupal" 
                                fill 
                                className="object-contain"
                            />
                        </div>
                        <span>Sign in with College ID</span>
                    </button>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
                        <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest"><span className="bg-white px-3 text-gray-400">Or use email</span></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-[#002A28] uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#00FFCC] focus:ring-4 focus:ring-[#00FFCC]/10 outline-none transition-all font-medium text-gray-800 placeholder:text-gray-400"
                                placeholder="you@nitm.ac.in"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-[#002A28] uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#00FFCC] focus:ring-4 focus:ring-[#00FFCC]/10 outline-none transition-all pr-12 font-medium text-gray-800 placeholder:text-gray-400"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#002A28] transition-colors p-1"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 text-sm font-semibold text-red-800 rounded-xl bg-red-50 border border-red-100 animate-in fade-in slide-in-from-top-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0 text-red-600">
                                    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#002A28] text-white font-bold py-3.5 rounded-xl hover:bg-[#00463C] transition-all duration-300 disabled:opacity-70 disabled:cursor-wait shadow-lg shadow-[#002A28]/20 hover:shadow-xl hover:shadow-[#002A28]/30 hover:-translate-y-0.5"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 text-sm text-center text-gray-500 font-medium">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-[#002A28] font-bold hover:underline hover:text-[#00FFCC] transition-colors">
                            Register here
                        </Link>
                    </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-[#00FFCC] via-[#002A28] to-[#013A33]"></div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        // Suspense is required for useSearchParams in Next.js 13+ App Router client components
        <Suspense fallback={<div className="min-h-screen bg-[#013A33]" />}>
            <LoginForm />
        </Suspense>
    );
}