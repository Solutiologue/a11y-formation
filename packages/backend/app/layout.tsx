// app/layout.tsx
export const metadata = {
  title: 'A11y Formation - API',
  description: 'Accessibility formation API',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
