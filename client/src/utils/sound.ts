import like from "../assets/sounds/like.mp3"
import del from "../assets/sounds/delete.mp3"
import message from "../assets/sounds/message.mp3"
import ding from "../assets/sounds/ding.mp3"
import finish from "../assets/sounds/finish.mp3"
import success from "../assets/sounds/success.mp3"

const sounds = {
    like: new Audio(like),
    delete: new Audio(del),
    message: new Audio(message),
    ding: new Audio(ding),
    finish: new Audio(finish),
    success: new Audio(success)
}

export const playSound = (
    name: keyof typeof sounds,
    volume = 1
) => {
    const audio = sounds[name]

    audio.pause()
    audio.currentTime = 0
    audio.volume = volume

    audio.play().catch(() => {})
}