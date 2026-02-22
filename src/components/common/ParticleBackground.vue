<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useThemeStore } from '@/stores'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  rotation: number
  rotationSpeed: number
}

interface Meteor {
  x: number
  y: number
  length: number
  speed: number
  opacity: number
}

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.getActualTheme() === 'dark')

const canvasRef = ref<HTMLCanvasElement>()
let animationId: number
let particles: Particle[] = []
let meteors: Meteor[] = []

const sakuraCount = 80
const meteorCount = 12

const initSakura = (width: number, height: number) => {
  particles = []
  for (let i = 0; i < sakuraCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height - height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: Math.random() * 0.8 + 0.3,
      size: Math.random() * 6 + 3,
      opacity: Math.random() * 0.4 + 0.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02
    })
  }
}

const initMeteors = (width: number, height: number) => {
  meteors = []
  for (let i = 0; i < meteorCount; i++) {
    meteors.push(createMeteor(width, height))
  }
}

const createMeteor = (width: number, height: number): Meteor => {
  return {
    x: Math.random() * width * 1.5 - width * 0.5,
    y: Math.random() * height * 0.5,
    length: Math.random() * 80 + 40,
    speed: Math.random() * 8 + 12,
    opacity: 0
  }
}

const drawSakura = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.clearRect(0, 0, width, height)

  particles.forEach((p) => {
    p.x += p.vx + Math.sin(p.y * 0.01) * 0.3
    p.y += p.vy
    p.rotation += p.rotationSpeed

    if (p.y > height + 20) {
      p.y = -20
      p.x = Math.random() * width
      p.opacity = Math.random() * 0.3 + 0.7
    }
    if (p.x < -20) p.x = width + 20
    if (p.x > width + 20) p.x = -20

    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rotation)
    
    ctx.shadowColor = 'rgba(255, 105, 180, 0.6)'
    ctx.shadowBlur = 8
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size)
    gradient.addColorStop(0, `rgba(255, 220, 230, ${p.opacity})`)
    gradient.addColorStop(0.5, `rgba(255, 183, 197, ${p.opacity * 0.9})`)
    gradient.addColorStop(1, `rgba(255, 105, 180, 0)`)
    
    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2
      const radius = i % 2 === 0 ? p.size : p.size * 0.5
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
    }
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.restore()
  })
}

const drawMeteors = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.clearRect(0, 0, width, height)

  meteors.forEach((m) => {
    m.y += m.speed
    m.x += m.speed * 0.5
    m.opacity = Math.min(m.opacity + 0.02, 0.9)

    if (m.y > height || m.x > width) {
      Object.assign(m, createMeteor(width, height))
    }

    const gradient = ctx.createLinearGradient(
      m.x, m.y,
      m.x - m.length * 0.3, m.y - m.length
    )
    gradient.addColorStop(0, `rgba(199, 210, 254, ${m.opacity})`)
    gradient.addColorStop(0.3, `rgba(165, 132, 236, ${m.opacity * 0.9})`)
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)')

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(m.x, m.y)
    ctx.lineTo(m.x - 8, m.y - m.length * 0.3)
    ctx.lineTo(m.x - 15, m.y - m.length)
    ctx.lineTo(m.x - 8, m.y - m.length * 0.3)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.restore()

    ctx.beginPath()
    ctx.arc(m.x, m.y, 3, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${m.opacity})`
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)'
    ctx.shadowBlur = 15
    ctx.fill()
    ctx.shadowBlur = 0
  })
}

const animate = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  if (isDark.value) {
    drawMeteors(ctx, canvas.width, canvas.height)
  } else {
    drawSakura(ctx, canvas.width, canvas.height)
  }
  
  animationId = requestAnimationFrame(animate)
}

const handleResize = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  
  if (isDark.value) {
    initMeteors(canvas.width, canvas.height)
  } else {
    initSakura(canvas.width, canvas.height)
  }
}

watch(isDark, (newVal) => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  if (newVal) {
    initMeteors(canvas.width, canvas.height)
  } else {
    initSakura(canvas.width, canvas.height)
  }
})

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  
  if (isDark.value) {
    initMeteors(canvas.width, canvas.height)
  } else {
    initSakura(canvas.width, canvas.height)
  }
  
  window.addEventListener('resize', handleResize)
  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="fixed inset-0 pointer-events-none z-0"
    :style="{ opacity: isDark ? 1 : 0.6 }"
  />
</template>
