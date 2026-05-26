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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.BASE_URL ||
      "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    title: "DHEIR International",
    description:
      "Dheir International delivers reliable global shipping, logistics, and warehouse solutions with a focus on speed, security, and customer satisfaction.",
    images: [
      {
        url: "/Dhe-5.png",
        alt: "DHEIR International",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DHEIR International",
    description:
      "Dheir International delivers reliable global shipping, logistics, and warehouse solutions with a focus on speed, security, and customer satisfaction.",
    images: ["/Dhe-5.png"],
  },
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
