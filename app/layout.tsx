import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AddAI Design — 办公空间AI设计规划',
  description: '上传平面图，AI 生成专业空间规划方案与效果图',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#0A0A0B] text-white`}>
        {children}
      </body>
    </html>
  )
}
