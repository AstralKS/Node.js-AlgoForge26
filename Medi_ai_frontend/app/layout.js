import "./globals.css";

export const metadata = {
  title: "MEDI.AI - AI-Powered Healthcare Monitoring",
  description:
    "Track symptoms, detect risks early, and stay connected with your doctor. AI-powered continuous healthcare monitoring platform.",
  keywords: "healthcare, AI, monitoring, telemedicine, patient care",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
