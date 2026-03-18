export const metadata = { title: "MASTRO MONTAGGI", description: "App montatori" };
export default function Layout({ children }: any) {
  return (
    <html lang="it">
      <body style={{ margin: 0, padding: 0, background: "#1A1A1C" }}>
        {children}
      </body>
    </html>
  );
}