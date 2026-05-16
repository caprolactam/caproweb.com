import {
  useSpring,
  useSprings,
  animated,
  type SpringConfig,
} from '@react-spring/web'
import { useEffect, useId, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '#app/lib/prefers-reduced-motion.ts'
import { useHydrated } from '#app/lib/use-hydrated.ts'
import { range } from '#app/lib/utils.ts'
import { IconButton } from '../ui/icon-button.tsx'
import { ColorMode } from './types'
import { useColorMode } from './use-color-mode.ts'

export function ToggleColorMode() {
  const { colorMode, toggleColorMode } = useColorMode()
  const isHydrated = useHydrated()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timeoutId = useRef<number | null>(null)

  useEffect(() => {
    if (!isTransitioning) return

    if (timeoutId.current) {
      window.clearTimeout(timeoutId.current)
    }

    timeoutId.current = window.setTimeout(() => {
      setIsTransitioning(false)
    }, 500)

    return () => {
      window.clearTimeout(timeoutId.current)
      timeoutId.current = null
    }
  }, [isTransitioning])

  return (
    <IconButton
      variant='ghost'
      onClick={() => {
        toggleColorMode()
        setIsTransitioning(true)
      }}
      label={`${colorMode === ColorMode.Light ? 'ダークモード' : 'ライトモード'}に切り替える`}
    >
      {isHydrated ? (
        (isBooped) => (
          <IconColorMode
            colorMode={colorMode}
            size={22}
            isBooped={isBooped}
            isTransitioning={isTransitioning}
          />
        )
      ) : (
        <FallbackIconColorMode size={20} />
      )}
    </IconButton>
  )
}

const FIXED_PATH_LENGTH = 100
const sunRadius = 4
const NUM_OF_RAYS = 8
const SUN_RAY_START_RADIUS = 8

const BOOP_CONFIG = {
  tension: 264,
  friction: 10,
} satisfies SpringConfig

export function IconColorMode({
  size = 24,
  colorMode,
  isBooped,
  isTransitioning,
}: {
  colorMode: ColorMode
  isBooped: boolean
  size?: number
  isTransitioning: boolean
}) {
  const id = useId()
  const prefersReducedMotion = usePrefersReducedMotion()
  const isInitialRenderRef = useIsInitialRenderRef()
  const isDark = colorMode === ColorMode.Dark

  const MOTION_CONFIG = {
    tension: 166,
    friction: 24,
  } satisfies SpringConfig

  const totalPathLength = FIXED_PATH_LENGTH * 2 // moon path + sun path
  const rotation = 90

  const moonPath = useSpring({
    strokeDashoffset: isDark ? 0 : totalPathLength,
    transform: `rotate(${isDark ? (isBooped ? -12 : 0) : rotation}deg)`,
    immediate: prefersReducedMotion || isInitialRenderRef.current,
    config: isTransitioning ? MOTION_CONFIG : BOOP_CONFIG,
  })

  const sunPath = useSpring({
    strokeDashoffset: isDark ? totalPathLength : 0,
    transform: `rotate(${isDark ? rotation * -1 : 0}deg)`,
    immediate: prefersReducedMotion || isInitialRenderRef.current,
    config: MOTION_CONFIG,
  })

  const rayAngles = range(NUM_OF_RAYS).map((_, index) => {
    return index * (360 / NUM_OF_RAYS)
  })
  const [sunDotTrail] = useSprings(
    NUM_OF_RAYS,
    (index) => ({
      isVisible: isDark ? 0 : 1,
      // delay: isDark ? 0 : 35 + index * 15,
      delay: isDark ? 0 : 35 + index * 30,
      immediate: isDark || prefersReducedMotion,
      // config: {
      //   tension: 210,
      //   friction: 20,
      // },
      config: {
        easing: (t) => t,
        duration: 420,
      },
    }),
    [isDark, prefersReducedMotion],
  )

  const sunRaySpring = useSpring({
    radius: isBooped ? 10.5 : 9.5,
    config: BOOP_CONFIG,
  })

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      className='overflow-visible'
    >
      <defs>
        <mask id={`sun-dot-mask-${id}`}>
          <rect x='-10' y='-10' width='44' height='44' fill='white' />
          <circle r={sunRadius} cx='12' cy='12' fill='black' />
        </mask>
      </defs>
      <g mask={`url(#sun-dot-mask-${id})`}>
        {sunDotTrail.map(({ isVisible, ...props }, index) => {
          const angle = rayAngles[index]
          const centerX = 12
          const centerY = 12
          const angleInRads = (angle / 180) * Math.PI
          const x1 = roundTo(
            centerX + SUN_RAY_START_RADIUS * Math.cos(angleInRads),
            4,
          )
          const y1 = roundTo(
            centerY + SUN_RAY_START_RADIUS * Math.sin(angleInRads),
            4,
          )

          return (
            <animated.line
              key={angle}
              x1={x1}
              y1={y1}
              x2={sunRaySpring.radius.to((radius) =>
                roundTo(centerX + radius * Math.cos(angleInRads), 4),
              )}
              y2={sunRaySpring.radius.to((radius) =>
                roundTo(centerY + radius * Math.sin(angleInRads), 4),
              )}
              stroke='currentColor'
              strokeWidth={2}
              strokeLinecap='round'
              style={{
                ...props,
                opacity: isVisible.to((v) => v),
              }}
            />
          )
        })}
      </g>
      <animated.path
        style={moonPath}
        d='
          M 12,3
          A 9 9 0 1 0 21,12
          A 6.6 6.6 0 0 1 12,3
          Z
        '
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeDasharray={`${FIXED_PATH_LENGTH} 1000`}
        pathLength={FIXED_PATH_LENGTH}
        className='origin-center'
      />
      <animated.circle
        style={sunPath}
        cx='12'
        cy='12'
        r={sunRadius}
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        strokeLinecap='round'
        strokeDasharray={`${FIXED_PATH_LENGTH} 1000`}
        pathLength={FIXED_PATH_LENGTH}
        className='origin-center'
      />
    </svg>
  )
}

