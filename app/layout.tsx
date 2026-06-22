import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ghost AI",
  description: "Ghost AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider
          appearance={{
            theme: dark,
            variables: {
              colorBackground: "var(--background)",
              colorForeground: "var(--foreground)",
              colorInput: "var(--input)",
              colorInputForeground: "var(--foreground)",
              colorMutedForeground: "var(--muted-foreground)",
              colorPrimary: "var(--primary)",
              colorDanger: "var(--destructive)",
              colorRing: "var(--ring)",
              colorBorder: "var(--border)",
              borderRadius: "var(--radius)",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
