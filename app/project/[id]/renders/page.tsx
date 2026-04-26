'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'

interface Render {
  angle: string
  label: string
  image_base64: string
}

export default function RendersPage() {
  const params = useParams()
  const id = params.id as string

  const [renders, setRenders] = useState<Render[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    // 取出之前确认的风格（从 sessionStorage 或默认值）
    const style = sessionStorage.getItem(`style_${id}`) || 'modern_minimalist'
    generate(style)
  }, [id])

  const generate = async (style: string) => {
    setLoading(true)
    setError('')
    setRenders([])

    try {
      const res = await fetch('/api/backend/renders/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ project_id: id, style }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || '生成失败')
      }
      const data = await res.json()
      setRenders(data.renders)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '请求失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const downloadAll = () => {
    renders.forEach((r, i) => {
      const a = document.createElement('a')
      a.href = `data:image/jpeg;base64,${r.image_base64}`
      a.download = `${id}_render_${i + 1}_${r.angle}.jpg`
      a.click()
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[#1F1F23] px-6 py-4 flex items-center gap-3">
        <a href="/" className="text-[#888890] hover:text-white text-sm transition-colors">AddAI Design</a>
        <span className="text-[#1F1F23]">/</span>
        <a href={`/project/${id}/plan`} className="text-[#888890] hover:text-white text-sm transition-colors">平面规划</a>
        <span className="text-[#1F1F23]">/</span>
        <span className="text-sm">效果图</span>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">效果图生成</h1>
          <p className="text-sm text-[#888890]">基于平面规划方案，生成三个角度的空间效果图</p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="surface rounded-xl overflow-hidden"
              >
                <div className="aspect-video bg-[#0F0F11] animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-[#1F1F23] rounded animate-pulse w-2/3" />
                  <div className="h-2 bg-[#1F1F23] rounded animate-pulse w-1/2" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="surface rounded-xl p-8 text-center">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button onClick={() => generate('modern_minimalist')} className="btn-primary text-sm">重试</button>
          </div>
        )}

        {!loading && renders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renders.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="surface rounded-xl overflow-hidden group cursor-pointer"
                onClick={() => setLightbox(r.image_base64)}
              >
                <div className="aspect-video overflow-hidden bg-[#111113]">
                  <img
                    src={`data:image/jpeg;base64,${r.image_base64}`}
                    alt={r.label}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium">{r.label}</p>
                  <p className="text-xs text-[#888890] mt-0.5">点击放大查看</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {loading && (
          <p className="text-center text-sm text-[#888890] mt-8">
            正在并行生成三张效果图，请稍候（约 30–60 秒）…
          </p>
        )}
      </div>

      {/* 底部操作栏 */}
      {!loading && renders.length > 0 && (
        <div className="sticky bottom-0 border-t border-[#1F1F23] bg-[#0A0A0B]/90 backdrop-blur-sm px-8 py-4 flex items-center justify-between">
          <p className="text-sm text-[#888890]">三张效果图已生成完成</p>
          <div className="flex items-center gap-3">
            <button onClick={() => generate('modern_minimalist')} className="btn-ghost text-sm">重新生成</button>
            <motion.button
              onClick={downloadAll}
              whileTap={{ scale: 0.97 }}
              className="btn-primary text-sm"
            >
              下载全部效果图
            </motion.button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={`data:image/jpeg;base64,${lightbox}`}
            alt="效果图"
            className="max-w-full max-h-full rounded-xl shadow-2xl"
          />
          <button className="absolute top-6 right-6 text-white/60 hover:text-white text-2xl" onClick={() => setLightbox(null)}>✕</button>
        </motion.div>
      )}
    </div>
  )
}
