let sidebarCallback: (() => void) | null = null

export function setSidebarOpenCallback(cb: (() => void) | null) {
  sidebarCallback = cb
}

export function openSidebar() {
  sidebarCallback?.()
}