function FallbackIconColorMode({ size = 24 }: { size?: number }) {
  const centerX = 12
  const centerY = 12
  const rayLength = 3

  return (
    <svg width={size} height={size} viewBox='0 0 24 24'>
      <g className='dark:opacity-0 opacity-100'>
        {range(NUM_OF_RAYS).map((_, index) => {
          const angle = (index * 360) / NUM_OF_RAYS
          const angleInRads = (angle / 180) * Math.PI

          return (
            <line
              key={angle}
              x1={roundTo(
                centerX + SUN_RAY_START_RADIUS * Math.cos(angleInRads),
                4,
              )}
              y1={roundTo(
                centerY + SUN_RAY_START_RADIUS * Math.sin(angleInRads),
                4,
              )}
              x2={roundTo(
                centerX +
                  (SUN_RAY_START_RADIUS + rayLength) * Math.cos(angleInRads),
                4,
              )}
              y2={roundTo(
                centerY +
                  (SUN_RAY_START_RADIUS + rayLength) * Math.sin(angleInRads),
                4,
              )}
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
            ></line>
          )
        })}
      </g>
      <path
        d='
      M 12,3
      A 9 9 0 1 0 21,12
      A 6.6 6.6 0 0 1 12,3
      Z
      '
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeDasharray='100 1000'
        pathLength='100'
        className='dark:opacity-100 opacity-0'
      ></path>
      <circle
        cx='12'
        cy='12'
        r='5'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeDasharray='100 1000'
        pathLength='100'
        className='dark:opacity-0 opacity-100'
      ></circle>
    </svg>
  )
}

function useIsInitialRenderRef() {
  const isInitialRenderRef = useRef(true)

  useEffect(() => {
    window.requestAnimationFrame(() => {
      isInitialRenderRef.current = false
    })
  }, [])

  return isInitialRenderRef
}

function roundTo(number: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(number * factor) / factor
}
