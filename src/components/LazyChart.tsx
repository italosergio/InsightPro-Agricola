import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useInView } from '@/hooks/useInView'

interface Props {
  options: Highcharts.Options
  height?: number | string
}

export function LazyChart({ options, height = 300 }: Props) {
  const { ref, inView } = useInView()

  return (
    <div ref={ref} style={{ minHeight: height }}>
      {inView && <HighchartsReact highcharts={Highcharts} options={options} />}
    </div>
  )
}
