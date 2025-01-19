// app/auth/signin/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Mail, User, ArrowLeft } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

export default function SignIn() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNewUser && !name) {
      setError('Name is required');
      return;
    }
    if (!email) {
      setError('Email is required');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      
      if (!res.ok) throw new Error('Failed to send OTP');
      
      setIsOtpSent(true);
      setError('');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('OTP is required');
      return;
    }
  
    setIsLoading(true);
    try {
      const result = await signIn('email-otp', {
        email,
        otp,
        redirect: false,
        callbackUrl: '/',  // This should be your post-login landing page or dashboard.
      });
  
      if (result?.error) {
        setError(result.error);  // This will display the error message from the backend.
      } else {
        // Successfully signed in or registered
        setError('');
        // Redirect or handle successful login here
        window.location.href = result?.url || '/';  // Redirect to callback URL
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setIsOtpSent(false);
    setOtp('');
    setError('');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#8672FF] to-[#6C4AB6] flex items-center justify-end">
      <div className="bg-white/95 backdrop-blur-sm w-[600px] h-screen px-16 py-12 flex flex-col items-center justify-center shadow-[-20px_0_50px_rgba(0,0,0,0.1)]">
        <h1 className="text-[2.5rem] font-black tracking-tight text-[#2E2B41] mb-12">
          {isNewUser ? 'SIGN UP' : 'LOGIN'}
        </h1>
        
        {error && (
          <div className="w-full max-w-[400px] p-3 mb-4 bg-red-50 text-red-500 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={isOtpSent ? handleVerifyOTP : handleSendOTP} 
              className="w-full max-w-[400px] space-y-4">
          <div className="w-full space-y-4">
            {isNewUser && !isOtpSent && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#8672FF]" />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-[#F3F0FF] bg-[#F3F0FF]/50 focus:outline-none focus:border-[#8672FF] transition-all duration-200"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-[#8672FF]" />
              </div>
              <input
                type="email"
                placeholder="Email"
                className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-[#F3F0FF] bg-[#F3F0FF]/50 focus:outline-none focus:border-[#8672FF] transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isOtpSent}
              />
            </div>

            {isOtpSent && (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="w-full h-14 px-4 rounded-xl border-2 border-[#F3F0FF] bg-[#F3F0FF]/50 focus:outline-none focus:border-[#8672FF] transition-all duration-200"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 text-sm text-[#8672FF] hover:underline"
                  >
                  <ArrowLeft className="h-4 w-4" />
                  Reset
                </button>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-xl bg-[#8672FF] text-white font-semibold uppercase tracking-wide hover:bg-[#7160EA] transition-all duration-200 disabled:opacity-50"
          >
            {isLoading
              ? 'Loading...'
              : isOtpSent
              ? 'Verify OTP'
              : isNewUser
              ? 'Sign Up'
              : 'Login'}
          </button>

          <div className="relative w-full text-center my-8">
            <hr className="border-[#F3F0FF]" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray-400">
              or continue with
            </span>
          </div>

          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full h-14 rounded-xl border-2 border-[#F3F0FF] bg-white hover:bg-[#F3F0FF]/50 transition-all duration-200 flex items-center justify-center gap-3"
          >
            <FcGoogle className="w-6 h-6" />
            <span className="text-[#2E2B41] font-medium">Google</span>
          </button>
        </form>

        <p className="text-[#2E2B41] mt-12">
          {isNewUser ? 'Already have an account?' : 'New here?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsNewUser(!isNewUser);
              resetForm();
            }}
            className="text-[#8672FF] font-medium hover:underline"
          >
            {isNewUser ? 'Login' : 'Sign Up'} here
          </button>
        </p>
      </div>
    </main>
  );
}
