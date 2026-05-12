# /audio-debug

Debug the pitch detection pipeline — useful when the tuner is inaccurate, noisy, or not detecting pitch.

## Steps

1. Spawn the `audio-engineer` agent with the current contents of `src/audio/PitchDetector.ts` and `src/audio/AudioEngine.ts`
2. Ask it to audit:
   - RMS silence threshold (is it rejecting valid quiet signals?)
   - Autocorrelation buffer size (fftSize on AnalyserNode)
   - Rolling average window (is smoothing too aggressive or too loose?)
   - Any off-by-one or sample rate errors in the lag → Hz conversion
3. Report findings and apply any fixes
