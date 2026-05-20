import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { AuthProvider } from "@/hooks/useAuth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "City Moto Yard - Location de motos",
  description: "Louez la moto de vos rêves avec City Moto Yard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 italic">CITY MOTO YARD</h3>
                  <p className="text-gray-400">Le spécialiste de la location de motos et scooters en France.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 underline decoration-red-600 underline-offset-4">Location</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="#" className="hover:text-white transition-colors">Toutes nos motos</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Nos agences</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Comment ça marche</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 underline decoration-red-600 underline-offset-4">Compte</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li><Link href="/login" className="hover:text-white transition-colors">Se connecter</Link></li>
                    <li><Link href="/register" className="hover:text-white transition-colors">Créer un compte</Link></li>
                    <li><Link href="/login" className="hover:text-white transition-colors">Mes réservations</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 underline decoration-red-600 underline-offset-4">Contact</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Nous contacter</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
                  </ul>
                </div>
              </div>
              <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} City Moto Yard. Tous droits réservés.
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
