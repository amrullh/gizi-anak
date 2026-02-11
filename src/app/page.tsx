import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <span className="font-bold text-gray-800">GiziAnak</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="text-gray-600 hover:text-pink-500">Login</Link>
            <Link href="/register" className="bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600">
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Pantau <span className="text-pink-500">Gizi Si Kecil</span>
            <br />dengan <span className="text-blue-500">Cinta</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Aplikasi monitoring gizi anak bersama puskesmas. Pantau perkembangan,
            dapatkan edukasi, dan dukungan profesional.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button>Mulai Sekarang</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">Login Admin</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Fitur Unggulan</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3">Growth Tracking</h3>
            <p className="text-gray-600">Pantau grafik perkembangan sesuai standar WHO</p>
          </Card>
          <Card className="text-center">
            <div className="text-4xl mb-4">📖</div>
            <h3 className="text-xl font-semibold mb-3">Artikel Kesehatan</h3>
            <p className="text-gray-600">Konten edukasi dari tenaga kesehatan terpercaya</p>
          </Card>
          <Card className="text-center">
            <div className="text-4xl mb-4">🏥</div>
            <h3 className="text-xl font-semibold mb-3">Monitoring Puskesmas</h3>
            <p className="text-gray-600">Pantauan profesional oleh tenaga kesehatan</p>
          </Card>
        </div>
      </section>
    </div>
  )
}