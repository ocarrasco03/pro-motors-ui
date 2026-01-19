import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import { useForm } from "react-hook-form";
import type { LoginPayload } from "@/types/types";
import { login } from "@/features/auth/authThunks";
import { AlertCircle, Car, Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  type LoginFormValues = LoginPayload & {
    root?: {
      message: string;
    };
  };

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();
  const onSubmit = async (data: LoginFormValues) => {
    const result = await dispatch(login(data));

    if (login.rejected.match(result)) {
      setError("root", {
        message: result.payload?.message ?? "Credenciales incorrectas",
      });
    }
  };

  console.log("Login Error " + errors.root?.message);

  return (
    <div className="min-h-screen flex">
      {/* Left Section with Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-pulse-soft" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Car className="w-10 h-10" />
            </div>
            <span className="text-3xl font-bold">Pro Motors</span>
          </div>

          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Gestión Inteligente
            <br />
            de Autopartes
          </h1>

          <p className="text-xl text-white/80 max-w-md leading-relaxed">
            Administra tu inventario, listas de precios y proveedores en una
            sola plataforma diseñada para refaccionarias.
          </p>

          <div className="mt-12 flex gap-8">
            <div>
              <div className="text-4xl font-bold">50K+</div>
              <div className="text-white/70">Autopartes</div>
            </div>
            <div>
              <div className="text-4xl font-bold">1,200+</div>
              <div className="text-white/70">Refaccionarias</div>
            </div>
            <div>
              <div className="text-4xl font-bold">99.9%</div>
              <div className="text-white/70">Uptime</div>
            </div>
          </div>
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>
      {/* Right Section with Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-surface">
        <div className="w-full max-w-md">
          {/* Logo and Heading */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-3 bg-gradient-primary rounded-2xl">
              <Car className="w-8 h-8 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-gradient">Pro Motors</span>
          </div>

          <div className="glass-card rounded-3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Bienvenido de nuevo
              </h2>
              <p className="text-muted-foreground">
                Inicia sesión en tu cuenta para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errors.root?.message && (
                <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive animate-fade-in">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{errors.root.message}</span>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Nombre de usuario
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="usuario_promotors"
                  {...register("username", { required: true })}
                  required
                  autoComplete="username"
                  data-testid="username-input"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    {...register("password", { required: true })}
                    required
                    autoComplete="current-password"
                    className="pr-12"
                    data-testid="password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="text-muted-foreground">Recordarme</span>
                </label>
                <a
                  href="#"
                  className="text-primary hover:underline font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
