"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"

// Define the slide types
type SlideType = "image" | "youtube"

interface Slide {
  title: string
  content: string
  type: SlideType
  source: string // URL for image or YouTube video
  timestamp?: number // Optional timestamp for YouTube videos (in seconds)
}

// Example slides with both images and YouTube videos in English
const slides: Slide[] = [
  // Gameplay Mechanics (Original 10)
  {
    title: "Survival at its Core",
    content: "Start naked on a beach, fight to survive. Every resource matters, every decision counts. Pure survival gaming at its finest.",
    type: "youtube",
    source: "https://youtu.be/LGcECozNXEw",
    timestamp: 2,
  },
  {
    title: "Base Building Evolution",
    content: "From wooden shacks to fortified compounds. Design, expand, and defend your fortress. Architecture meets strategy.",
    type: "youtube",
    source: "https://youtu.be/cJAXo3gRiQY",
    timestamp: 0,
  },
  {
    title: "Combat Mastery",
    content: "Master primitive weapons to military-grade firearms. Every fight is intense, every victory earned through skill.",
    type: "youtube",
    source: "https://www.youtube.com/watch?v=UQgjv5H7CZs",
    timestamp: 5,
  },
  {
    title: "Social Dynamics",
    content: "Form alliances, wage wars, navigate politics. Your reputation matters in a world where trust is rare.",
    type: "youtube",
    source: "https://youtu.be/LGcECozNXEw",
    timestamp: 70,
  },
  {
    title: "Raiding Tactics",
    content: "Plan attacks, breach defenses, secure loot. Strategic warfare where preparation meets opportunity.",
    type: "youtube",
    source: "https://www.youtube.com/watch?v=o1LTs1elajs",
    timestamp: 103,
  },
  {
    title: "Technology Progression",
    content: "Progress from stone tools to electricity and automation. Research, craft, and innovate to stay ahead.",
    type: "youtube",
    source: "https://www.youtube.com/watch?v=XCsIUd_UVz8",
    timestamp: 1,
  },
  {
    title: "Content Creators",
    content: "Content creators build careers around Rust. Some earning six figures from views and donations.",
    type: "youtube",
    source: "https://www.youtube.com/watch?v=OaB2UmARfMY",
    timestamp: 3,
  },
  // Real-World Impact (New 10)
  {
    title: "Virtual Gambling Empire",
    content: "Real-money gambling through in-game casinos. Players risk thousands in unregulated betting systems.",
    type: "image",
    source: "https://www.slothbet1.com/wp-content/uploads/2024/01/rustclash.jpg",
  },
  {
    title: "Psychological Impact",
    content: "Trust issues, paranoia, and anxiety from constant betrayal. The game's effects linger offline.",
    type: "image",
    source: "https://i.ytimg.com/vi/JIJa4fkA8cs/maxresdefault.jpg",
  },
  {
    title: "Toxic Community",
    content: "Racism, harassment, and cyberbullying. The dark side of unmoderated online interaction.",
    type: "image",
    source: "https://cdn.akamai.steamstatic.com/steam/apps/252490/ss_d8df2c445b1c7a3c55f1c53fb1d5ba5b1a8fcf17.jpg",
  },
]

// Function to extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

