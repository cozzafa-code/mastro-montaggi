import loadDynamic from 'next/dynamic'

export const dynamic = 'force-dynamic'

const MastroMontaggiApp = loadDynamic(
  () => import('@/components/MastroMontaggiApp'),
  { ssr: false }
)

export default function Page() {
  return <MastroMontaggiApp />
}
