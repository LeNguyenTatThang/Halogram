import { formatDistanceToNow } from "date-fns"
import { enUS, vi } from "date-fns/locale"
import i18n from "../lib/i18n";

const localeMap = {
    en: enUS,
    vi: vi
}

export function timeAgo(date: string | Date) {
    const language = i18n.resolvedLanguage || i18n.language;

    return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: localeMap[language as keyof typeof localeMap] ?? enUS
    })
}