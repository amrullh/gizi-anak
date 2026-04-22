"use client";

import Link from 'next/link'
import 'leaflet/dist/leaflet.css';
import Button from '@/components/ui/Button'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { usePublishedArticles } from '@/hooks/usePublishedArticles'
import Card from '@/components/ui/Card'
import Image from 'next/image'

export default function Home() {
  const { articles, loading } = usePublishedArticles();
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#FDFCF0] text-gray-900 overflow-x-hidden font-sans">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 5 Q25 15 20 25 Q15 15 20 5' fill='%2322c55e' /%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}
      />

      <motion.div style={{ y: y1 }} className="absolute top-20 -right-20 w-96 h-96 bg-green-200 rounded-full blur-[100px] opacity-30 pointer-events-none" />
      <motion.div style={{ y: y2 }} className="absolute top-1/2 -left-20 w-80 h-80 bg-pink-200 rounded-full blur-[100px] opacity-30 pointer-events-none" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-sm group-hover:rotate-6 transition-transform">
              <Image src="/icons/icon.png" alt="Logo" fill className="object-cover" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-green-800">MONIKEL</span>
          </Link>
          <Link href="/login" className="bg-green-600 text-white px-7 py-2.5 rounded-full font-medium hover:bg-green-700 transition-all shadow-md">
            Login
          </Link>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-6 py-12 md:py-24">

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-6">
              <span className="animate-bounce">🍃</span> Pemanfaatan Superfood Kelor
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-gray-800">
              Cegah Stunting dengan <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-pink-500">
                Kekuatan Kelor
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              <strong>MONIKEL</strong> membantu ibu memantau tumbuh kembang bayi secara akurat dan memberikan edukasi nutrisi berbasis tanaman Kelor.
            </p>
            <Link href="/login">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 text-lg rounded-2xl shadow-xl shadow-green-200 transition-all">
                Mulai Monitoring
              </Button>
            </Link>
          </motion.div>

          {/* Visual Container REVISI: Border & Fit Image */}
          <div className="relative flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative w-full aspect-square max-w-[520px] bg-white rounded-[3.5rem] p-3 shadow-2xl border-[12px] border-white overflow-visible"
            >
              {/* Inner Background with Gradient */}
              <div className="relative w-full h-full rounded-[2.8rem] bg-gradient-to-b from-pink-100 to-green-50 overflow-hidden flex items-center justify-center">
                <Image
                  src="/icons/pregnant.png"
                  alt="Ibu Hamil"
                  fill
                  priority
                  className="object-contain p-10 drop-shadow-xl"
                />

                {/* Floating Leaf INSIDE the box */}
                <motion.div
                  animate={{ rotate: [0, 5, 0], y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-6 right-6 w-24 h-24 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-green-100 z-10"
                >
                  <span className="text-5xl">🍃</span>
                </motion.div>
              </div>

              {/* Status Badge OVERLAPPING the border slightly */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3 border border-pink-50">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center text-2xl">🍼</div>
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Update Status</div>
                  <div className="text-sm font-bold text-gray-800">Gizi Bayi Optimal</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Artikel Section */}
        <div className="mb-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-bold text-gray-800">Edukasi Nutrisi</h2>
              <p className="text-lg text-gray-500 mt-2">Informasi terpercaya untuk Ibu & Buah Hati</p>
            </div>
            <Link href="/articles" className="text-green-600 font-bold hover:underline">Lihat Semua →</Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-3xl" />)}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {articles.slice(0, 3).map((article) => (
                <Link key={article.id} href={`/articles/${article.id}`}>
                  <Card className="h-full hover:shadow-2xl transition-all border-none bg-white rounded-3xl overflow-hidden group">
                    <div className="p-8">
                      <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-lg">{article.category}</span>
                      <h3 className="text-2xl font-bold my-4 line-clamp-2 text-gray-800 group-hover:text-green-700">{article.title}</h3>
                      <p className="text-gray-500 line-clamp-3 mb-6 leading-relaxed text-sm">
                        {article.content.replace(/<[^>]*>/g, '')}
                      </p>
                      <div className="flex items-center justify-between pt-6 border-t border-gray-50 text-sm font-medium">
                        <span className="text-gray-400">{article.publishedAt?.toLocaleDateString('id-ID')}</span>
                        <span className="text-green-600">Baca Selengkapnya</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Statistik */}
        <div ref={statsRef} className="bg-white rounded-[40px] p-12 shadow-sm border border-gray-50 grid grid-cols-2 md:grid-cols-4 gap-8 mb-32">
          {[
            { label: 'Ibu Terbantu', value: '', icon: '🤰' },
            { label: 'Desa Binaan', value: '', icon: '🏡' },
            { label: 'Konselor Gizi', value: '', icon: '👩‍⚕️' },
            { label: 'Resep Kelor', value: '', icon: '🥗' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl mb-4">{stat.icon}</div>
              <div className="text-4xl font-black text-gray-800">
                {statsVisible ? <AnimatedNumber value={parseInt(stat.value)} suffix={stat.value.includes('K') ? 'K+' : '+'} /> : '0'}
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter mt-2">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="relative bg-green-900 rounded-[3rem] p-12 md:p-20 text-center overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 pointer-events-none">
            <span className="text-[200px]">🍃</span>
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
              Mulai Masa Depan <br /> Sehat Bersama Kami
            </h2>
            <Link href="/login">
              <Button className="bg-pink-500 text-white hover:bg-white-600 px-12 py-4 text-xl font-bold rounded-2xl shadow-xl">
                Buka Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-12 text-center bg-white/30">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Image src="/icons/icon.png" alt="Logo" width={28} height={28} />
          <span className="font-bold text-gray-800">MONIKEL 2026</span>
        </div>
        <p className="text-gray-400 text-sm">© 2026 Dikelola oleh Tim Peneilitian Politeknik Kesehatan Palu.</p>
      </footer>
    </div>
  )
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = value / totalSteps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);
  return <>{count}{suffix}</>;
}