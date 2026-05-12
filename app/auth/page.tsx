"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { ArrowLeft, LogIn, Mail, Lock, UserRound, Sparkles, ShieldCheck, Zap } from "lucide-react";
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
      }
    } catch (error: unknown) {
      const authError = getAuthError(error);
      if (authError.code === "auth/invalid-credential" || authError.code === "auth/user-not-found" || authError.code === "auth/wrong-password") {
        setAuthError("Correo o contraseña incorrectos.");
      } else if (authError.code === "auth/admin-account-not-allowed") {
        setAuthError("Ese correo está reservado para administración. Ingresá desde el panel de admin.");
      } else if (authError.code === "auth/email-already-in-use") {
        setAuthError("Este correo ya está registrado.");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm bg-texture-grain">
        <div className="w-16 h-16 border-[8px] border-zinc-900 border-t-emerald-400 animate-spin neo-shadow"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10 w-full bg-warm bg-texture-grain overflow-x-hidden">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.2] pointer-events-none z-0" />

      {/* Floating Decorative Elements */}
      <div className="absolute top-[10%] left-[5%] w-32 h-32 bg-yellow-400 border-4 border-zinc-900 shadow-neo rotate-12 animate-float-slow hidden md:block opacity-40"></div>
      <div className="absolute bottom-[15%] right-[8%] w-40 h-40 bg-rose-400 border-4 border-zinc-900 shadow-neo -rotate-12 animate-float hidden md:block opacity-40"></div>
      <div className="absolute top-[20%] right-[10%] w-24 h-24 bg-sky-400 border-4 border-zinc-900 shadow-neo rotate-45 animate-float-slow hidden lg:block opacity-40"></div>

      <Link
        href="/"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white border-4 border-zinc-900 shadow-neo hover:-translate-y-1 hover:shadow-neo-xl transition-all active:translate-y-1 active:shadow-none group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={4} />
        <span className="font-black uppercase tracking-widest text-xs italic">Inicio</span>
      </Link>

      <div className="w-full max-w-[480px] mt-12 mb-20 relative animate-fade-in-up">
        {/* Shadow layer for the main card */}
        <div className="absolute inset-0 bg-zinc-900 translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4"></div>
        
        {/* Main Card */}
        <div className="relative bg-white border-[4px] border-zinc-900 p-6 md:p-10 z-10">
          {/* Header Accent */}
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-400 border-b-4 border-zinc-900"></div>

          <div className="flex flex-col items-center text-center">
            {/* Logo/Icon Container */}
            <div className="relative mb-8 mt-2">
              <div className="w-20 h-20 bg-emerald-400 border-4 border-zinc-900 flex items-center justify-center shadow-neo rotate-6 group-hover:rotate-0 transition-transform">
                <LogIn className="w-10 h-10 text-zinc-900" strokeWidth={4} />
              </div>
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 border-4 border-zinc-900 flex items-center justify-center animate-bounce-subtle">
                <Zap className="w-4 h-4 text-zinc-900 fill-zinc-900" />
              </div>
            </div>

            <h1 className="text-4xl font-black text-zinc-900 mb-2 uppercase tracking-tight italic">
              {verificationStep ? "Verifica" : isLogin ? "¡Hola!" : "Unite"}
            </h1>
            <p className="text-sm font-bold text-zinc-500 mb-8 max-w-[340px] leading-relaxed">
              {verificationStep 
                ? `Ingresá el código enviado a ${email}.`
                : isLogin 
                ? "Entrá para guardar tus materias, ver apuntes y participar de la comunidad." 
                : "Crea tu cuenta y empezá a trackear tu progreso de una forma épica."}
            </p>

            {authError && (
              <div className="w-full bg-rose-100 border-4 border-zinc-900 text-rose-600 text-xs font-black p-4 mb-6 text-left shadow-neo animate-wiggle uppercase tracking-wider flex items-center gap-3">
                <div className="bg-rose-600 p-1 text-white">
                  <Lock className="w-3 h-3" strokeWidth={4} />
                </div>
                <span>{authError}</span>
              </div>
            )}

            {resetEmailSent && (
              <div className="w-full bg-emerald-100 border-4 border-zinc-900 text-emerald-600 text-xs font-black p-4 mb-6 text-left shadow-neo animate-fade-in uppercase tracking-wider flex items-center gap-3">
                <div className="bg-emerald-600 p-1 text-white">
                  <ShieldCheck className="w-3 h-3" strokeWidth={4} />
                </div>
                <span>¡Email enviado! Revisá tu bandeja.</span>
              </div>
            )}

            {verificationStep ? (
              <form onSubmit={handleVerifyOtp} className="w-full space-y-6 mb-4">
                <div className="flex justify-center gap-2 md:gap-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      key={index}
                      ref={el => { otpInputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      className="w-10 h-14 md:w-12 md:h-16 bg-zinc-50 border-[4px] border-zinc-900 text-center text-2xl outline-none transition-all focus:bg-emerald-50 focus:border-emerald-500 focus:shadow-[4px_4px_0px_0px_#10B981] text-zinc-900 font-black italic shadow-neo"
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
                  className="w-full neo-btn-primary py-4 text-base"
                >
                  {isFormLoading ? "Verificando..." : "Verificar y Crear"}
                </button>

                <button 
                  type="button"
                  onClick={() => { setVerificationStep(false); setAuthError(""); setOtpCode(""); }}
                  className="w-full text-xs text-zinc-500 hover:text-zinc-900 font-black uppercase tracking-widest transition-colors italic"
                >
                  ← Volver al registro
                </button>
              </form>
            ) : (
              <form onSubmit={handleEmailAuth} className="w-full space-y-5 mb-4">
                {!isLogin && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <UserRound className="h-5 w-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" strokeWidth={3} />
                    </div>
                    <input
                      type="text"
                      placeholder="Tu nombre completo"
                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-[4px] border-zinc-900 text-sm outline-none transition-all focus:bg-white focus:border-emerald-500 focus:shadow-[4px_4px_0px_0px_#10B981] placeholder:text-zinc-400 text-zinc-900 font-bold shadow-neo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={!isLogin}
                      autoComplete="name"
                    />
                  </div>
                )}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Mail className="h-5 w-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" strokeWidth={3} />
                  </div>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-[4px] border-zinc-900 text-sm outline-none transition-all focus:bg-white focus:border-emerald-500 focus:shadow-[4px_4px_0px_0px_#10B981] placeholder:text-zinc-400 text-zinc-900 font-bold shadow-neo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" strokeWidth={3} />
                  </div>
                  <input
                    type="password"
                    placeholder="Tu contraseña secreta"
                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-[4px] border-zinc-900 text-sm outline-none transition-all focus:bg-white focus:border-emerald-500 focus:shadow-[4px_4px_0px_0px_#10B981] placeholder:text-zinc-400 text-zinc-900 font-bold shadow-neo"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                </div>

                {isLogin && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={isResettingPassword}
                      className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-zinc-900 transition-colors disabled:opacity-50 italic underline underline-offset-2 decoration-2"
                    >
                      {isResettingPassword ? "Enviando..." : "¿Olvidaste tu contraseña?"}
                    </button>
                  </div>
                )}

                {!isLogin && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <ShieldCheck className="h-5 w-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" strokeWidth={3} />
                    </div>
                    <input
                      type="password"
                      placeholder="Confirmar tu contraseña"
                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-[4px] border-zinc-900 text-sm outline-none transition-all focus:bg-white focus:border-emerald-500 focus:shadow-[4px_4px_0px_0px_#10B981] placeholder:text-zinc-400 text-zinc-900 font-bold shadow-neo"
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
                  className="w-full neo-btn-primary mt-2 py-4 text-base"
                >
                  {isFormLoading ? "Cargando..." : isLogin ? "Entrar Ahora" : "Crear Mi Cuenta"}
                </button>
              </form>
            )}

            {!verificationStep && (
              <>
                <div className="w-full flex items-center gap-4 my-6">
                  <div className="flex-1 h-1 bg-zinc-900"></div>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic bg-white px-2">O BIEN</span>
                  <div className="flex-1 h-1 bg-zinc-900"></div>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  type="button"
                  className="w-full flex items-center justify-center gap-3 bg-white border-[4px] border-zinc-900 py-4 font-black uppercase tracking-widest text-sm shadow-neo transition-all hover:-translate-y-1 hover:shadow-neo-xl active:translate-y-1 active:shadow-none italic group"
                >
                  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" className="group-hover:scale-110 transition-transform">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  Google
                </button>

                <div className="mt-8 flex flex-col items-center gap-2">
                  <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-wider">
                    {isLogin ? "¿No tenés cuenta?" : "¿Ya tenés cuenta?"}
                  </p>
                  <button 
                    type="button"
                    onClick={() => { setIsLogin(!isLogin); setAuthError(""); setFullName(""); setEmail(""); setPassword(""); setConfirmPassword(""); }}
                    className="w-full py-3 border-4 border-zinc-900 bg-yellow-400 font-black uppercase tracking-widest text-sm shadow-neo hover:-translate-y-1 hover:shadow-neo-xl active:translate-y-1 active:shadow-none transition-all italic"
                  >
                    {isLogin ? "¡Crear Una Ahora!" : "¡Quiero Ingresar!"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Floating Accents */}
        <div className="absolute -top-6 -left-6 w-12 h-12 bg-sky-400 border-4 border-zinc-900 rotate-12 z-0 animate-pulse-soft hidden sm:block"></div>
        <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-rose-400 border-4 border-zinc-900 -rotate-12 z-0 animate-float hidden sm:block"></div>
      </div>
      
      {/* Community trust element */}
      <div className="relative z-10 flex items-center gap-4 py-3 px-6 bg-white border-4 border-zinc-900 shadow-neo animate-fade-in delay-500">
        <Sparkles className="w-5 h-5 text-yellow-500" fill="currentColor" />
        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-900">
          Unite a +500 estudiantes de la UTN
        </span>
      </div>
    </div>
  );
}
