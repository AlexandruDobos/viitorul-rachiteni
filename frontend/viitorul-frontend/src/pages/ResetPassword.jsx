import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Token invalid sau lipsă.');
        }
    }, [token]);

    const isPasswordStrong = (pwd) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{}[\]:;"'<>,.?/~`|\\])\S{8,}$/.test(pwd);

    const isDisabled =
        !newPassword ||
        !confirmPassword ||
        newPassword !== confirmPassword ||
        !isPasswordStrong(newPassword);

    const handleSubmit = async () => {
        if (newPassword !== confirmPassword) {
            setError('Parolele nu coincid.');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    newPassword,
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Eroare resetare');
            }

            const text = await response.text();
            setSuccess(text);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex justify-center mt-10">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-sm text-center">
                <h2 className="text-xl font-semibold mb-4">Resetare parolă</h2>

                {error && <p className="text-red-600 mb-4">{error}</p>}
                {success && <p className="text-green-600 mb-4">{success}</p>}

                {!success && (
                    <>
                        <div className="relative mb-2">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Noua parolă"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2 text-sm text-gray-600"
                            >
                                {showPassword ? 'Ascunde' : 'Afișează'}
                            </button>
                        </div>
                        {newPassword && !isPasswordStrong(newPassword) && (
                            <p className="text-red-600 text-sm mb-2">
                                Parola nu îndeplinește cerințele
                            </p>
                        )}

                        <div className="relative mb-4">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirmă parola"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-2 text-sm text-gray-600"
                            >
                                {showConfirmPassword ? 'Ascunde' : 'Afișează'}
                            </button>
                        </div>

                        <p className="text-xs text-left mb-4 text-gray-600">
                            🔒 Parola trebuie să aibă minim 8 caractere, o literă mare, una mică, o cifră și un simbol.
                        </p>

                        <button
                            onClick={handleSubmit}
                            className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 disabled:opacity-50"
                            disabled={isDisabled}
                        >
                            Trimite
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
