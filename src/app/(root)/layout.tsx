import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Oskoro",
};

/** Root layout only for `/`, which redirects to the user's language. */
export default function RedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
