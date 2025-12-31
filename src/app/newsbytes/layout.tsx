export default function NewsBytesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // NewsBytes has its own fullscreen layout without header/footer
  return <>{children}</>;
}
