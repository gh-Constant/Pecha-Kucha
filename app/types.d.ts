// YouTube IFrame API types
declare namespace YT {
  class Player {
    constructor(
      elementId: string,
      options: {
        height: string | number
        width: string | number
        videoId: string
        playerVars?: {
          autoplay?: 0 | 1
          controls?: 0 | 1
          disablekb?: 0 | 1
          fs?: 0 | 1
          modestbranding?: 0 | 1
          rel?: 0 | 1
          start?: number
        }
        events?: {
          onReady?: (event: { target: Player }) => void
          onStateChange?: (event: { data: number }) => void
          onError?: (event: any) => void
        }
      },
    )
    playVideo(): void
    pauseVideo(): void
    seekTo(seconds: number, allowSeekAhead?: boolean): void
    destroy(): void
  }
}
