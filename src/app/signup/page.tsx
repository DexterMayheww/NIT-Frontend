// app/signup/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'student', // default
        studentId: '',
        course: '',
        semester: '',
        teacherType: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            // Simulate API call
            // In a real implementation:
            // 1. POST /user/register to create the user account
            // 2. POST to a custom endpoint/entity to store the profile details (Student ID, etc) linked to the user

            console.log("Submitting registration:", formData);

            // For now, prompt the user that registration must be enabled in Drupal.
            // setError("Public registration is disabled. Please contact the administrator.");
            // Mock success for UI demo purposes since we can't actually register without backend config
            setTimeout(() => {
                setSuccess(true);
                setLoading(false);
            }, 1000);

        } catch {
            setError("An error occurred during registration.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#013A33] px-4 py-8">
            <div className="w-full max-w-xl overflow-hidden bg-white shadow-2xl rounded-2xl animate-fadeIn">
                <div className="p-8">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-black text-[#002A28] mb-2">Create Account</h1>
                        <p className="text-gray-500">Join the NITM digital portal</p>
                    </div>

                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* User Type Selection */}
                            <div>
                                <label className="block mb-1 text-sm font-bold text-gray-700">I am a...</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={`cursor-pointer border-2 rounded-xl p-3 text-center transition-all ${formData.userType === 'student' ? 'border-[#00FFCC] bg-[#00FFCC]/10 text-[#002A28] font-bold' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                        <input
                                            type="radio"
                                            name="userType"
                                            value="student"
                                            checked={formData.userType === 'student'}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        Student
                                    </label>
                                    <label className={`cursor-pointer border-2 rounded-xl p-3 text-center transition-all ${formData.userType === 'teacher' ? 'border-[#00FFCC] bg-[#00FFCC]/10 text-[#002A28] font-bold' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                        <input
                                            type="radio"
                                            name="userType"
                                            value="teacher"
                                            checked={formData.userType === 'teacher'}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        Teacher
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-bold text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#00FFCC] focus:ring-2 focus:ring-[#00FFCC]/20 outline-none transition-all"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-bold text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#00FFCC] focus:ring-2 focus:ring-[#00FFCC]/20 outline-none transition-all"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>

                            {/* Conditional Student Fields */}
                            {formData.userType === 'student' && (
                                <div className="p-4 space-y-4 border border-blue-100 bg-blue-50/50 rounded-xl animate-fadeIn">
                                    <div>
                                        <label className="block mb-1 text-xs font-bold tracking-wide text-blue-800 uppercase">Student ID</label>
                                        <input
                                            type="text"
                                            name="studentId"
                                            value={formData.studentId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 transition-all border border-blue-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                            placeholder="e.g. 2023CS001"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-1 text-xs font-bold tracking-wide text-blue-800 uppercase">Course</label>
                                            <input
                                                type="text"
                                                name="course"
                                                value={formData.course}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 transition-all border border-blue-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                placeholder="e.g. B.Tech"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-xs font-bold tracking-wide text-blue-800 uppercase">Semester</label>
                                            <input
                                                type="text"
                                                name="semester"
                                                value={formData.semester}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 transition-all border border-blue-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                placeholder="e.g. 4th"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Conditional Teacher Fields */}
                            {formData.userType === 'teacher' && (
                                <div className="p-4 space-y-4 border border-green-100 bg-green-50/50 rounded-xl animate-fadeIn">
                                    <div>
                                        <label className="block mb-1 text-xs font-bold tracking-wide text-green-800 uppercase">Department / Type</label>
                                        <input
                                            type="text"
                                            name="teacherType"
                                            value={formData.teacherType}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 transition-all border border-green-200 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                            placeholder="e.g. Computer Science"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-sm font-bold text-gray-700">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#00FFCC] focus:ring-2 focus:ring-[#00FFCC]/20 outline-none transition-all pr-12"
                                            placeholder="••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute text-gray-400 transition-colors -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-bold text-gray-700">Confirm</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#00FFCC] focus:ring-2 focus:ring-[#00FFCC]/20 outline-none transition-all pr-12"
                                            placeholder="••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute text-gray-400 transition-colors -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 text-sm text-red-600 rounded-lg bg-red-50">
                                    ⚠️ {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#002A28] text-white font-bold py-3 rounded-lg hover:bg-[#00463C] transition-colors disabled:opacity-50 mt-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>
                    ) : (
                        <div className="py-10 text-center">
                            <div className="mb-6 text-6xl">🎉</div>
                            <h3 className="text-2xl font-black text-[#002A28] mb-2">Welcome Aboard!</h3>
                            <p className="max-w-sm mx-auto mb-8 text-gray-500">Your account has been successfully created. You can now access the portal using your credentials.</p>
                            <Link href="/login" className="inline-block px-8 py-3 bg-[#00FFCC] text-[#002A28] font-bold rounded-xl hover:bg-[#00e6b8] transition shadow-lg hover:shadow-[#00FFCC]/30">
                                Go to Login
                            </Link>
                        </div>
                    )}

                    <div className="pt-6 mt-8 text-sm text-center text-gray-500 border-t border-gray-100">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#002A28] font-bold hover:underline">
                            Sign in here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
