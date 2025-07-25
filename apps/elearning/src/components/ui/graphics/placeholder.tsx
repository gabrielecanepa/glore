export const Placeholder = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    height="1200"
    width="1200"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    {...props}
  >
    <linearGradient id="a">
      <stop offset="0" stopColor="#c9c9c9" stopOpacity="0" />
      <stop offset=".208" stopColor="#c9c9c9" />
      <stop offset=".792" stopColor="#c9c9c9" />
      <stop offset="1" stopColor="#c9c9c9" stopOpacity="0" />
    </linearGradient>
    <linearGradient gradientUnits="userSpaceOnUse" id="b" x1="554.061" x2="-.48" xlinkHref="#a" y1=".083" y2=".087" />
    <linearGradient
      gradientUnits="userSpaceOnUse"
      id="c"
      x1="796.912"
      x2="404.507"
      xlinkHref="#a"
      y1="599.963"
      y2="599.965"
    />
    <linearGradient
      gradientUnits="userSpaceOnUse"
      id="d"
      x1="600.792"
      x2="600.794"
      xlinkHref="#a"
      y1="403.677"
      y2="796.082"
    />
    <linearGradient
      gradientUnits="userSpaceOnUse"
      id="e"
      x1="404.85"
      x2="796.972"
      xlinkHref="#a"
      y1="403.903"
      y2="796.02"
    />
    <clipPath id="f">
      <path d="m581.364 580.535h38.689v38.689h-38.689z" />
    </clipPath>
    <rect fill="#eaeaea" height="1200" rx="3" width="1200" />
    <g opacity=".5">
      <g opacity=".5">
        <path
          d="m600.709 736.5c-75.454 0-136.621-61.167-136.621-136.62 0-75.454 61.167-136.621 136.621-136.621 75.453 0 136.62 61.167 136.62 136.621 0 75.453-61.167 136.62-136.62 136.62z"
          fill="#fafafa"
        />
        <path
          d="m600.709 736.5c-75.454 0-136.621-61.167-136.621-136.62 0-75.454 61.167-136.621 136.621-136.621 75.453 0 136.62 61.167 136.62 136.621 0 75.453-61.167 136.62-136.62 136.62z"
          stroke="#c9c9c9"
          strokeWidth="2.418"
        />
      </g>
      <g strokeWidth="2.418">
        <path
          d="m0-1.209h553.581"
          stroke="url(#b)"
          transform="matrix(.70710678 -.70710678 -.70710678 -.70710678 405.130421 795.741358)"
        />
        <path d="m404.846 598.671h391.726" stroke="url(#c)" />
        <path d="m599.5 795.742v-391.725" stroke="url(#d)" />
        <path d="m795.717 796.597-391.441-391.44" stroke="url(#e)" />
      </g>
      <path
        d="m600.709 656.704c-31.384 0-56.825-25.441-56.825-56.824 0-31.384 25.441-56.825 56.825-56.825 31.383 0 56.824 25.441 56.824 56.825 0 31.383-25.441 56.824-56.824 56.824z"
        fill="#fff"
      />
      <g clipPath="url(#f)">
        <path
          clipRule="evenodd"
          d="m616.426 586.58h-31.434v16.176l3.553-3.554.531-.531h9.068l.074-.074 8.463-8.463h2.565l7.18 7.181zm-15.715 14.654 3.698 3.699 1.283 1.282-2.565 2.565-1.282-1.283-5.2-5.199h-6.066l-5.514 5.514-.073.073v2.876a2.418 2.418 0 0 0 2.418 2.418h26.598a2.418 2.418 0 0 0 2.418-2.418v-8.317l-8.463-8.463-7.181 7.181zm-19.347 5.442v4.085a6.045 6.045 0 0 0 6.046 6.045h26.598a6.044 6.044 0 0 0 6.045-6.045v-7.108l1.356-1.355-1.282-1.283-.074-.073v-17.989h-38.689v23.43l-.146.146z"
          fill="#666"
          fillRule="evenodd"
        />
      </g>
      <path
        d="m600.709 656.704c-31.384 0-56.825-25.441-56.825-56.824 0-31.384 25.441-56.825 56.825-56.825 31.383 0 56.824 25.441 56.824 56.825 0 31.383-25.441 56.824-56.824 56.824z"
        stroke="#c9c9c9"
        strokeWidth="2.418"
      />
    </g>
  </svg>
)

export const PlaceholderGraphic = Placeholder
