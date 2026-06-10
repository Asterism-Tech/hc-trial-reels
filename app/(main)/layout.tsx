import Sidebar from '@/components/ui/Sidebar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-14 lg:ml-56 xl:ml-60 min-w-0">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
