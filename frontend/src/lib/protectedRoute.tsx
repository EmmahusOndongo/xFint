import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import type { ComponentType, JSX } from "react";

export default function protectedRoute<P extends JSX.IntrinsicAttributes>(Component: ComponentType<P>) {
  return function Guarded(props: P) {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
      if (!isLoading && !user) {
        router.replace("/login");
      }
    }, [isLoading, user, router]);

    if (isLoading || !user) return null;
    return <Component {...props} />;
  };
}