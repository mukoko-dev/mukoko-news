import type { SVGProps } from "react";

// Brand marks for the share dialog. lucide-react 1.x dropped every brand icon,
// so these are the official glyphs as published by simple-icons (CC0): X and
// Facebook from simple-icons 16.34.0, LinkedIn from simple-icons 8.15.0 (it was
// removed from later releases at LinkedIn's request). They take the same props
// as a lucide icon and draw in currentColor, so hover colours still apply.

type BrandIconProps = SVGProps<SVGSVGElement>;

function BrandIcon({ path, ...props }: BrandIconProps & { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d={path} />
    </svg>
  );
}

export function XIcon(props: BrandIconProps) {
  return (
    <BrandIcon
      path="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"
      {...props}
    />
  );
}

export function FacebookIcon(props: BrandIconProps) {
  return (
    <BrandIcon
      path="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"
      {...props}
    />
  );
}

export function LinkedInIcon(props: BrandIconProps) {
  return (
    <BrandIcon
      path="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      {...props}
    />
  );
}
