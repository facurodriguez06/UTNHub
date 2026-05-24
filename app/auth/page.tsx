"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { ArrowLeft, LogIn, Mail, Lock, UserRound } from "lucide-react";
import Link from "next/link";

type AuthErrorLike = {
  code?: string;
  message?: string;
};

const getAuthError = (error: unknown): AuthErrorLike =>
  typeof error === "object" && error !== null ? (error as AuthErrorLike) : {};

export default function AuthPage() {
  const { user, loginWithGoogle, loginWithEmail, registerWithEmail, loading, resetPassword } = useAuth();
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // OTP Verification State
  const [verificationStep, setVerificationStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verificationPayload, setVerificationPayload] = useState("");
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (user && !loading) {
      router.push("/planes");
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    try {
      setAuthError("");
      await loginWithGoogle();
    } catch (error: unknown) {
      const authError = getAuthError(error);
      if (authError.code === "auth/admin-account-not-allowed") {
        setAuthError("Ese correo está reservado para administración. Ingresá desde el panel de admin.");
      } else {
        setAuthError("Error al iniciar sesión con Google.");
      }
      console.error(error);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    if (!email || !password || (!isLogin && !confirmPassword) || (!isLogin && !fullName.trim())) {
      setAuthError("Por favor completa todos los campos.");
      return;
    }
    
    // Check password strength on registration
    if (!isLogin) {
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
      if (!strongPasswordRegex.test(password)) {
        setAuthError("La contraseña debe tener al menos 6 caracteres, incluyendo un número, una minúscula y una mayúscula.");
        return;
      }
    } else {
      if (password.length < 6) {
        setAuthError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }
    }

    if (!isLogin && password !== confirmPassword) {
      setAuthError("Las contraseñas no coinciden.");
      return;
    }

    setIsFormLoading(true);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        // Enviar OTP en lugar de registrar directamente
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Ocurrió un error al enviar el código");
        }
        
        // Entrar en fase de verificación
        setVerificationPayload(data.verificationPayload);
        setVerificationStep(true);
        setResendTimer(60);
      }
    } catch (error: unknown) {
      const authError = getAuthError(error);
      if (authError.code === "auth/invalid-credential" || authError.code === "auth/user-not-found" || authError.code === "auth/wrong-password") {
        setAuthError("Correo o contraseña incorrectos.");
      } else if (authError.code === "auth/admin-account-not-allowed") {
        setAuthError("Ese correo está reservado para administración. Ingresá desde el panel de admin.");
      } else if (authError.code === "auth/email-already-in-use") {
        setAuthError("Este correo ya está registrado.");
      } else if (authError.code === "auth/account-deactivated") {
        setAuthError("Esta cuenta ha sido dada de baja por el administrador.");
      } else if (authError.code === "auth/account-deleted") {
        setAuthError("Esta cuenta ha sido eliminada permanentemente por el administrador.");
      } else {
        setAuthError(authError.message || "Ocurrió un error inesperado.");
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setAuthError("Ingresá tu correo para que podamos enviarte el link de recuperación.");
      return;
    }
    
    setIsResettingPassword(true);
    setAuthError("");
    setResetEmailSent(false);

    try {
      await resetPassword(email);
      setResetEmailSent(true);
    } catch (error: unknown) {
      const authError = getAuthError(error);
      if (authError.code === "auth/user-not-found") {
        setAuthError("No encontramos ninguna cuenta con ese correo.");
      } else if (authError.code === "auth/invalid-email") {
        setAuthError("El formato del correo no es válido.");
      } else {
        setAuthError("Error al enviar el correo de recuperación. Reintentá en unos minutos.");
      }
      console.error(error);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (otpCode.length !== 6) {
      setAuthError("El código debe tener exactamente 6 dígitos.");
      return;
    }

    setIsFormLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode, verificationPayload })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Código inválido");
      }

      // El código es correcto. ¡Registrar finalmente el usuario!
      await registerWithEmail(email, password, fullName.trim());
      
    } catch (error: unknown) {
      const authError = getAuthError(error);
      if (authError.code === "auth/email-already-in-use") {
        setAuthError("Este correo ya ha sido registrado.");
      } else {
        setAuthError(authError.message || "Código incorrecto o expirado.");
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isFormLoading) return;
    
    setAuthError("");
    setIsFormLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al enviar el código");
      }
      
      setVerificationPayload(data.verificationPayload);
      setOtpCode("");
      setResendTimer(60);
    } catch (error: unknown) {
      const authError = getAuthError(error);
      setAuthError(authError.message || "Error al reenviar el código.");
    } finally {
      setIsFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8BAA91] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 relative z-10 w-full mb-20">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-1 text-sm text-[#A89F95] hover:text-[#3D3229] transition-colors active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium">Inicio</span>
      </Link>

      <div className="w-full max-w-[420px] bg-white border border-[#EDE6DD] rounded-3xl p-8 shadow-xl shadow-[#EDE6DD]/50 animate-fade-in-up relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-[#F5F0EA] rounded-full blur-2xl opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 bg-[#8BAA91] rounded-full blur-3xl opacity-10 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-[#F5F0EA] rounded-2xl flex items-center justify-center mb-6 shadow-inner text-[#8BAA91]">
            <LogIn className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-extrabold text-[#3D3229] mb-2 tracking-tight">
            {verificationStep ? "Revisa tu correo" : isLogin ? "Bienvenido de nuevo" : "Crea tu cuenta"}
          </h1>
          <p className="text-sm font-medium text-[#A89F95] mb-6 max-w-[280px]">
            {verificationStep 
              ? `Hemos enviado un código seguro de 6 dígitos a ${email}.`
              : isLogin 
              ? "Ingresa para guardar tu progreso académico en el plan interactivo." 
              : "Regístrate para llevar el control de tus materias fácilmente."}
          </p>

          {authError && (
            <div className="w-full bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] text-xs font-bold p-3 rounded-xl mb-4 text-left">
              {authError}
            </div>
          )}

          {resetEmailSent && (
            <div className="w-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-[11px] font-bold p-3 rounded-xl mb-4 text-left animate-fade-in">
              ¡Email enviado! Revisá tu bandeja de entrada (y spam) para restablecer tu contraseña.
            </div>
          )}

          {verificationStep ? (
            <form onSubmit={handleVerifyOtp} className="w-full space-y-3 mb-6 animate-fade-in-up">
              <div className="flex justify-center gap-2 sm:gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <input
                    key={index}
                    ref={el => { otpInputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="w-12 h-14 sm:w-14 sm:h-16 bg-[#FAFAFA] border border-[#EDE6DD] rounded-xl text-center text-2xl outline-none transition-all focus:border-[#8BAA91] focus:ring-2 focus:ring-[#8BAA91]/30 text-[#3D3229] font-bold shadow-sm"
                    value={otpCode[index] && otpCode[index] !== ' ' ? otpCode[index] : ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "").slice(-1);
                      const newOtpArray = otpCode.padEnd(6, ' ').split('');
                      newOtpArray[index] = val || ' ';
                      setOtpCode(newOtpArray.join('').trimEnd());

                      if (val && index < 5) {
                        otpInputRefs.current[index + 1]?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && (!otpCode[index] || otpCode[index] === ' ') && index > 0) {
                        otpInputRefs.current[index - 1]?.focus();
                      }
                      if (e.key === "ArrowLeft" && index > 0) otpInputRefs.current[index - 1]?.focus();
                      if (e.key === "ArrowRight" && index < 5) otpInputRefs.current[index + 1]?.focus();
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
                      if (pasted) {
                         setOtpCode(pasted);
                         otpInputRefs.current[Math.min(pasted.length, 5)]?.focus();
                      }
                    }}
                    required
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isFormLoading || otpCode.length !== 6}
                className="w-full bg-[#8BAA91] hover:bg-[#7CC2A8] text-white font-bold text-sm px-4 py-3.5 rounded-xl transition-all shadow-lg shadow-[#8BAA91]/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {isFormLoading ? "Verificando..." : "Verificar y Crear Cuenta"}
              </button>

              <div className="text-center mt-3">
                {resendTimer > 0 ? (
                  <p className="text-xs text-[#A89F95] font-semibold">
                    ¿No recibiste el código? Reenviar en <span className="text-[#8BAA91] font-bold">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isFormLoading}
                    className="text-xs text-[#8BAA91] hover:text-[#6A8F70] font-extrabold hover:underline transition-all disabled:opacity-50"
                  >
                    Reenviar código de verificación
                  </button>
                )}
              </div>

              <button 
                type="button"
                onClick={() => { setVerificationStep(false); setAuthError(""); setOtpCode(""); }}
                className="w-full text-sm text-[#A89F95] hover:text-[#3D3229] font-medium transition-colors mt-2"
              >
                Cancelar
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailAuth} className="w-full space-y-3 mb-6">
              {!isLogin && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <UserRound className="h-4 w-4 text-[#A89F95]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAFAFA] border border-[#EDE6DD] rounded-xl text-sm outline-none transition-all focus:border-[#8BAA91] focus:ring-1 focus:ring-[#8BAA91]/30 placeholder:text-[#A89F95] text-[#3D3229] font-medium"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    autoComplete="name"
                  />
                </div>
              )}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#A89F95]" />
                </div>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAFAFA] border border-[#EDE6DD] rounded-xl text-sm outline-none transition-all focus:border-[#8BAA91] focus:ring-1 focus:ring-[#8BAA91]/30 placeholder:text-[#A89F95] text-[#3D3229] font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#A89F95]" />
                </div>
                <input
                  type="password"
                  placeholder="Contraseña"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAFAFA] border border-[#EDE6DD] rounded-xl text-sm outline-none transition-all focus:border-[#8BAA91] focus:ring-1 focus:ring-[#8BAA91]/30 placeholder:text-[#A89F95] text-[#3D3229] font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
              </div>

              {isLogin && (
                <div className="flex justify-end pr-1">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isResettingPassword}
                    className="text-[11px] font-bold text-[#8BAA91] hover:text-[#3D3229] transition-colors disabled:opacity-50"
                  >
                    {isResettingPassword ? "Enviando..." : "¿Olvidaste tu contraseña?"}
                  </button>
                </div>
              )}

              {!isLogin && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-[#A89F95]" />
                  </div>
                  <input
                    type="password"
                    placeholder="Confirmar contraseña"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAFAFA] border border-[#EDE6DD] rounded-xl text-sm outline-none transition-all focus:border-[#8BAA91] focus:ring-1 focus:ring-[#8BAA91]/30 placeholder:text-[#A89F95] text-[#3D3229] font-medium"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isLogin}
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isFormLoading}
                className="w-full bg-[#1A1A1A] hover:bg-[#3D3229] text-white font-bold text-sm px-4 py-3.5 rounded-xl transition-all shadow-lg shadow-[#1A1A1A]/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isFormLoading ? "Cargando..." : isLogin ? "Ingresar" : "Registrarme"}
              </button>
            </form>
          )}

          {!verificationStep && (
            <>
              <div className="w-full flex items-center justify-between mb-6">
                <div className="flex-1 h-[1px] bg-[#EDE6DD]"></div>
                <span className="px-3 text-[11px] font-bold text-[#A89F95] uppercase tracking-wider">o con</span>
                <div className="flex-1 h-[1px] bg-[#EDE6DD]"></div>
              </div>

              <button
                onClick={handleGoogleLogin}
                type="button"
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-[#FAFAFA] text-[#3D3229] border border-[#EDE6DD] font-bold text-sm px-4 py-3 rounded-xl transition-all shadow-sm active:scale-[0.98] group"
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" className="group-hover:scale-110 transition-transform">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                Google
              </button>

              <p className="mt-8 text-[13px] text-[#A89F95] font-medium">
                {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
                <button 
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setAuthError(""); setFullName(""); setEmail(""); setPassword(""); setConfirmPassword(""); }}
                  className="text-[#8BAA91] hover:text-[#6A8F70] font-bold hover:underline underline-offset-2 transition-all cursor-pointer"
                >
                  {isLogin ? "Regístrate ahora" : "Ingresa aquí"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
