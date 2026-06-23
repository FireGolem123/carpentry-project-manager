import { Nav } from "./Nav";

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-6 w-full flex-1">
        {children}
      </main>
    </>
  );
}