// Function to create YouTube embed URL with forced caption disable
function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?cc_load_policy=0&cc_lang_pref=none&hl=none`
}

// Declare YT here to avoid the error
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export default function PechaKucha() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [timer, setTimer] = useState(20)
  const [isPlaying, setIsPlaying] = useState(false)
  const [youtubeReady, setYoutubeReady] = useState(false)
  const youtubePlayerRef = useRef<any>(null)
  const youtubeApiLoadedRef = useRef(false)
  const playerReadyRef = useRef(false)
  const playerContainerRef = useRef<HTMLDivElement>(null)

  // Load YouTube API
  useEffect(() => {
    // Only load the API once
    if (typeof window !== "undefined" && !youtubeApiLoadedRef.current) {
      // Define the callback before loading the script
      window.onYouTubeIframeAPIReady = () => {
        setYoutubeReady(true)
        youtubeApiLoadedRef.current = true
      }

      // Create YouTube API script
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    return () => {
      // Cleanup
      if (typeof window !== "undefined") {
        window.onYouTubeIframeAPIReady = () => {}
      }
    }
  }, [])

  // Safe function to control YouTube player
  const safePlayerControl = (action: "play" | "pause") => {
    try {
      if (
        youtubePlayerRef.current &&
        playerReadyRef.current &&
        typeof youtubePlayerRef.current[action === "play" ? "playVideo" : "pauseVideo"] === "function"
      ) {
        if (action === "play") {
          youtubePlayerRef.current.playVideo()
        } else {
          youtubePlayerRef.current.pauseVideo()
        }
      }
    } catch (error) {
      console.error("YouTube player control error:", error)
    }
  }

  // Clean up YouTube player safely
  const cleanupYouTubePlayer = () => {
    try {
      // Only attempt to destroy if the player exists
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy()
      }
    } catch (error) {
      console.error("Error cleaning up YouTube player:", error)
    } finally {
      // Always reset these references
      youtubePlayerRef.current = null
      playerReadyRef.current = false

      // Clear the container manually to avoid DOM errors
      if (playerContainerRef.current) {
        playerContainerRef.current.innerHTML = ""
      }
    }
  }

  // Initialize YouTube player when needed
  useEffect(() => {
    const currentSlideData = slides[currentSlide]

    // Reset player ready state when slide changes
    playerReadyRef.current = false

    // Clean up any existing player first
    cleanupYouTubePlayer()

    // Only proceed if YouTube API is ready and current slide is a YouTube slide
    if (youtubeReady && currentSlideData.type === "youtube") {
      const videoId = getYouTubeVideoId(currentSlideData.source)

      if (videoId && playerContainerRef.current) {
        // Create a fresh container for the player
        playerContainerRef.current.innerHTML = '<div id="youtube-player"></div>'

        try {
          // Create a new player
          youtubePlayerRef.current = new window.YT.Player("youtube-player", {
            height: "100%",
            width: "100%",
            videoId: videoId,
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              rel: 0,
              start: currentSlideData.timestamp || 0,
              mute: 1,
              showinfo: 0,
              iv_load_policy: 3,
              title: 0,
              cc_load_policy: 0,
              cc_lang_pref: 'none',
              hl: 'none',
              enablejsapi: 1,
              origin: window.location.origin,
              widget_referrer: window.location.origin,
              playsinline: 1,
              background: 1,
              autohide: 1,
              captions: 0,
              annotations: 0,
              nocookie: 1,
            },
            events: {
              onReady: (event) => {
                playerReadyRef.current = true
                // Always try to play when ready, we'll pause later if needed
                event.target.playVideo()
                // Force disable captions programmatically
                if (event.target.setOption) {
                  try {
                    event.target.setOption('captions', 'track', {});
                    event.target.setOption('captions', 'reload', true);
                    event.target.unloadModule('captions');
                  } catch (e) {
                    console.error('Error disabling captions:', e);
                  }
                }

                // If presentation is paused, pause the video after a short delay
                if (!isPlaying) {
                  setTimeout(() => {
                    safePlayerControl("pause")
                  }, 100)
                }
              },
              onError: (event) => {
                console.error("YouTube player error:", event)
              },
            },
          })
        } catch (error) {
          console.error("Error initializing YouTube player:", error)
        }
      }
    }

    return () => {
      // No cleanup here - we'll do it at the beginning of the next effect run
    }
  }, [currentSlide, youtubeReady])

  // Control YouTube playback based on presentation state
  useEffect(() => {
    const currentSlideData = slides[currentSlide]

    if (currentSlideData.type === "youtube") {
      if (isPlaying) {
        safePlayerControl("play")
      } else {
        safePlayerControl("pause")
      }
    }
  }, [isPlaying, currentSlide])

  // Final cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupYouTubePlayer()
    }
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    setTimer(20)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
    setTimer(20)
  }

  const togglePlay = () => {
    setIsPlaying((prev) => {
      const newState = !prev;
      const currentSlideData = slides[currentSlide];
      
      if (currentSlideData.type === "youtube" && youtubePlayerRef.current && playerReadyRef.current) {
        if (newState) {
          safePlayerControl("play");
        } else {
          safePlayerControl("pause");
        }
      }
      return newState;
    });
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextSlide()
      } else if (e.key === "ArrowLeft") {
        prevSlide()
      } else if (e.key === " ") {
        togglePlay()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    let internalTimer = timer // Internal timer for tracking actual time

    if (isPlaying) {
      interval = setInterval(() => {
        setTimer((prev) => {
          // For the last slide, count down at half speed (40 seconds real time)
          if (currentSlide === slides.length - 1) {
            internalTimer -= 0.5
            // Show the rounded number that's double the actual progress
            return Math.ceil(prev - 0.5)
          } else {
            if (prev <= 1) {
              nextSlide()
              return 20
            }
            return prev - 1
          }
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isPlaying, currentSlide])

  // Calculate progress percentage (adjusted for visual consistency)
  const progressPercentage = (timer / 20) * 100

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white">
      {/* Main content with animation */}
      <div className="flex-1 relative overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-[1200ms] ease-out transform-gpu ${
              currentSlide === index 
                ? "opacity-100 z-10 scale-100 rotate-0 translate-x-0 translate-y-0 blur-0" 
                : index < currentSlide 
                  ? "opacity-0 z-0 scale-[1.4] -rotate-6 -translate-x-full translate-y-full blur-sm" 
                  : "opacity-0 z-0 scale-[0.6] rotate-6 translate-x-full -translate-y-full blur-sm"
            }`}
          >
            {slide.type === "image" ? (
              // Image slide
              <div
                className="absolute inset-0 bg-cover bg-center filter brightness-[0.9] transition-all duration-[1200ms]"
                style={{
                  backgroundImage: `url(${slide.source})`,
                }}
              />
            ) : (
              // YouTube slide
              <div className="absolute inset-0 bg-black transition-all duration-[1200ms]">
                {currentSlide === index && <div ref={playerContainerRef} className="w-full h-full"></div>}
              </div>
            )}

            {/* Text overlay for both image and video slides */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 flex flex-col items-center justify-center p-8">
              <div 
                className={`max-w-4xl w-full mx-auto text-center transform transition-all duration-[1200ms] ${
                  currentSlide === index 
                    ? "translate-y-0 opacity-100 scale-100 rotate-0" 
                    : index < currentSlide
                      ? "-translate-y-full opacity-0 scale-150 -rotate-12"
                      : "translate-y-full opacity-0 scale-50 rotate-12"
                }`}
              >
                <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center tracking-tight text-white drop-shadow-lg">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl text-center max-w-3xl mx-auto leading-relaxed text-gray-100 drop-shadow">
                  {slide.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gradient-to-r from-red-600 to-red-400 transition-all duration-1000 ease-linear"
        style={{ width: `${progressPercentage}%` }}
      />

      {/* Controls */}
      <div className="bg-black p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            className="text-white hover:bg-white/10 h-12 w-12 rounded-full"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <Button
            variant="ghost"
            onClick={togglePlay}
            className="text-white hover:bg-white/10 rounded-full h-12 w-12 flex items-center justify-center"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            className="text-white hover:bg-white/10 h-12 w-12 rounded-full"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-white/80 font-mono text-lg">{Math.ceil(timer)}s</div>
          <div className="text-white/80 bg-white/10 px-3 py-1 rounded-full text-sm">
            {currentSlide + 1}/{slides.length}
          </div>
        </div>
      </div>
    </div>
  )
}
