"use client";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar>
        <Topbar />
      </Sidebar>
      <main className="py-10 lg:pr-72">
        <div className="px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
