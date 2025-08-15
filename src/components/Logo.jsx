// src/components/Logo.jsx
import React from 'react'
import { cn } from '@/lib/utils'

const Logo = ({ 
  variant = 'main', // 'main', 'horizontal', 'compact'
  theme = 'light',   // 'light', 'dark'
  size = 'md',       // 'sm', 'md', 'lg'
  className = ''
}) => {
  const sizes = {
    sm: {
      main: [120, 36],
      horizontal: [180, 30],
      compact: [48, 24]
    },
    md: {
      main: [200, 60],
      horizontal: [300, 50],
      compact: [80, 40]
    },
    lg: {
      main: [280, 84],
      horizontal: [420, 70],
      compact: [112, 56]
    }
  }

  const colors = {
    light: {
      stroke: '#000',
      fill: '#000',
      subtitle: '#666'
    },
    dark: {
      stroke: '#fff',
      fill: '#fff',
      subtitle: '#ccc'
    }
  }

  const [width, height] = sizes[size][variant]
  const { stroke, fill, subtitle } = colors[theme]

  if (variant === 'main') {
    return (
      <svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`} 
        className={cn("logo-main", className)}
      >
        <rect 
          x="2" 
          y="2" 
          width={width - 4} 
          height={height - 4} 
          fill="none" 
          stroke={stroke} 
          strokeWidth="2"
        />
        <rect 
          x="6" 
          y="6" 
          width={width - 12} 
          height={height - 12} 
          fill="none" 
          stroke={stroke} 
          strokeWidth="1"
        />
        <text 
          x={width / 2} 
          y={height * 0.63} 
          textAnchor="middle" 
          fontFamily="Georgia, Times New Roman, serif" 
          fontSize={height * 0.53} 
          fontWeight="bold" 
          fill={fill}
        >
          MK
        </text>
        <text 
          x={width / 2} 
          y={height * 0.83} 
          textAnchor="middle" 
          fontFamily="Georgia, Times New Roman, serif" 
          fontSize={height * 0.13} 
          fill={subtitle} 
          letterSpacing="2px"
        >
          MUKOKO
        </text>
      </svg>
    )
  }

  if (variant === 'horizontal') {
    return (
      <svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`} 
        className={cn("logo-horizontal", className)}
      >
        <text 
          x={width * 0.17} 
          y={height * 0.64} 
          textAnchor="middle" 
          fontFamily="Georgia, Times New Roman, serif" 
          fontSize={height * 0.56} 
          fontWeight="bold" 
          fill={fill}
        >
          MK
        </text>
        <line 
          x1={width * 0.28} 
          y1={height * 0.2} 
          x2={width * 0.28} 
          y2={height * 0.8} 
          stroke={stroke} 
          strokeWidth="2"
        />
        <text 
          x={width * 0.37} 
          y={height * 0.44} 
          fontFamily="Georgia, Times New Roman, serif" 
          fontSize={height * 0.28} 
          fontWeight="bold" 
          fill={fill}
        >
          MUKOKO
        </text>
        <text 
          x={width * 0.37} 
          y={height * 0.72} 
          fontFamily="Georgia, Times New Roman, serif" 
          fontSize={height * 0.28} 
          fill={subtitle}
        >
          NEWS
        </text>
      </svg>
    )
  }

  // compact variant
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      className={cn("logo-compact", className)}
    >
      <rect 
        x="2" 
        y="2" 
        width={width - 4} 
        height={height - 4} 
        fill="none" 
        stroke={stroke} 
        strokeWidth="1.5"
      />
      <text 
        x={width / 2} 
        y={height * 0.65} 
        textAnchor="middle" 
        fontFamily="Georgia, Times New Roman, serif" 
        fontSize={height * 0.4} 
        fontWeight="bold" 
        fill={fill}
      >
        MK
      </text>
    </svg>
  )
}

export default Logo