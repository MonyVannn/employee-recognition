import { Inter } from "next/font/google";
import "./globals.css";
import { ApolloWrapper } from "@/components/ApolloWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Employee Recognition System",
  description: "A real-time employee recognition platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
