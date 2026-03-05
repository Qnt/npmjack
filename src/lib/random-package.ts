import { POPULAR_PACKAGES } from '#/mocks/popular-packages'

export function getRandomPackage(): string {
  const index = Math.floor(Math.random() * POPULAR_PACKAGES.length)
  return POPULAR_PACKAGES[index]!
}
