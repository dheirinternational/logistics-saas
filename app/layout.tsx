import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DHEIR International",
  description: "Dheir International delivers reliable global shipping, logistics, and warehouse solutions with a focus on speed, security, and customer satisfaction.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="max-h-dvh h-dvh bg-primary text-primary-text ">
        {children}
        <ToastContainer 
        // position="top-right"
        // toastClassName={() =>
        //   "w-20"
        // }
        // progressClassName={() => "bg-green-400"}
        />
      </body>
    </html>
  );
}
