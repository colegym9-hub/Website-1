"use client"

import * as THREE from "three"
import { useRef } from "react"
import { Canvas, useFrame, extend } from "@react-three/fiber"
import { Image, Environment } from "@react-three/drei"
import { easing } from "maath"

// Curved plane geometry matching the original example
class BentPlaneGeometry extends THREE.PlaneGeometry {
  constructor(
    radius = 0.1,
    width = 1,
    height = 1,
    widthSegments = 20,
    heightSegments = 20,
  ) {
    super(width, height, widthSegments, heightSegments)
    const p = this.parameters
    const hw = p.width / 2
    const a = new THREE.Vector2(-hw, 0)
    const b = new THREE.Vector2(0, radius)
    const c = new THREE.Vector2(hw, 0)
    const ab = new THREE.Vector2().subVectors(a, b)
    const bc = new THREE.Vector2().subVectors(b, c)
    const ac = new THREE.Vector2().subVectors(a, c)
    const r =
      (ab.length() * bc.length() * ac.length()) /
      (2 * Math.abs(ab.cross(ac)))
    const center = new THREE.Vector2(0, radius - r)
    const baseV = new THREE.Vector2().subVectors(a, center)
    const baseAngle = baseV.angle() - Math.PI / 2
    const arc = baseAngle * 2
    const uv = this.attributes.uv
    const pos = this.attributes.position
    const mainV = new THREE.Vector2()
    for (let i = 0; i < uv.count; i++) {
      const uvRatio = 1 - uv.getX(i)
      const y = pos.getY(i)
      mainV
        .copy(center)
        .addScaledVector(
          new THREE.Vector2(
            Math.sin(baseAngle - arc * uvRatio),
            Math.cos(baseAngle - arc * uvRatio),
          ),
          r,
        )
      pos.setXYZ(i, mainV.x, y, -mainV.y)
    }
    pos.needsUpdate = true
  }
}

extend({ BentPlaneGeometry })

declare module "@react-three/fiber" {
  interface ThreeElements {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bentPlaneGeometry: any
  }
}

// Proxy through a local API route that returns CORS headers Three.js needs
const proxy = (url: string) =>
  `/api/image-proxy?url=${encodeURIComponent(url)}`

// A mix of sportraits, media days, and senior portraits
const IMAGES = [
  "https://images.pixieset.com/821255111/27ab9674f721ad0ef81c485752c834ec-large.jpg",
  "https://images.pixieset.com/821255111/e95fdd852a3054cb26ed1523ce7b0e8e-large.jpg",
  "https://images.pixieset.com/821255111/0dae571b79a4769a7de23b8bd7f4af9a-large.jpg",
  "https://images.pixieset.com/821255111/f2d121665486d77a7ab3b226921254fb-large.jpg",
  "https://images.pixieset.com/821255111/de0405d463218b86434c2c2e6861f8fa-large.jpg",
  "https://images.pixieset.com/821255111/7f7e75c3285bafe6261331a1b78e357c-large.jpg",
  "https://images.pixieset.com/821255111/a208cab9f4daab1037decf890c3465d7-large.jpg",
  "https://images.pixieset.com/821255111/987e6ce32b37bc16626624495bdc8865-large.jpg",
].map(proxy)

function Rig() {
  const ref = useRef<THREE.Group>(null!)
  useFrame((state, delta) => {
    ref.current.rotation.y -= delta * 0.18
    easing.damp3(
      state.camera.position,
      [-state.pointer.x * 2, state.pointer.y + 1.5, 10],
      0.3,
      delta,
    )
    state.camera.lookAt(0, 0, 0)
  })
  return (
    <group ref={ref} rotation={[0, 0, 0.15]}>
      <Carousel />
    </group>
  )
}

function Carousel({ radius = 1.4 }: { radius?: number }) {
  return (
    <>
      {IMAGES.map((url, i) => (
        <Card
          key={i}
          url={url}
          position={[
            Math.sin((i / IMAGES.length) * Math.PI * 2) * radius,
            0,
            Math.cos((i / IMAGES.length) * Math.PI * 2) * radius,
          ]}
          rotation={[0, Math.PI + (i / IMAGES.length) * Math.PI * 2, 0]}
        />
      ))}
    </>
  )
}

type CardProps = {
  url: string
  position: [number, number, number]
  rotation: [number, number, number]
}

function Card({ url, ...props }: CardProps) {
  // No pointer hover on a continuously rotating carousel: raycast hits flicker
  // between frames and drive scale/material damping that reads as constant glitching.
  return (
    <Image
      url={url}
      transparent
      side={THREE.DoubleSide}
      zoom={1.5}
      radius={0.1}
      {...props}
    >
      <bentPlaneGeometry args={[0.1, 1, 1, 20, 20]} />
    </Image>
  )
}

export default function WorkCarousel() {
  return (
    <div className="relative h-[100dvh] min-h-[100dvh] w-full shrink-0 overflow-hidden bg-[#0A0A0A]">
      <Canvas
        camera={{ position: [0, 0, 100], fov: 15 }}
        resize={{
          scroll: false,
          debounce: { scroll: 120, resize: 50 },
        }}
      >
        <fog attach="fog" args={["#0A0A0A", 8.5, 12]} />
        <Rig />
        <Environment preset="dawn" />
      </Canvas>
      {/* Scroll cue */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[#A0A0A0] text-xs tracking-widest uppercase">
          Scroll
        </span>
        <div className="h-8 w-px bg-gradient-to-b from-[#A0A0A0] to-transparent" />
      </div>
    </div>
  )
}
