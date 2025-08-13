import { useEffect } from "react";
import { useRouter } from "next/router";
export default function Index() {
  const router = useRouter();
  useEffect(() => { router.replace("/my-expenses"); }, [router]);
  return null;
}