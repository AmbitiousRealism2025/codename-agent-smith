import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 px-6 py-8 pb-24 lg:px-8 lg:pb-8">
          <div className="mx-auto max-w-4xl">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
