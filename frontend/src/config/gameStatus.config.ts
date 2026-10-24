import type { GameStatus } from "../types/game.types";

type GameStatusConfig = {
    label: string;
    color: string;
};

export const GAME_STATUS_CONFIG = {
    WANT_TO_PLAY: {
        label: "Quero jogar",
        color: "#5B9BFF",
    },

    PLAYING: {
        label: "Jogando",
        color: "#26E6A6",
    },

    PAUSED: {
        label: "Pausado",
        color: "#A1A1AA",
    },

    ABANDONED: {
        label: "Abandonado",
        color: "#FF862E",
    },

    COMPLETED: {
        label: "Zerado",
        color: "#C65CFF",
    },
} satisfies Record<GameStatus, GameStatusConfig>;

export const GAME_STATUS_ENTRIES = Object.entries(GAME_STATUS_CONFIG) as [
    GameStatus,
    (typeof GAME_STATUS_CONFIG)[GameStatus],
][];
