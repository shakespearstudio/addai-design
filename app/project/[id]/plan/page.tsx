'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'

interface Zone {
  name: string
  area_sqm: number
  location: string
  rationale: string
}

interface SpacePlan {
  site_analysis: string
  zones: Zone[]
  circulation_strategy: string
  acoustic_strategy: string
  key_design_moves: string[]
  render_description: string
  flags: string[]
}

export default function PlanPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [plan, setPlan] = useState<SpacePlan | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem(`plan_${id}`)
    if (stored) {
      setPlan(JSON.parse(stored))
    } else {
      // 刷新后从后端重新拉取
      fetch(`/api/backend/planning/${id}`)
        .then(r => r.json())
        .then(d => d.plan && setPlan(d.plan))
    }
  }, [id])

  const handleConfirm = async () => {
    setLoading(true)
    sessionStorage.setItem(`confirmed_plan_${id}`, 'true')
    router.push(`/project/${id}/renders`)
  }

  const handleRegenerate = () => {
    router.push('/new')
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#888890]">加载规划方案…</p>
        </div>
      </div>
    )
  }

  const totalArea = plan.zones.reduce((sum, z) => sum + z.area_sqm, 0)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[#1F1F23] px-6 py-4 flex items-center gap-3">
        <a href="/" className="text-[#888890] hover:text-white text-sm transition-colors">AddAI Design</a>
        <span className="text-[#1F1F23]">/</span>
        <span className="text-sm">平面规划方案</span>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 space-y-8">

        {/* 场地分析 */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-xs font-medium text-[#888890] uppercase tracking-widest mb-3">场地分析</h2>
          <div className="surface rounded-xl p-6">
            <p className="text-sm leading-relaxed text-[#cccccc]">{plan.site_analysis}</p>
          </div>
        </motion.section>

        {/* 区域规划 */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-medium text-[#888890] uppercase tracking-widest">区域规划</h2>
            <span className="text-xs text-[#888890]">共 {plan.zones.length} 个区域 · {totalArea} ㎡</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plan.zones.map((zone, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="surface rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-sm">{zone.name}</span>
                  <span className="text-xs text-indigo-400 bg-indigo-600/10 px-2 py-0.5 rounded-md border border-indigo-600/20">
                    {zone.area_sqm} ㎡
                  </span>
                </div>
                <p className="text-xs text-[#888890] mb-2">{zone.location}</p>
                <p className="text-xs text-[#666670] leading-relaxed">{zone.rationale}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 动线 + 声学 */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section>
            <h2 className="text-xs font-medium text-[#888890] uppercase tracking-widest mb-3">动线策略</h2>
            <div className="surface rounded-xl p-5 h-full">
              <p className="text-sm leading-relaxed text-[#cccccc]">{plan.circulation_strategy}</p>
            </div>
          </section>
          <section>
            <h2 className="text-xs font-medium text-[#888890] uppercase tracking-widest mb-3">声学分区</h2>
            <div className="surface rounded-xl p-5 h-full">
              <p className="text-sm leading-relaxed text-[#cccccc]">{plan.acoustic_strategy}</p>
            </div>
          </section>
        </motion.div>

        {/* 设计亮点 */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xs font-medium text-[#888890] uppercase tracking-widest mb-3">核心设计决策</h2>
          <div className="surface rounded-xl p-6 space-y-3">
            {plan.key_design_moves.map((move, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600/20 border border-indigo-600/40 text-indigo-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-[#cccccc] leading-relaxed">{move}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Flags */}
        {plan.flags.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="text-xs font-medium text-[#888890] uppercase tracking-widest mb-3">注意事项</h2>
            <div className="rounded-xl border border-amber-600/30 bg-amber-600/5 p-5 space-y-2">
              {plan.flags.map((flag, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 text-xs mt-0.5">⚠</span>
                  <p className="text-xs text-amber-400/80 leading-relaxed">{flag}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* 底部确认栏 */}
      <div className="sticky bottom-0 border-t border-[#1F1F23] bg-[#0A0A0B]/90 backdrop-blur-sm px-8 py-4 flex items-center justify-between">
        <p className="text-sm text-[#888890]">确认后将进入效果图生成阶段</p>
        <div className="flex items-center gap-3">
          <button onClick={handleRegenerate} className="btn-ghost text-sm">重新规划</button>
          <motion.button
            onClick={handleConfirm}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="btn-primary text-sm"
          >
            {loading ? '跳转中…' : '确认规划，生成效果图'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
