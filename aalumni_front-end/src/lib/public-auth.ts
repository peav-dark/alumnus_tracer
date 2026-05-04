"use client";

import { useEffect, useState } from "react";

export const PUBLIC_AUTH_STORAGE_KEY = "norsu_auth";
export const PUBLIC_AUTH_EVENT = "norsu-auth-state-change";

export type PublicAlumniUser = {
  id?: number;
  name: string;
  firstName: string;
  studentId: string;
  course: string;
  yearGraduated: string;
  email: string;
  location: string;
  employer: string;
  jobTitle: string;
  phone: string;
  username?: string;
  bio?: string;
  profileImageUrl?: string | null;
};

export type PublicAuthState = {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: PublicAlumniUser | null;
};

export type AccountSettings = {
  id?: number;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  username: string;
  phoneNumber: string;
  bio: string;
  schoolId?: string | null;
  profileImageUrl?: string | null;
  roles?: string[];
  primaryRole?: string;
  hasAlumniRecord?: boolean;
  alumni?: {
    id?: number;
    studentNumber?: string | null;
    fullName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    emailAddress?: string | null;
    contactNumber?: string | null;
    homeAddress?: string | null;
    province?: string | null;
    college?: string | null;
    course?: string | null;
    degreeProgram?: string | null;
    yearGraduated?: number | string | null;
    employmentStatus?: string | null;
    companyName?: string | null;
    jobTitle?: string | null;
  } | null;
};

const emptyAuthState: PublicAuthState = {
  isLoggedIn: false,
  isLoading: false,
  user: null,
};

const loadingAuthState: PublicAuthState = {
  isLoggedIn: false,
  isLoading: true,
  user: null,
};

let authSyncPromise: Promise<PublicAuthState> | null = null;

export function getStoredAuthState(): PublicAuthState {
  if (typeof window === "undefined") {
    return emptyAuthState;
  }

  try {
    const stored = window.localStorage.getItem(PUBLIC_AUTH_STORAGE_KEY);

    if (!stored) {
      return emptyAuthState;
    }

    const parsed = JSON.parse(stored) as Partial<PublicAuthState>;

    return parsed.isLoggedIn && parsed.user
      ? { isLoggedIn: true, isLoading: false, user: normalizeStoredUser(parsed.user) }
      : emptyAuthState;
  } catch {
    window.localStorage.removeItem(PUBLIC_AUTH_STORAGE_KEY);
    return emptyAuthState;
  }
}

export function setStoredAuthState(user: PublicAlumniUser) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    PUBLIC_AUTH_STORAGE_KEY,
    JSON.stringify({ isLoggedIn: true, user }),
  );
  window.dispatchEvent(new Event(PUBLIC_AUTH_EVENT));
}

export function clearStoredAuthState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PUBLIC_AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(PUBLIC_AUTH_EVENT));
}

export function syncAuthStateFromApi() {
  if (authSyncPromise) {
    return authSyncPromise;
  }

  authSyncPromise = resolveAuthStateFromApi().finally(() => {
    authSyncPromise = null;
  });

  return authSyncPromise;
}

async function resolveAuthStateFromApi() {
  try {
    const response = await fetch("/api/account/settings", { cache: "no-store" });
    const body = (await response.json().catch(() => ({}))) as {
      item?: AccountSettings;
    };

    if (!response.ok || !body.item) {
      if (response.status === 401) {
        clearStoredAuthState();
        return emptyAuthState;
      }

      return { ...getStoredAuthState(), isLoading: false };
    }

    if (!isAlumniAccount(body.item)) {
      clearStoredAuthState();
      return emptyAuthState;
    }

    const user = accountToPublicUser(body.item, getStoredAuthState().user);
    setStoredAuthState(user);

    return { isLoggedIn: true, isLoading: false, user } satisfies PublicAuthState;
  } catch {
    return { ...getStoredAuthState(), isLoading: false };
  }
}

export function accountToPublicUser(
  account: AccountSettings,
  existing?: PublicAlumniUser | null,
): PublicAlumniUser {
  const alumni = account.alumni;
  const name = alumni?.fullName || account.fullName || existing?.name || "NORSU Alumni";
  const [firstName] = name.split(/\s+/);

  return {
    id: alumni?.id ?? account.id ?? existing?.id,
    name,
    firstName: alumni?.firstName || account.firstName || firstName || existing?.firstName || "Alumni",
    studentId: alumni?.studentNumber || account.schoolId || existing?.studentId || "Not set",
    course: alumni?.degreeProgram || alumni?.course || existing?.course || "Not set",
    yearGraduated: String(alumni?.yearGraduated || existing?.yearGraduated || "Not set"),
    email: alumni?.emailAddress || account.email || existing?.email || "Not set",
    location: alumni?.province || alumni?.homeAddress || existing?.location || "Not set",
    employer: alumni?.companyName || existing?.employer || "Not set",
    jobTitle: alumni?.jobTitle || existing?.jobTitle || "Not set",
    phone: alumni?.contactNumber || account.phoneNumber || existing?.phone || "Not set",
    username: account.username,
    bio: account.bio,
    profileImageUrl: account.profileImageUrl ?? existing?.profileImageUrl ?? null,
  };
}

export function isAlumniAccount(account: AccountSettings) {
  const roles = account.roles ?? [];

  if (roles.includes("ROLE_ADMIN") || roles.includes("ROLE_STAFF")) {
    return false;
  }

  return (
    account.primaryRole === "alumni" ||
    account.hasAlumniRecord === true ||
    roles.includes("ROLE_ALUMNI")
  );
}

export function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "NA"
  );
}

export function usePublicAuthState({ sync = true }: { sync?: boolean } = {}) {
  const [authState, setAuthState] = useState<PublicAuthState>(() => {
    if (!sync) {
      return emptyAuthState;
    }

    const storedState = getStoredAuthState();

    return storedState.isLoggedIn
      ? { ...storedState, isLoading: true }
      : loadingAuthState;
  });

  useEffect(() => {
    if (sync) {
      const storedState = getStoredAuthState();

      setAuthState(
        storedState.isLoggedIn
          ? { ...storedState, isLoading: true }
          : loadingAuthState,
      );
      void syncAuthStateFromApi().then(setAuthState);
    } else {
      setAuthState(getStoredAuthState());
    }

    const updateFromStorage = () =>
      setAuthState({ ...getStoredAuthState(), isLoading: false });
    const updateFromOtherTab = (event: StorageEvent) => {
      if (event.key === PUBLIC_AUTH_STORAGE_KEY) {
        updateFromStorage();
      }
    };

    window.addEventListener(PUBLIC_AUTH_EVENT, updateFromStorage);
    window.addEventListener("storage", updateFromOtherTab);

    return () => {
      window.removeEventListener(PUBLIC_AUTH_EVENT, updateFromStorage);
      window.removeEventListener("storage", updateFromOtherTab);
    };
  }, [sync]);

  return authState;
}

function normalizeStoredUser(user: Partial<PublicAlumniUser>): PublicAlumniUser {
  return {
    name: user.name || "NORSU Alumni",
    firstName: user.firstName || user.name?.split(/\s+/)[0] || "Alumni",
    studentId: user.studentId || "Not set",
    course: user.course || "Not set",
    yearGraduated: user.yearGraduated || "Not set",
    email: user.email || "Not set",
    location: user.location || "Not set",
    employer: user.employer || "Not set",
    jobTitle: user.jobTitle || "Not set",
    phone: user.phone || "Not set",
    id: user.id,
    username: user.username,
    bio: user.bio,
    profileImageUrl: user.profileImageUrl ?? null,
  };
}
