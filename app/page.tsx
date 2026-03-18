import dynamic from 'next/dynamic'

export const dynamic = 'force-dynamic'

const MastroMontaggiApp = dynamic(
  () => import('@/components/MastroMontaggiApp'),
  { ssr: false }
)

export default function Page() {
  return <MastroMontaggiApp />
}
