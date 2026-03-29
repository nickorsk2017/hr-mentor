type LinkedInIconProps = {
  className?: string;
};

export function LinkedInIcon({ className }: LinkedInIconProps) {
  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-md bg-white text-[#0A66C2] ${className ?? ""}`}
      aria-hidden="true"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.94 8.5a1.44 1.44 0 1 1 0-2.88 1.44 1.44 0 0 1 0 2.88Zm-1.24 1.1h2.47V18H5.7V9.6Zm3.86 0H11.9v1.15h.03c.33-.63 1.15-1.3 2.37-1.3 2.53 0 3 1.67 3 3.84V18h-2.46v-4.2c0-1-.02-2.3-1.4-2.3-1.4 0-1.62 1.1-1.62 2.22V18H9.56V9.6Z" />
      </svg>
    </span>
  );
}
