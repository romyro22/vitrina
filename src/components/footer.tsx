interface FooterProps {
  storeName: string
}

export function Footer({ storeName }: FooterProps) {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {storeName}
        </p>
      </div>
    </footer>
  )
}
