export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">
        Bem-vindo à Nossa Loja
      </h1>
      <p className="text-center text-gray-600 text-lg">
        Projeto E-commerce Full-stack com Next.js + Prisma + Stripe
      </p>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Next.js 14</h2>
          <p className="text-gray-600">SSR/SSG e App Router</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Prisma ORM</h2>
          <p className="text-gray-600">Type-safe database queries</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Stripe</h2>
          <p className="text-gray-600">Pagamentos integrados</p>
        </div>
      </div>
    </div>
  )
}