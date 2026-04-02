"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { Eye, EyeOff, LogIn, User, Lock, Phone, Mail } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [fstId, setFstId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fstId || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        fstId,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Identifiants incorrects");
      } else {
        toast.success("Connexion réussie");
        router.push("/dashboard");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc] relative overflow-hidden">
      {/* Background decorative gradient - top right */}
      <div className="absolute top-0 right-0 w-[800px] h-[400px] bg-gradient-to-bl from-[#e8e4f0]/50 via-[#f0f4ff]/30 to-transparent"></div>
      
      {/* Background decorative gradient - bottom left */}
      <div className="absolute bottom-20 left-0 w-[600px] h-[300px] bg-gradient-to-tr from-[#e8f4f8]/40 to-transparent"></div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[400px]">
          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.06)] p-10 space-y-6">
            {/* Logo and Title */}
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <Image
                  src="/logo-tt.png"
                  alt="Tunisie Telecom"
                  width={52}
                  height={52}
                  className="h-13 w-auto"
                  priority
                />
              </div>
              <h1 className="text-[22px] font-bold text-[#00157C] font-[var(--font-plus-jakarta-sans)]">
                Espace Fournisseur – Connexion
              </h1>
              <p className="text-[#6b7280] text-[14px] font-[var(--font-manrope)]">
                Système de gestion des dérangements
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5 pt-2">
              {/* FST ID Field */}
              <div className="space-y-2">
                <label
                  htmlFor="fstId"
                  className="block text-[13px] font-medium text-[#374151] font-[var(--font-plus-jakarta-sans)]"
                >
                  FST ID
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                    size={18}
                  />
                  <input
                    id="fstId"
                    type="text"
                    value={fstId}
                    onChange={(e) => setFstId(e.target.value)}
                    placeholder="Entrez votre identifiant"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#f3f4f6] border-0 rounded-xl focus:ring-2 focus:ring-[#1e3a6e]/20 focus:bg-white outline-none transition-all text-[#1f2937] placeholder-[#9ca3af] text-[14px] font-[var(--font-manrope)]"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-[13px] font-medium text-[#374151] font-[var(--font-plus-jakarta-sans)]"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                    size={18}
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-[#f3f4f6] border-0 rounded-xl focus:ring-2 focus:ring-[#1e3a6e]/20 focus:bg-white outline-none transition-all text-[#1f2937] placeholder-[#9ca3af] text-[14px] font-[var(--font-manrope)]"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#d1d5db] text-[#1e3a6e] focus:ring-[#1e3a6e] focus:ring-offset-0"
                  />
                  <span className="text-[13px] text-[#6b7280] font-[var(--font-manrope)]">Se souvenir de moi</span>
                </label>
                <a
                  href="#"
                  className="text-[13px] text-[#1e3a6e] hover:text-[#2d4a7c] font-medium transition-colors font-[var(--font-plus-jakarta-sans)]"
                >
                  Identifiant oublié ?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1e3a6e] hover:bg-[#162d54] text-white font-semibold py-4 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-[15px] mt-2 font-[var(--font-plus-jakarta-sans)]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Se connecter
                    <LogIn size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Technical Support */}
            <div className="pt-6 space-y-4">
              <p className="text-center text-[13px] text-[#9ca3af] font-[var(--font-manrope)]">
                Besoin d&apos;assistance technique ?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 border border-[#e5e7eb] rounded-full text-[13px] text-[#374151] hover:bg-[#f9fafb] hover:border-[#d1d5db] transition-all font-[var(--font-plus-jakarta-sans)]">
                  <Phone size={15} />
                  1298
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 border border-[#e5e7eb] rounded-full text-[13px] text-[#374151] hover:bg-[#f9fafb] hover:border-[#d1d5db] transition-all font-[var(--font-plus-jakarta-sans)]">
                  <Mail size={15} />
                  Support TT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-6">
        <div className="flex items-center justify-center gap-16 text-[11px] text-[#9ca3af] uppercase tracking-widest font-[var(--font-plus-jakarta-sans)]">
          <span>© 2025 TUNISIE TELECOM</span>
          <span>CONFIDENTIALITÉ</span>
        </div>
      </footer>

      {/* Bottom Gradient Bar */}
      <div className="h-1 bg-gradient-to-r from-[#1e3a6e] via-[#0891b2] to-[#06b6d4]"></div>
    </div>
  );
}
