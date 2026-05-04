import { GoogleIcon } from "@/assets/icons";

export default function GoogleSigninButton({
  text = "Continue with Google",
  redirectPath,
}: {
  text?: string;
  redirectPath?: string | null;
}) {
  const safeRedirectPath = getSafeRedirectPath(redirectPath);
  const href = safeRedirectPath
    ? `/api/auth/google/start?from=${encodeURIComponent(safeRedirectPath)}`
    : "/api/auth/google/start";

  return (
    <a
      href={href}
      className="flex w-full items-center justify-center gap-3.5 rounded-xl border border-stroke bg-gray-1 p-4 font-semibold text-dark transition hover:border-blue/30 hover:bg-blue-light-5 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:border-blue/40 dark:hover:bg-dark"
    >
      <GoogleIcon />
      {text}
    </a>
  );
}

function getSafeRedirectPath(value?: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : null;
}
