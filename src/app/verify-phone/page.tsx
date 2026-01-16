// app/verify-phone/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function VerifyPhonePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const hasSentRef = useRef(false);

  // 1. Check for Phone Number & Send OTP on Mount
  useEffect(() => {
    if (session?.user && !hasSentRef.current) {
      if (!session.user.phone) {
        // Edge Case: User has no phone in Drupal
        setError("No phone number found on your account. Please contact IT support.");
        return;
      }
      
      // Trigger Send
      hasSentRef.current = true;
      sendOtp();
    }
  }, [session]);

  const sendOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('Sending code...');
    
    try {
      const res = await fetch('/api/otp/send', { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to send code');
      
      setMessage('Code sent! Check your messages.');
    } catch (err: any) {
      setError(err.message);
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const otpString = code.join('');

    try {
      // 1. Verify with Backend
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: otpString }),
      });

      if (!res.ok) {
        throw new Error('Invalid code. Please try again.');
      }

      // 2. Unlock Session (Client Side)
      // This flips the 'otpVerified' flag in the active session
      await update({ otpVerified: true });

      // 3. Escape the Jail
      router.push('/');
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Input Helper Logic (same as before)
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#013A33] px-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#00FFCC]/20 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#00463C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-[#002A28]">Two-Factor Check</h1>
          <p className="text-gray-500 text-sm mt-2">
             Sending code to: <span className="font-bold text-[#002A28]">{session.user.phone || 'Unknown'}</span>
          </p>
        </div>

        <form onSubmit={handleVerify}>
          <div className="flex justify-between gap-2 mb-8">
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={loading}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-[#00FFCC] focus:ring-2 focus:ring-[#00FFCC]/20 outline-none transition-all disabled:opacity-50"
              />
            ))}
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}
          
          {message && !error && (
            <div className="mb-6 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2">
              ✓ {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.join('').length < 6}
            className="w-full bg-[#002A28] text-white font-bold py-3 rounded-lg hover:bg-[#00463C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify Identity'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => sendOtp()} 
            disabled={loading}
            className="text-xs text-gray-400 hover:text-[#002A28] font-bold uppercase tracking-wider disabled:opacity-50"
          >
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
}