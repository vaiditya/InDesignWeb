import React from "react"

export default ({ page }) => (
  <svg height={`${page.geometric_bound[2]}px`} width={`${page.geometric_bound[3]}px`}>
    <defs>
        <linearGradient id="e" x1="40" y1="210" x2="460" y2="210" gradientUnits="userSpaceOnUse" gradientTransform="rotate(90)">
            <stop stopColor="#FF69B4" offset="0" />
            <stop stopColor="purple" offset="0.5" />
            <stop stopColor="#FF69B4" offset="1" />
        </linearGradient>
    </defs>
    <path d={`M${page.margins.Left} ${page.margins.Top} L${page.geometric_bound[3] - page.margins.Right} ${page.margins.Top} L${page.geometric_bound[3] - page.margins.Right} ${page.geometric_bound[2] - page.margins.Bottom} L${page.margins.Left} ${page.geometric_bound[2] - page.margins.Left} Z`} style={{ stroke:"url(#e)", strokeWidth:0.4, fill: "none" }} />
  </svg>
)