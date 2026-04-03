"use client";

import Link from 'next/link'
import Button from '@/components/ui/Button'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Home() {
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

      {/* Floating medical icons with animation */}
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

      {/* Subtle gradient orbs with parallax */}
      <motion.div
        className="fixed top-0 left-0 w-96 h-96 bg-pink-200 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ x: mousePosition.x * 0.02, y: y1 }}
      />
      <motion.div
        className="fixed bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ x: mousePosition.x * -0.02, y: y2 }}
      />

      {/* Navbar minimalis dengan micro-interactions */}
      <nav className="relative z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
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
            <Link href="/login" className="text-gray-600 hover:text-pink-600 transition-colors relative group">
              Login
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/register"
              className="bg-pink-500 text-white px-5 py-2 rounded-full hover:bg-pink-600 transition-colors shadow-sm hover:shadow-md relative overflow-hidden group"
            >
              <span className="relative z-10">Daftar</span>
              <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative max-w-7xl mx-auto px-6 py-12 md:py-20">
        {/* Hero section dengan heartbeat line */}
        <div className="mb-20 relative">
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
          <p className="text-xl text-gray-600 max-w-2xl mb-8">
            / Aplikasi monitoring gizi anak bersama puskesmas /
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Link href="/register">
              <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 text-lg rounded-full shadow-md transition-all hover:shadow-xl">
                MULAI SEKARANG
              </Button>
            </Link>
          </motion.div>

          {/* Heartbeat graph mini */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block">
            <svg width="200" height="80" viewBox="0 0 200 80">
              <path
                d="M0,40 L20,40 L30,20 L40,60 L50,30 L60,50 L70,35 L80,45 L90,40 L100,40 L110,60 L120,20 L130,40 L140,40 L150,40 L160,40 L170,40 L180,40 L200,40"
                stroke="#f472b6"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="1000"
                  to="0"
                  dur="3s"
                  repeatCount="indefinite"
                  fill="freeze"
                />
              </path>
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f472b6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,40 L200,40" stroke="url(#grad)" strokeWidth="40" fill="none" />
            </svg>
          </div>
        </div>

        {/* Dua kolom fitur dengan card interaktif */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-gray-100 hover:border-pink-200 transition-all"
          >
            <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mb-4 text-3xl group-hover:animate-pulse">
              📊
            </div>
            <h2 className="text-3xl font-bold mb-2">Growth Tracking</h2>
            <p className="text-gray-500 uppercase tracking-wide mb-4 text-sm">PANTAU PERKEMBANGAN</p>
            <p className="text-gray-700">
              Grafik pertumbuhan sesuai standar WHO. Pantau berat badan, tinggi, dan lingkar kepala secara real-time.
            </p>
            <div className="mt-6 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-pink-500"
                initial={{ width: 0 }}
                whileInView={{ width: "75%" }}
                transition={{ duration: 1.5, delay: 0.5 }}
                viewport={{ once: true }}
              />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-gray-100 hover:border-pink-200 transition-all"
          >
            <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mb-4 text-3xl">
              📖
            </div>
            <h2 className="text-3xl font-bold mb-2">Artikel Kesehatan</h2>
            <p className="text-gray-500 uppercase tracking-wide mb-4 text-sm">EDUKASI TERPERCAYA</p>
            <p className="text-gray-700">
              Konten dari tenaga kesehatan profesional. Tips MPASI, imunisasi, dan tumbuh kembang anak.
            </p>
            <div className="mt-6 flex gap-2">
              {[1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-pink-300"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Garis pemisah dengan animasi */}
        <motion.div
          className="border-t border-gray-200 my-16"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        />

        {/* Bagian "Data Akurat & Terpercaya" dengan ikon medis */}
        <div className="mb-20 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <h3 className="text-2xl font-semibold mb-2">Data Akurat & Terpercaya</h3>
            <p className="text-gray-600 max-w-xl">
              Bekerja sama dengan puskesmas dan tenaga kesehatan. Semua data mengacu pada standar WHO dan Kementerian Kesehatan.
            </p>
            <div className="mt-6 flex gap-3">
              {['🩺', '🏥', '📋'].map((icon, i) => (
                <motion.div
                  key={i}
                  className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center text-2xl"
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                >
                  {icon}
                </motion.div>
              ))}
            </div>
          </div>
          <div className="flex-1 relative h-64 w-full">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-100 to-blue-100 rounded-3xl"
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 10, repeat: Infinity }}
            />
            <div className="absolute inset-4 bg-white rounded-2xl shadow-lg flex items-center justify-center text-6xl">
              ❤️
            </div>
          </div>
        </div>

        {/* Statistik dengan animasi counter dan floating icons */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {[
            { label: 'Anak Terdaftar', value: '50K+', icon: '👶' },
            { label: 'Puskesmas', value: '500+', icon: '🏥' },
            { label: 'Tenaga Kesehatan', value: '2K+', icon: '👩‍⚕️' },
            { label: 'Artikel', value: '1K+', icon: '📚' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="text-center p-4 rounded-xl hover:bg-pink-50 transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              <div className="text-4xl mb-2 relative">
                {stat.icon}
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                />
              </div>
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

        {/* Bagian ajakan dengan hati berdenyut */}
        <div className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-3xl p-12 text-center relative overflow-hidden">
          <motion.div
            className="absolute -top-10 -right-10 text-9xl opacity-10"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
          >
            ❤️
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">
            Pantau Tumbuh Kembang <br /> dengan Cinta
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8 relative z-10">
            Bergabunglah dengan ribuan orang tua dan tenaga kesehatan dalam memantau gizi anak Indonesia.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block relative z-10"
          >
            <Link href="/register">
              <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 text-lg rounded-full shadow-md hover:shadow-xl transition-all">
                PELAJARI LEBIH LANJUT
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Footer dengan animasi sederhana */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          © 2026 GiziAnak. Dikelola dengan ❤️ untuk generasi sehat Indonesia.
        </motion.div>
      </footer>
    </div>
  )
}

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
}

function AnimatedNumber({ value, suffix = '' }: AnimatedNumberProps) {
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