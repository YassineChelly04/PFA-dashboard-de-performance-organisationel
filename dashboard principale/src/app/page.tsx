'use client'

import { redirect } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-tt-bg">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Bienvenue</h1>
        <p className="text-gray-600 mb-8">
          Redirection vers le tableau de bord...
        </p>
        {typeof window !== "undefined" && (
          <script>
            {`window.location.href = '/dashboard/actions-fsi';`}
          </script>
        )}
      </div>
    </div>
  );
}


