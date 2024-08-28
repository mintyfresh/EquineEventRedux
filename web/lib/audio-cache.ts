const audioContext = typeof AudioContext !== 'undefined' ? new AudioContext() : null
const audioClipCache = new Map<string, Promise<AudioBuffer>>()

export async function preloadAudioClip(url: string): Promise<AudioBuffer | null> {
  let audioClip = audioClipCache.get(url) ?? null

  if (audioContext && !audioClip) {
    audioClip = new Promise(async (resolve, reject) => {
      const request = await fetch(url)
      const encodedAudioData = await request.arrayBuffer()
      audioContext.decodeAudioData(encodedAudioData, resolve, reject)
    })

    audioClipCache.set(url, audioClip)
  }

  return audioClip
}

export async function playAudioClip(url: string): Promise<void> {
  const audioClip = audioClipCache.get(url)

  if (audioContext && audioClip) {
    const audioSource = audioContext.createBufferSource()

    audioSource.buffer = await audioClip
    audioSource.connect(audioContext.destination)
    audioSource.start()
  }
}
