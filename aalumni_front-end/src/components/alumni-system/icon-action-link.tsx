import Link from "next/link";

type IconActionLinkProps = {
  href: string;
  label: string;
  icon: "questions" | "responses" | "view";
  variant?: "primary" | "neutral";
};

export function IconActionLink({
  href,
  label,
  icon,
  variant = "neutral",
}: IconActionLinkProps) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className={
        variant === "primary"
          ? "p-1.5 text-primary transition hover:text-primary/70"
          : "p-1.5 text-dark transition hover:text-primary dark:text-white dark:hover:text-primary"
      }
    >
      <Icon name={icon} />
    </Link>
  );
}

function Icon({ name }: { name: IconActionLinkProps["icon"] }) {
  if (name === "questions") {
    return (
      <svg className="size-4.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M5.833 4.167h8.334M5.833 8.333h8.334M5.833 12.5h5M4.167 17.5h11.666a1.667 1.667 0 0 0 1.667-1.667V4.167A1.667 1.667 0 0 0 15.833 2.5H4.167A1.667 1.667 0 0 0 2.5 4.167v11.666A1.667 1.667 0 0 0 4.167 17.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "responses") {
    return (
      <svg className="size-4.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M4.167 5.833h11.666M4.167 10h7.5M4.167 14.167h5M13.333 13.333l1.667 1.667 3.333-3.333"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg className="size-4.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M2.5 10s2.5-5 7.5-5 7.5 5 7.5 5-2.5 5-7.5 5-7.5-5-7.5-5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
