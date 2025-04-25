import "./globals.css";

export const metadata = {
  title: "Cloud LMS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
