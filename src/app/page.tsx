"use client";

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FaSeedling, FaHeartbeat, FaChartLine, FaBookOpen, FaHospital, FaUserNurse } from 'react-icons/fa'

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
    { icon: <FaSeedling />, left: '5%', top: '15%', delay: 0, duration: 6 },
    { icon: <FaHeartbeat />, left: '85%', top: '25%', delay: 2, duration: 7 },
    { icon: '👶', left: '10%', top: '70%', delay: 1, duration: 8 },
    { icon: <FaHospital />, left: '75%', top: '80%', delay: 3, duration: 5 },
    { icon: '🥦', left: '45%', top: '40%', delay: 4, duration: 9 },
    { icon: '🏥', left: '60%', top: '55%', delay: 0.5, duration: 7 },
  ];

  return (
    <div className="relative min-h-screen bg-cream text-moss overflow-x-hidden font-sans">
      {/* Decorative organic pattern background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L35 20 L50 20 L38 30 L43 45 L30 35 L17 45 L22 30 L10 20 L25 20 Z' fill='%231A2A1A' /%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Floating icons with theme colors */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {floatingIcons.map((item, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl md:text-4xl text-moss opacity-10"
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

      {/* Subtle parallax orbs - Moss & Clay theme */}
      <motion.div
        className="fixed top-0 left-0 w-[500px] h-[500px] bg-moss/10 rounded-full blur-[120px] pointer-events-none"
        style={{ x: mousePosition.x * 0.02, y: y1 }}
      />
      <motion.div
        className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-clay/10 rounded-full blur-[120px] pointer-events-none"
        style={{ x: mousePosition.x * -0.02, y: y2 }}
      />

      {/* Navbar Minimalist Editorial */}
      <nav className="relative z-50 border-b border-tan/20 bg-white/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-moss rounded-xl flex items-center justify-center text-white rotate-3 group-hover:rotate-0 transition-transform shadow-lg shadow-moss/20">
              <FaSeedling size={20} />
            </div>
            <span className="text-2xl font-serif italic font-black tracking-tight text-moss">GiziAnak</span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/login" className="text-moss/60 font-bold hover:text-moss transition-colors text-sm uppercase tracking-widest">
              Masuk
            </Link>
            <Link
              href="/register"
              className="bg-clay text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#1A2A1A] transition-all shadow-xl shadow-clay/20 active:scale-95"
            >
              Gabung Sekarang
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative max-w-7xl mx-auto px-6 py-16 md:py-28 text-center md:text-left">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
                <span className="h-px w-12 bg-clay"></span>
                <span className="text-xs font-black uppercase tracking-[0.4em] text-clay">Layanan Kesehatan Digital</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-serif italic font-black text-moss leading-[1.1] mb-8">
                Pantau Gizi <br />
                <span className="text-clay/50 relative inline-block">
                  Si Kecil
                  <svg className="absolute -bottom-4 left-0 w-full opacity-30" height="12" viewBox="0 0 200 12">
                    <path d="M0,6 Q50,0 100,6 T200,6" stroke="#A65D43" strokeWidth="4" fill="none" />
                  </svg>
                </span>
              </h1>
              <p className="text-xl text-moss/50 font-medium max-w-lg mb-10 leading-relaxed italic">
                "Kolaborasi cerdas antara Orang Tua dan Puskesmas untuk memastikan tumbuh kembang optimal generasi masa depan Indonesia."
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/register">
                  <button className="bg-moss text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#2a3a2a] transition-all shadow-2xl shadow-moss/30 active:scale-95">
                    Mulai Monitoring
                  </button>
                </Link>
                <button className="px-10 py-4 rounded-full border-2 border-tan text-moss font-black text-sm uppercase tracking-widest hover:bg-white transition-all">
                  Pelajari Metode
                </button>
              </div>
            </motion.div>
          </div>

          {/* Visual Heartbeat Graph */}
          <div className="relative hidden lg:flex justify-center items-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-clay/10 to-transparent rounded-[60px] rotate-3 -z-10"></div>
            <div className="w-full h-96 bg-white rounded-[60px] shadow-2xl border border-tan/20 p-12 flex flex-col justify-center overflow-hidden relative">
              <FaHeartbeat className="absolute top-10 right-10 text-moss/5 text-9xl" />
              <svg width="100%" height="120" viewBox="0 0 400 120" className="drop-shadow-2xl">
                <motion.path
                  d="M0,60 L40,60 L60,20 L80,100 L100,40 L120,80 L140,55 L160,65 L180,60 L200,60 L220,100 L240,20 L260,60 L400,60"
                  stroke="#1A2A1A"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </svg>
              <div className="mt-8">
                <p className="text-4xl font-serif italic font-black text-moss">98.2%</p>
                <p className="text-xs font-black uppercase tracking-widest text-clay">Akurasi Deteksi Stunting</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-32">
          <motion.div
            whileHover={{ y: -15 }}
            className="group bg-white rounded-[50px] p-10 shadow-2xl shadow-moss/5 border border-tan/10 hover:border-moss/20 transition-all text-left"
          >
            <div className="w-16 h-16 bg-sage/10 rounded-3xl flex items-center justify-center mb-8 text-moss group-hover:bg-moss group-hover:text-white transition-all duration-500">
              <FaChartLine size={28} />
            </div>
            <h2 className="text-4xl font-serif italic font-black text-moss mb-4">Growth Tracking</h2>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-clay mb-6">Pantau Perkembangan</p>
            <p className="text-moss/60 leading-relaxed font-medium">
              Gunakan standar Z-Score WHO untuk memantau berat dan tinggi badan. Data terintegrasi langsung dengan catatan medis Puskesmas.
            </p>
            <div className="mt-8 h-1.5 w-full bg-cream rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-clay"
                initial={{ width: 0 }}
                whileInView={{ width: "85%" }}
                transition={{ duration: 2 }}
                viewport={{ once: true }}
              />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -15 }}
            className="group bg-white rounded-[50px] p-10 shadow-2xl shadow-moss/5 border border-tan/10 hover:border-moss/20 transition-all text-left"
          >
            <div className="w-16 h-16 bg-sage/10 rounded-3xl flex items-center justify-center mb-8 text-moss group-hover:bg-moss group-hover:text-white transition-all duration-500">
              <FaBookOpen size={28} />
            </div>
            <h2 className="text-4xl font-serif italic font-black text-moss mb-4">Edukasi Terpadu</h2>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-clay mb-6">Pengetahuan Terpercaya</p>
            <p className="text-moss/60 leading-relaxed font-medium">
              Akses artikel kesehatan yang dikurasi oleh Dokter dan Bidan profesional. Tips nutrisi, imunisasi, dan pola asuh cerdas.
            </p>
            <div className="mt-8 flex gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="px-4 py-1 rounded-full bg-sage/10 text-[10px] font-black text-moss uppercase tracking-widest">
                  Update #{i}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-32 border-y border-tan/20 py-16">
          {[
            { label: 'Anak Terdaftar', value: '50K+', icon: <FaSeedling /> },
            { label: 'Puskesmas', value: '500+', icon: <FaHospital /> },
            { label: 'Tenaga Kesehatan', value: '2K+', icon: <FaUserNurse /> },
            { label: 'Artikel', value: '1K+', icon: <FaBookOpen /> },
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="text-clay text-2xl mb-4 flex justify-center group-hover:scale-125 transition-transform duration-500">
                {stat.icon}
              </div>
              <div className="text-5xl font-serif italic font-black text-moss mb-2">
                {statsVisible ? (
                  <AnimatedNumber value={parseInt(stat.value)} suffix={stat.value.includes('+') ? '+' : ''} />
                ) : (
                  stat.value
                )}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-moss/30">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="bg-[#1A2A1A] rounded-[60px] p-16 md:p-24 text-center relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(26,42,26,0.3)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-clay/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-5xl md:text-6xl font-serif italic font-black text-white mb-8">
              Wujudkan Generasi <br /> <span className="text-clay">Indonesia Sehat</span>
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto mb-12 text-lg font-medium leading-relaxed">
              Bergabunglah bersama ribuan orang tua lainnya. Pantau tumbuh kembang si kecil dengan cara yang modern, akurat, dan penuh cinta.
            </p>
            <Link href="/register">
              <button className="bg-clay text-white px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white hover:text-moss transition-all shadow-2xl active:scale-95">
                Daftar Secara Gratis
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 text-center text-[10px] font-black uppercase tracking-[0.4em] text-moss/30">
        © 2026 GiziAnak • Mendukung Program Kesehatan Nasional • Makassar, Indonesia
      </footer>
    </div>
  )
}

function AnimatedNumber({ value, suffix = '' }: { value: number, suffix?: string }) {
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