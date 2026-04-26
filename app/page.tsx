'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AnimatedSphere } from './components/AnimatedSphere'

const words = ['规划', '分析', '设计', '呈现']

const steps = [
  {
    num: '01',
    title: '上传平面图',
    desc: '拖拽 CAD 导出图或手机拍摄的平面图，AI 自动识别结构柱网、开间与采光条件。',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    num: '02',
    title: '填写设计需求',
    desc: '告诉 AI 使用人数、空间类型、品牌风格，或直接上传需求说明书。',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: '获得规划方案',
    desc: '专业的区域划分、动线策略、声学分区、设计关键动作，所有内容结构化输出。',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    num: '04',
    title: '生成效果图',
    desc: '确认方案后，AI 以三个角度生成高质量渲染效果图，可直接用于客户提案。',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
  },
]

const marqueeItems = [
  { value: '30秒', label: '完成空间规划', suffix: '' },
  { value: '3个', label: '渲染角度同时生成', suffix: '' },
  { value: '500㎡', label: '办公空间精准分析', suffix: '' },
  { value: '7类', label: '功能区自由组合', suffix: '' },
]

export default function Home() {
  const [wordIndex, setWordIndex] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    const t = setInterval(() => setWordIndex(p => (p + 1) % words.length), 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <main className="relative min-h-screen overflow-x-hidden noise-overlay">
      {/* Grid lines */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        {[...Array(6)].map((_, i) => (
          <div key={`h${i}`} className="absolute h-px bg-white/10"
            style={{ top: `${(i + 1) * 14.28}%`, left: 0, right: 0 }} />
        ))}
        {[...Array(10)].map((_, i) => (
          <div key={`v${i}`} className="absolute w-px bg-white/10"
            style={{ left: `${(i + 1) * 9.09}%`, top: 0, bottom: 0 }} />
        ))}
      </div>

      {/* Nav */}
      <nav className={`relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 transition-all duration-700
        ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-sm font-medium tracking-tight">AddAI Design</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-xs font-mono text-[#888890]">由 Claude Vision 驱动</span>
          <Link href="/new"
            className="text-sm bg-white text-black font-medium px-4 py-2 rounded-full hover:bg-white/90 transition-colors">
            开始使用
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden">
        {/* Sphere */}
        <div className="absolute right-0 lg:right-[-4%] top-1/2 -translate-y-1/2 w-[420px] h-[420px] lg:w-[600px] lg:h-[600px] opacity-60 pointer-events-none">
          <AnimatedSphere />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
          {/* Eyebrow */}
          <div className={`mb-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="inline-flex items-center gap-3 text-sm font-mono text-[#888890]">
              <span className="w-8 h-px bg-white/30" />
              AI 驱动的办公空间设计平台
            </span>
          </div>

          {/* Headline */}
          <div className="mb-12">
            <h1 className={`text-[clamp(2.8rem,9vw,8rem)] font-bold leading-[0.95] tracking-tighter transition-all duration-1000
              ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="block">办公空间</span>
              <span className="block">
                由 AI{' '}
                <span className="relative inline-block text-indigo-400">
                  <span key={wordIndex}>
                    {words[wordIndex].split('').map((char, i) => (
                      <span key={`${wordIndex}-${i}`} className="animate-char-in inline-block"
                        style={{ animationDelay: `${i * 60}ms` }}>
                        {char}
                      </span>
                    ))}
                  </span>
                  <span className="absolute -bottom-1 left-0 right-0 h-2 bg-indigo-500/15 rounded" />
                </span>
              </span>
            </h1>
          </div>

          {/* Sub + CTA */}
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-end">
            <p className={`text-lg lg:text-xl text-[#888890] leading-relaxed max-w-lg transition-all duration-700 delay-200
              ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              上传原始平面图，描述需求，30 秒内获得专业的空间规划方案与三角度渲染效果图。无需设计经验。
            </p>

            <div className={`flex flex-col sm:flex-row items-start gap-3 transition-all duration-700 delay-300
              ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link href="/new"
                className="inline-flex items-center gap-2 bg-white text-black font-medium px-7 h-12 text-sm rounded-full hover:bg-white/90 transition-colors group">
                开始新项目
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <a href="#how"
                className="inline-flex items-center h-12 px-7 text-sm text-[#888890] border border-[#1F1F23] rounded-full hover:border-[#2F2F35] hover:text-white transition-colors">
                了解流程
              </a>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className={`absolute bottom-10 left-0 right-0 overflow-hidden transition-all duration-700 delay-500
          ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex whitespace-nowrap">
            <div className="animate-marquee flex gap-16 px-8">
              {[...marqueeItems, ...marqueeItems].map((item, i) => (
                <div key={i} className="flex items-baseline gap-3 flex-shrink-0">
                  <span className="text-3xl lg:text-4xl font-bold tabular-nums">{item.value}</span>
                  <span className="text-sm text-[#888890]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 py-24 lg:py-32 px-6 lg:px-12 max-w-[1200px] mx-auto">
        <div className="mb-14">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-[#888890] mb-5">
            <span className="w-6 h-px bg-white/30" />
            使用流程
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">四步完成设计全流程</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div key={step.num}
              className="surface rounded-2xl p-6 hover:border-[#2F2F35] transition-colors duration-200 group">
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-mono text-[#888890]">{step.num}</span>
                <span className="text-[#888890] group-hover:text-indigo-400 transition-colors">{step.icon}</span>
              </div>
              <h3 className="font-semibold text-base mb-2">{step.title}</h3>
              <p className="text-sm text-[#888890] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 surface rounded-2xl p-8 lg:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl lg:text-2xl font-bold mb-2">准备好试试了吗？</h3>
            <p className="text-sm text-[#888890]">免费使用，无需注册，上传平面图即可开始。</p>
          </div>
          <Link href="/new"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-7 h-12 text-sm rounded-full transition-colors group">
            开始新项目
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1F1F23] px-6 lg:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span className="text-xs text-[#888890]">AddAI Design</span>
        </div>
        <span className="text-xs text-[#555560] font-mono">Powered by Claude Sonnet · Gemini Imagen</span>
      </footer>
    </main>
  )
}
