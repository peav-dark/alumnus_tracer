import Link from "next/link";
import GoogleSigninButton from "../GoogleSigninButton";
import SigninWithPassword from "../SigninWithPassword";

export default function Signin({
  publicSignupEnabled = true,
  onRequestRegister,
  onSuccess,
  redirectPath,
}: {
  publicSignupEnabled?: boolean;
  onRequestRegister?: () => void;
  onSuccess?: () => void;
  redirectPath?: string | null;
}) {
  return (
    <div className="space-y-6">
      <GoogleSigninButton redirectPath={redirectPath} />

      <div className="my-6 flex items-center justify-center">
        <span className="block h-px w-full bg-stroke dark:bg-dark-3"></span>
        <div className="block min-w-fit bg-white px-3 text-center text-sm font-semibold text-dark-5 dark:bg-dark-2 dark:text-dark-6">
          Or continue with email
        </div>
        <span className="block h-px w-full bg-stroke dark:bg-dark-3"></span>
      </div>

      <div>
        <SigninWithPassword onSuccess={onSuccess} redirectPath={redirectPath} />
      </div>

      {publicSignupEnabled ? (
        <div className="rounded-[22px] border border-stroke bg-gray-1 px-4 py-4 text-center font-medium text-dark-5 dark:border-dark-3 dark:bg-dark-2 dark:text-dark-6">
          Need an alumni account?{" "}
          {onRequestRegister ? (
            <button
              type="button"
              onClick={onRequestRegister}
              className="text-blue-dark"
            >
              Register here
            </button>
          ) : (
            <Link href="/auth/sign-up" className="text-blue-dark">
              Register here
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-[22px] bg-blue-light-5 px-4 py-4 text-center text-sm font-medium text-blue-dark">
          Alumni sign-up is QR-only. Please scan an official registration QR code.
        </div>
      )}
    </div>
  );
}
