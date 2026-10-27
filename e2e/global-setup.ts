import { seedE2EGame } from "./seeds/game.seed";

export default async function globalSetup() {
    await seedE2EGame();
}
