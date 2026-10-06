import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Castov",
  robots: {
    index: false,
    follow: false
  }
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
