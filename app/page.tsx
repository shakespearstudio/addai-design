'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full border border-[#1F1F23] bg-[#111113]">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-xs text-[#888890] font-medium tracking-wide">AddAI Design</span>
        </div>

        <h1 className="text-5xl font-semibold tracking-tight leading-tight mb-5">
          办公空间
          <br />
          <span className="text-[#888890]">由 AI 重新设计</span>
        </h1>

        <p className="text-[#888890] text-lg leading-relaxed mb-10 max-w-md mx-auto">
          上传原始平面图，输入需求，AI 以顶尖设计师视角完成空间规划并生成效果图。
        </p>

        <Link href="/new" className="btn-primary inline-block text-sm">
          开始新项目
        </Link>

        <div className="mt-16 grid grid-cols-3 gap-4 text-left">
          {[
            { step: '01', title: '上传平面图', desc: '支持 JPG、PNG、WebP，最大 10MB' },
            { step: '02', title: 'AI 平面规划', desc: '专业区域分析与空间设计方案' },
            { step: '03', title: '生成效果图', desc: '三个角度的高质量渲染图' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * (i + 1) }}
              className="surface rounded-xl p-5"
            >
              <div className="text-xs text-[#888890] mb-2 font-mono">{item.step}</div>
              <div className="font-medium text-sm mb-1">{item.title}</div>
              <div className="text-xs text-[#888890]">{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </main>
  )
}
