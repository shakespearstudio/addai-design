'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const SPACE_TYPES = [
  { id: 'open_office', label: '开放办公区' },
  { id: 'reception', label: '前厅接待区' },
  { id: 'meeting_rooms', label: '会议室' },
  { id: 'focus_rooms', label: '专注工作间' },
  { id: 'lounge', label: '休闲社交区' },
  { id: 'executive', label: '高管区' },
]

const STYLES = [
  { id: 'modern_minimalist', label: '现代简约', desc: 'Linear / Vercel 风格' },
  { id: 'high_tech', label: '科技感', desc: '玻璃 + 结构暴露' },
  { id: 'boutique', label: '精品酒店', desc: '奢华 + 艺术感' },
]

export default function NewProject() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    project_name: '',
    total_area: 1000,
    headcount: 50,
    space_types: ['open_office', 'reception', 'meeting_rooms'] as string[],
    has_livestream: false,
    brand_style: 'modern_minimalist',
    special_requirements: '',
  })

  const handleFile = useCallback((f: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setError('请上传 JPG、PNG 或 WebP 格式的图片')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过 10MB')
      return
    }
    setError('')
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const toggleSpaceType = (id: string) => {
    setForm(prev => ({
      ...prev,
      space_types: prev.space_types.includes(id)
        ? prev.space_types.filter(s => s !== id)
        : [...prev.space_types, id],
    }))
  }

  const handleSubmit = async () => {
    if (!file) { setError('请上传平面图'); return }
    if (!form.project_name.trim()) { setError('请输入项目名称'); return }
    if (form.space_types.length === 0) { setError('请至少选择一种空间类型'); return }

    setLoading(true)
    setError('')

    const fd = new FormData()
    fd.append('floor_plan', file)
    fd.append('requirements', JSON.stringify(form))

    try {
      const res = await fetch('/api/backend/planning/analyze', {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || '分析失败')
      }
      const data = await res.json()
      sessionStorage.setItem(`plan_${data.project_id}`, JSON.stringify(data.plan))
      router.push(`/project/${data.project_id}/plan`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '请求失败，请重试')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1F1F23] px-6 py-4 flex items-center gap-3">
        <a href="/" className="text-[#888890] hover:text-white text-sm transition-colors">AddAI Design</a>
        <span className="text-[#1F1F23]">/</span>
        <span className="text-sm">新建项目</span>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* 左：上传区 */}
        <div className="p-8 border-r border-[#1F1F23]">
          <h2 className="text-lg font-semibold mb-1">上传平面图</h2>
          <p className="text-sm text-[#888890] mb-6">支持 JPG、PNG、WebP，建议分辨率 1000px 以上</p>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => document.getElementById('file-input')?.click()}
            className={`relative rounded-xl border-2 border-dashed transition-colors duration-150 cursor-pointer overflow-hidden
              ${isDragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-[#1F1F23] hover:border-[#2F2F35]'}
              ${preview ? 'aspect-video' : 'aspect-video flex items-center justify-center'}`}
          >
            {preview ? (
              <img src={preview} alt="平面图预览" className="w-full h-full object-contain bg-[#111113]" />
            ) : (
              <div className="text-center p-8">
                <div className="w-12 h-12 rounded-xl bg-[#111113] border border-[#1F1F23] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-5 h-5 text-[#888890]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-[#888890]">拖拽图片到这里，或<span className="text-indigo-400 ml-1">点击上传</span></p>
                <p className="text-xs text-[#555560] mt-1">JPG / PNG / WebP · 最大 10MB</p>
              </div>
            )}
          </div>
          <input id="file-input" type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

          {preview && (
            <button onClick={() => { setFile(null); setPreview(null) }} className="mt-3 text-xs text-[#888890] hover:text-white transition-colors">
              重新上传
            </button>
          )}
        </div>

        {/* 右：需求表单 */}
        <div className="p-8 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-1">项目需求</h2>
          <p className="text-sm text-[#888890] mb-6">填写越详细，规划越精准</p>

          <div className="space-y-5">
            <div>
              <label className="label">项目名称</label>
              <input className="input-base" placeholder="例：上海XX公司办公室改造" value={form.project_name}
                onChange={e => setForm(p => ({ ...p, project_name: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">总面积（㎡）</label>
                <input type="number" className="input-base" value={form.total_area} min={100} max={50000}
                  onChange={e => setForm(p => ({ ...p, total_area: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="label">使用人数</label>
                <input type="number" className="input-base" value={form.headcount} min={1} max={2000}
                  onChange={e => setForm(p => ({ ...p, headcount: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>

            <div>
              <label className="label">需要的空间类型（可多选）</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {SPACE_TYPES.map(t => (
                  <button key={t.id} onClick={() => toggleSpaceType(t.id)}
                    className={`tag ${form.space_types.includes(t.id) ? 'tag-active' : ''}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">风格方向</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {STYLES.map(s => (
                  <button key={s.id} onClick={() => setForm(p => ({ ...p, brand_style: s.id }))}
                    className={`surface rounded-lg p-3 text-left transition-colors duration-150 ${form.brand_style === s.id ? 'border-indigo-500 bg-indigo-600/10' : 'hover:border-[#2F2F35]'}`}>
                    <div className="text-sm font-medium">{s.label}</div>
                    <div className="text-xs text-[#888890] mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setForm(p => ({ ...p, has_livestream: !p.has_livestream }))}
                className={`w-10 h-5 rounded-full transition-colors duration-150 relative ${form.has_livestream ? 'bg-indigo-600' : 'bg-[#1F1F23]'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-150 ${form.has_livestream ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
              <label className="text-sm text-[#888890] cursor-pointer" onClick={() => setForm(p => ({ ...p, has_livestream: !p.has_livestream }))}>
                包含直播间
              </label>
            </div>

            <div>
              <label className="label">特殊要求（选填）</label>
              <textarea className="input-base resize-none" rows={3}
                placeholder="例：需要无障碍通道、需要独立服务器机房、VIP 接待区需与普通区域隔离..."
                value={form.special_requirements}
                onChange={e => setForm(p => ({ ...p, special_requirements: e.target.value }))} />
            </div>
          </div>
        </div>
      </div>

      {/* 底部确认栏 */}
      <div className="sticky bottom-0 border-t border-[#1F1F23] bg-[#0A0A0B]/90 backdrop-blur-sm px-8 py-4 flex items-center justify-between">
        <div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {!error && <p className="text-sm text-[#888890]">上传平面图并填写需求后，AI 将开始分析（约 30 秒）</p>}
        </div>
        <motion.button
          onClick={handleSubmit}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className="btn-primary text-sm flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              设计师正在分析平面图…
            </>
          ) : '开始 AI 规划'}
        </motion.button>
      </div>
    </div>
  )
}
