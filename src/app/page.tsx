"use client";

import Link from 'next/link'
import Button from '@/components/ui/Button'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { usePublishedArticles } from '@/hooks/usePublishedArticles'
import Card from '@/components/ui/Card'

export default function Home() {
  const { articles, loading } = usePublishedArticles();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 100]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  const floatingIcons = [
    { icon: '❤️', left: '5%', top: '15%', delay: 0, duration: 6 },
    { icon: '🩺', left: '85%', top: '25%', delay: 2, duration: 7 },
    { icon: '👶', left: '10%', top: '70%', delay: 1, duration: 8 },
    { icon: '🌡️', left: '75%', top: '80%', delay: 3, duration: 5 },
    { icon: '💊', left: '45%', top: '40%', delay: 4, duration: 9 },
    { icon: '🫀', left: '60%', top: '55%', delay: 0.5, duration: 7 },
  ];

  return (
    <div className="relative min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Decorative medical pattern background */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L35 20 L50 20 L38 30 L43 45 L30 35 L17 45 L22 30 L10 20 L25 20 Z' fill='%23f472b6' /%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Floating medical icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {floatingIcons.map((item, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl md:text-4xl opacity-20"
            style={{ left: item.left, top: item.top }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-pink-500 rounded-full group-hover:scale-110 transition-transform"></div>
              <div className="absolute inset-0.5 bg-white rounded-full flex items-center justify-center">
                <span className="text-pink-500 font-bold">G</span>
              </div>
            </div>
            <span className="text-xl font-semibold text-gray-800">GiziAnak</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors shadow-sm hover:shadow-md"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-6 py-12 md:py-20">
        {/* Hero section */}
        <div className="mb-20 relative text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-4"
          >
            Pantau Gizi <br />
            <span className="text-pink-500 relative">
              Si Kecil
              <svg className="absolute -bottom-3 left-0 w-full" height="10" viewBox="0 0 200 10">
                <path d="M0,5 Q25,0 50,5 T100,5 T150,5 T200,5" stroke="#f472b6" strokeWidth="2" fill="none" strokeDasharray="5 5">
                  <animate attributeName="stroke-dashoffset" from="0" to="20" dur="1s" repeatCount="indefinite" />
                </path>
              </svg>
            </span>
          </motion.h1>
          <p className="text-xl text-gray-600 max-w-2xl mb-8 mx-auto md:mx-0">
            Aplikasi monitoring gizi anak terintegrasi dengan tenaga kesehatan untuk memastikan tumbuh kembang optimal.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Link href="/login">
              <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 text-lg rounded-full shadow-md transition-all hover:shadow-xl">
                MASUK SEKARANG
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Section Artikel (Public) */}
        <div className="mb-24">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Edukasi Kesehatan</h2>
              <p className="text-gray-500">Informasi terpercaya dari tenaga kesehatan profesional</p>
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {articles.slice(0, 3).map((article) => (
                /* REVISI: Link sekarang mengarah ke route publik /articles/[id] */
                <Link key={article.id} href={`/articles/${article.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-pink-50">
                    <div className="p-6">
                      <span className="text-xs font-bold text-pink-500 uppercase tracking-wider">{article.category}</span>
                      <h3 className="text-xl font-bold mt-2 mb-3 line-clamp-2">{article.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {article.content.replace(/<[^>]*>/g, '')}
                      </p>
                      <div className="flex items-center text-xs text-gray-400">
                        <span>{article.publishedAt?.toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Fitur Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:border-pink-200 transition-all"
          >
            <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mb-4 text-3xl">
              📊
            </div>
            <h2 className="text-3xl font-bold mb-2">Growth Tracking</h2>
            <p className="text-gray-700">
              Grafik pertumbuhan sesuai standar WHO. Pantau berat badan, tinggi, dan lingkar kepala secara real-time.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:border-pink-200 transition-all"
          >
            <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mb-4 text-3xl">
              📖
            </div>
            <h2 className="text-3xl font-bold mb-2">Konsultasi Terpadu</h2>
            <p className="text-gray-700">
              Terhubung langsung dengan data di puskesmas sehingga tenaga kesehatan dapat memberikan tindak lanjut yang tepat.
            </p>
          </motion.div>
        </div>

        {/* Statistik */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {[
            { label: 'Anak Terdaftar', value: '50K+', icon: '👶' },
            { label: 'Puskesmas', value: '500+', icon: '🏥' },
            { label: 'Tenaga Kesehatan', value: '2K+', icon: '👩‍⚕️' },
            { label: 'Artikel', value: '1K+', icon: '📚' },
          ].map((stat, i) => (
            <motion.div key={i} className="text-center p-4 rounded-xl hover:bg-pink-50 transition-colors">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-800">
                {statsVisible ? (
                  <AnimatedNumber value={parseInt(stat.value)} suffix={stat.value.includes('+') ? '+' : ''} />
                ) : (
                  stat.value
                )}
              </div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-3xl p-12 text-center relative overflow-hidden">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Mulai Pantau Tumbuh Kembangnya</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Hubungi puskesmas terdekat untuk mendapatkan akses akun GiziAnak dan mulai pantau kesehatan buah hati Anda.
          </p>
          <Link href="/login">
            <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 text-lg rounded-full shadow-md">
              MASUK KE DASHBOARD
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        © 2026 GiziAnak. Dikelola dengan ❤️ untuk generasi sehat Indonesia.
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