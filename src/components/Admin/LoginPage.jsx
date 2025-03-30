import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import authService from "../../services/authService";
import { FaLock, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get the page the user was trying to access
  const from = location.state?.from?.pathname || "/admin/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError(t("admin.login.errorEmptyFields"));
      return;
    }

    try {
      setError("");
      setLoading(true);

      await authService.signIn(email, password);

      // Check if user is admin
      const isAdmin = await authService.isAdmin();

      if (!isAdmin) {
        setError(t("admin.login.errorNotAdmin"));
        await authService.signOut();
        setLoading(false);
        return;
      }

      // Redirect to the page they were trying to access
      navigate(from, { replace: true });
    } catch (error) {
      setError(
        error.message === "Invalid login credentials"
          ? t("admin.login.errorInvalidCredentials")
          : t("admin.login.errorGeneric")
      );
      setLoading(false);
    }
  };

  return (
    <section className="py-20 min-h-screen flex items-center justify-center">
      <div className="section-inner max-w-md w-full">
        <div className="bg-light-secondary dark:bg-dark-secondary rounded-lg shadow-custom-light dark:shadow-custom-dark p-8">
          <h1 className="text-2xl font-bold mb-6 text-light-text-primary dark:text-dark-text-primary text-center">
            {t("admin.login.title")}
          </h1>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1"
              >
                {t("admin.login.email")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-light-text-secondary dark:text-dark-text-secondary" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border-2 border-light-secondary dark:border-dark-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent bg-light-primary dark:bg-dark-primary text-light-text-primary dark:text-dark-text-primary"
                  placeholder={t("admin.login.emailPlaceholder")}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1"
              >
                {t("admin.login.password")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-light-text-secondary dark:text-dark-text-secondary" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border-2 border-light-secondary dark:border-dark-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent bg-light-primary dark:bg-dark-primary text-light-text-primary dark:text-dark-text-primary"
                  placeholder={t("admin.login.passwordPlaceholder")}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-light-text-secondary dark:text-dark-text-secondary" />
                  ) : (
                    <FaEye className="text-light-text-secondary dark:text-dark-text-secondary" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-light-accent dark:bg-dark-accent text-dark-primary py-2 px-4 rounded-md font-medium transition-colors ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
              }`}
            >
              {loading ? t("admin.login.loggingIn") : t("admin.login.submit")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              {t("admin.login.adminOnly")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
