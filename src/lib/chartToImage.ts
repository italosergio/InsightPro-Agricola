import Highcharts from 'highcharts'

/**
 * Converte um gráfico Highcharts para imagem base64
 */
export async function chartToBase64(
  chartOptions: Highcharts.Options,
  width = 800,
  height = 400
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Cria container temporário
      const container = document.createElement('div')
      container.style.width = `${width}px`
      container.style.height = `${height}px`
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      document.body.appendChild(container)

      // Renderiza gráfico SEM animação para captura rápida
      const chart = Highcharts.chart(container, {
        ...chartOptions,
        chart: {
          ...chartOptions.chart,
          width,
          height,
          animation: false, // Desabilita animação
        },
        plotOptions: {
          ...chartOptions.plotOptions,
          series: {
            ...(chartOptions.plotOptions as any)?.series,
            animation: false, // Desabilita animação em séries
          },
        },
      })

      // Aguarda renderização completa (1s é suficiente sem animações)
      setTimeout(() => {
        try {
          // Usa método interno do Highcharts para exportar SVG
          const svg = (chart as any).getSVG?.() || chart.container.innerHTML
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            throw new Error('Canvas context not available')
          }

          const img = new Image()
          img.onload = () => {
            ctx.drawImage(img, 0, 0)
            const base64 = canvas.toDataURL('image/png')
            chart.destroy()
            document.body.removeChild(container)
            resolve(base64)
          }
          img.onerror = () => {
            chart.destroy()
            document.body.removeChild(container)
            reject(new Error('Failed to load chart image'))
          }
          
          // Converte SVG para base64
          const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
          const url = URL.createObjectURL(svgBlob)
          img.src = url
        } catch (err) {
          chart.destroy()
          document.body.removeChild(container)
          reject(err)
        }
      }, 1000) // 1s é suficiente sem animações
    } catch (err) {
      reject(err)
    }
  })
}
