const DEFAULT_TITLE = "Halogram"

const originalFavicon = "/Logo.png"

function getFaviconElement() {
    return document.getElementById("app-favicon") as HTMLLinkElement
}

export function setBrowserTitle(unread: number) {
    document.title =
        unread > 0
            ? `(${unread}) Halogram`
            : DEFAULT_TITLE
}

export function resetBrowserTitle() {
    document.title = DEFAULT_TITLE
}

export function updateFaviconBadge(unread: number) {
    const favicon = getFaviconElement()
    if (!favicon) return

    if (unread <= 0) {
        favicon.href = originalFavicon
        return
    }

    const img = new Image()
    img.src = originalFavicon

    img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = 64
        canvas.height = 64

        const ctx = canvas.getContext("2d")
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, 64, 64)

        ctx.fillStyle = "#ff3040"
        ctx.beginPath()
        ctx.arc(50, 14, 12, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = "#fff"
        ctx.font = "bold 14px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        const text = unread > 99 ? "99+" : unread.toString()

        ctx.fillText(text, 50, 14)

        favicon.href = canvas.toDataURL("image/png")
    }
}

export async function showDesktopNotification(
    title: string,
    body: string,
    icon?: string
) {
    if (!("Notification" in window)) return

    if (Notification.permission !== "granted") return

    if (!document.hidden) return

    new Notification(title, {
        body,
        icon: icon ?? "/Logo.png"
    })
}