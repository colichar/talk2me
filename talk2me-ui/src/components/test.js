import React, { useMemo, useState, useCallback, useRef } from 'react'
import { useWavesurfer } from '@wavesurfer/react'
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'


const formatTime = (seconds) => [seconds / 60, seconds % 60].map((v) => `0${Math.floor(v)}`.slice(-2)).join(':')

const Test = () => {
  const containerRef = useRef(null)
  const [audioUrl, setAudioUrl] = useState(null)

  const { wavesurfer, isPlaying, currentTime, isRecording } = useWavesurfer({
    container: containerRef,
    height: 100,
    waveColor: '#ddd',
    progressColor: '#ff006c',
    barWidth: 0,
    barRadius: 0,
    url: audioUrl,
    plugins: useMemo(() => [], []),
  })

  const record = wavesurfer?.registerPlugin(RecordPlugin.create({ scrollingWaveform: false, renderRecordedAudio: false }))
  record?.on('record-end', (blob) => {
    const recordedUrl = URL.createObjectURL(blob)
    console.log('recorded:', recordedUrl)

    setAudioUrl(recordedUrl)
  })

  function startRecord() {
    if (record.isRecording() || record.isPaused()) {
      console.log('stop recording')
      record.stopRecording()
      return
    }

    const deviceId = RecordPlugin.getAvailableAudioDevices().then((devices) => {
      return devices[0].deviceId
    })

    record.startRecording({ deviceId }).then(() => {
      console.log('recording')
    })
  }

  const onPlayPause = useCallback(() => {
    wavesurfer && wavesurfer.playPause()
  }, [wavesurfer])

  return (
    <>
      <div ref={containerRef} />

      <p>Current time: {formatTime(currentTime)}</p>

      <div style={{ margin: '1em 0', display: 'flex', gap: '1em' }}>

        <button onClick={onPlayPause} style={{ minWidth: '5em' }}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button onClick={startRecord} style={{ minWidth: '5em' }}>
          {isRecording ? 'Stop record' : 'Start record'}
        </button>
      </div>
    </>
  )
}

export default Test;