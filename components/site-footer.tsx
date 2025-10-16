export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-border">
      <div className="mx-auto max-w-[1800px] px-4 md:px-6 lg:px-8 py-6 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} Time Task Manager</p>
        <p className="opacity-80">
          Сконцентрируйтесь на важном — время на вашей стороне
        </p>
      </div>
    </footer>
  );
}
