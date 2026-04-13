"""Generate 6 ambient sound WAV loops for Pomodoro timer using numpy/scipy DSP."""
import numpy as np
from scipy.signal import butter, lfilter
import wave, struct, io, os

SR = 16000  # 16kHz mono — good quality for ambient

def bp(lo, hi, order=2):
    return butter(order, [lo/(SR/2), min(hi/(SR/2), 0.99)], btype='band')

def lp(freq, order=2):
    return butter(order, freq/(SR/2), btype='low')

def hp(freq, order=2):
    return butter(order, freq/(SR/2), btype='high')

def crossfade_loop(audio, fade_ms=150):
    """Crossfade end into start for seamless looping."""
    fade = int(SR * fade_ms / 1000)
    if fade < 10 or len(audio) < fade * 3:
        return audio
    out = audio.copy()
    ramp_up = np.linspace(0, 1, fade)
    ramp_dn = np.linspace(1, 0, fade)
    out[:fade] = out[:fade] * ramp_up + audio[-fade:] * ramp_dn
    return out[:-fade]

def norm(audio, peak=0.85):
    mx = np.max(np.abs(audio))
    return audio / mx * peak if mx > 0 else audio

def save_wav(audio, path):
    pcm = np.clip(audio, -1, 1)
    pcm = (pcm * 32767).astype(np.int16)
    with wave.open(path, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm.tobytes())
    sz = os.path.getsize(path)
    print(f"  {os.path.basename(path)}: {sz//1024}KB ({len(audio)/SR:.1f}s)")

# ═══════════════════════════════════════
# RAIN — pink noise + prominent drop impacts
# ═══════════════════════════════════════
def make_rain():
    dur = 3.0
    n = int(SR * dur)
    
    # Pink noise base (rain on roof)
    white = np.random.randn(n)
    b, a = butter(2, [500/(SR/2), 7000/(SR/2)], btype='band')
    rain = lfilter(b, a, white) * 0.4
    
    # Window patter — brighter, higher layer
    patter = np.random.randn(n) * 0.15
    b2, a2 = hp(3000)
    patter = lfilter(b2, a2, patter) * 0.2
    
    # Rain drops — many resonant impacts
    drops = np.zeros(n)
    for i in range(n):
        if np.random.random() < 12 / SR:  # ~12 drops/sec
            freq = np.random.uniform(800, 3000)
            length = int(SR * np.random.uniform(0.02, 0.08))
            t = np.arange(length) / SR
            drop = np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.015) * np.random.uniform(0.4, 1.0)
            end = min(i + length, n)
            drops[i:end] += drop[:end - i]
    
    # Slow intensity variation
    env = 0.7 + 0.3 * np.sin(2 * np.pi * 0.07 * np.arange(n) / SR)
    
    out = (rain + patter + drops * 0.5) * env
    return norm(crossfade_loop(out))

# ═══════════════════════════════════════
# CAFÉ — voice murmur + prominent clinks + espresso burst
# ═══════════════════════════════════════
def make_cafe():
    dur = 4.0
    n = int(SR * dur)
    
    # Voice-like murmur — multiple narrow bands at speech formant freqs
    murmur = np.zeros(n)
    formants = [(300, 4), (850, 3), (1700, 4), (3200, 5)]
    for freq, q in formants:
        noise = np.random.randn(n) * 0.2
        bw = freq / q
        lo = max(80, freq - bw) / (SR / 2)
        hi = min((freq + bw) / (SR / 2), 0.99)
        b, a = butter(3, [lo, hi], btype='band')
        murmur += lfilter(b, a, noise)
    
    # Conversational amplitude rhythm
    rhythm = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 0.35 * np.arange(n) / SR))
    murmur *= rhythm * 0.35
    
    # Glass/ceramic clinks — PROMINENT, the defining character
    clinks = np.zeros(n)
    for i in range(n):
        if np.random.random() < 1.8 / SR:  # ~1.8 per second
            freq = np.random.uniform(3500, 7000)
            harmonics = [1.0, 0.5, 0.25]  # Add harmonics for metallic quality
            length = int(SR * np.random.uniform(0.06, 0.2))
            t = np.arange(length) / SR
            clink = np.zeros(length)
            for h, amp in enumerate(harmonics):
                clink += np.sin(2 * np.pi * freq * (h + 1) * t) * amp
            clink *= np.exp(-t / np.random.uniform(0.03, 0.08)) * np.random.uniform(0.5, 1.0)
            end = min(i + length, n)
            clinks[i:end] += clink[:end - i]
    
    # Plate/spoon — lower, duller metallic
    for i in range(n):
        if np.random.random() < 0.4 / SR:
            freq = np.random.uniform(1200, 2200)
            length = int(SR * 0.15)
            t = np.arange(length) / SR
            sound = np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.05) * 0.6
            end = min(i + length, n)
            clinks[i:end] += sound[:end - i]
    
    # Espresso machine burst — one occurrence
    esp_start = int(SR * np.random.uniform(1.5, 2.5))
    esp_dur = int(SR * 0.8)
    if esp_start + esp_dur < n:
        esp = np.random.randn(esp_dur)
        be, ae = hp(4000, 3)
        esp = lfilter(be, ae, esp) * 0.3
        env = np.ones(esp_dur)
        ramp = int(SR * 0.1)
        env[:ramp] = np.linspace(0, 1, ramp)
        env[-ramp:] = np.linspace(1, 0, ramp)
        esp *= env
        clinks[esp_start:esp_start + esp_dur] += esp
    
    out = murmur + clinks * 0.6
    return norm(crossfade_loop(out, 200))

# ═══════════════════════════════════════
# FOREST — birds + crickets dominate, minimal wind
# ═══════════════════════════════════════
def make_forest():
    dur = 5.0
    n = int(SR * dur)
    t_arr = np.arange(n) / SR
    
    # Very subtle wind — just atmosphere
    wind = np.random.randn(n) * 0.03
    bw, aw = butter(2, [80/(SR/2), 800/(SR/2)], btype='band')
    wind = lfilter(bw, aw, wind)
    
    # Crickets — continuous, AM-modulated tones (THE background character)
    cricket1 = np.sin(2 * np.pi * 4800 * t_arr) * 0.12
    cricket1 *= 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 11 * t_arr))  # on/off at 11Hz
    
    cricket2 = np.sin(2 * np.pi * 5600 * t_arr) * 0.08
    cricket2 *= 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 13.5 * t_arr))
    
    cricket3 = np.sin(2 * np.pi * 6400 * t_arr) * 0.05
    cricket3 *= 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 16 * t_arr))
    
    crickets = cricket1 + cricket2 + cricket3
    
    # Bird Type A: rapid chirp-chirp-chirp (robin)
    birds = np.zeros(n)
    for _ in range(int(dur * 1.2)):
        start = int(np.random.uniform(0, dur - 0.5) * SR)
        base_freq = np.random.uniform(2800, 4500)
        chirp_count = np.random.randint(2, 5)
        for c in range(chirp_count):
            offset = start + int(c * SR * 0.09)
            if offset + int(SR * 0.07) >= n:
                break
            length = int(SR * 0.06)
            t = np.arange(length) / SR
            # Upward sweep
            freq = base_freq + base_freq * 0.4 * t / t[-1]
            chirp = np.sin(2 * np.pi * np.cumsum(freq) / SR)
            chirp *= np.exp(-np.arange(length) / (SR * 0.025)) * 0.5
            birds[offset:offset + length] += chirp
    
    # Bird Type B: melodic warble (songbird) — longer, musical
    for _ in range(int(dur * 0.4)):
        start = int(np.random.uniform(0, dur - 0.8) * SR)
        base_freq = np.random.uniform(3000, 5500)
        length = int(SR * np.random.uniform(0.3, 0.5))
        if start + length >= n:
            continue
        t = np.arange(length) / SR
        # Frequency modulated — warbling
        freq_mod = base_freq * (1 + 0.25 * np.sin(2 * np.pi * np.random.uniform(6, 12) * t))
        warble = np.sin(2 * np.pi * np.cumsum(freq_mod) / SR)
        env = np.exp(-np.arange(length) / (SR * 0.2))
        env[:int(SR * 0.01)] *= np.linspace(0, 1, int(SR * 0.01))
        warble *= env * 0.35
        birds[start:start + length] += warble
    
    # Bird Type C: single clear note (like a cuckoo)
    for _ in range(int(dur * 0.3)):
        start = int(np.random.uniform(0, dur - 0.4) * SR)
        length = int(SR * 0.2)
        if start + length >= n:
            continue
        t = np.arange(length) / SR
        freq = np.random.uniform(1800, 2500)
        note = np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.08) * 0.3
        birds[start:start + length] += note
    
    out = wind + crickets + birds * 0.7
    return norm(crossfade_loop(out, 250))

# ═══════════════════════════════════════
# OCEAN — dramatic wave cycle with crash and recede
# ═══════════════════════════════════════
def make_ocean():
    dur = 6.0
    n = int(SR * dur)
    t_arr = np.arange(n) / SR
    
    # Wave envelope — slow rise and fall
    wave_period = 6.0
    phase = 2 * np.pi * t_arr / wave_period
    # Asymmetric: fast rise, slow fall (like a real wave)
    wave_env = np.clip(np.sin(phase), 0, 1) ** 0.4 * 0.8 + 0.2
    
    # Deep rumble — constant low
    brown = np.cumsum(np.random.randn(n) * 0.003)
    brown -= np.mean(brown)
    b1, a1 = lp(200)
    deep = lfilter(b1, a1, brown) * 3.0
    
    # Wave body — bandpass noise shaped by wave envelope
    wave_noise = np.random.randn(n)
    b2, a2 = bp(80, 600)
    wave_body = lfilter(b2, a2, wave_noise) * wave_env * 0.7
    
    # Foam/spray — high noise on wave peaks only
    foam_noise = np.random.randn(n)
    b3, a3 = hp(1500, 3)
    foam = lfilter(b3, a3, foam_noise)
    foam_env = np.clip(wave_env - 0.6, 0, 1) * 3.0  # only on peaks
    foam *= foam_env * 0.4
    
    # Wave crash impact — low thud at peak
    crash = np.zeros(n)
    peak_idx = int(SR * wave_period * 0.25)  # quarter through
    if peak_idx < n:
        thud_len = int(SR * 0.3)
        t = np.arange(thud_len) / SR
        thud = np.sin(2 * np.pi * 60 * t) * np.exp(-t / 0.08) * 0.5
        end = min(peak_idx + thud_len, n)
        crash[peak_idx:end] = thud[:end - peak_idx]
    
    out = deep + wave_body + foam + crash
    return norm(crossfade_loop(out, 300))

# ═══════════════════════════════════════
# WHITE NOISE — clean, simple
# ═══════════════════════════════════════
def make_whitenoise():
    n = int(SR * 2.0)
    wn = np.random.randn(n) * 0.5
    return norm(crossfade_loop(wn, 50))

# ═══════════════════════════════════════
# LO-FI — warm chord + vinyl crackle + bass
# ═══════════════════════════════════════
def make_lofi():
    dur = 4.0
    n = int(SR * dur)
    t_arr = np.arange(n) / SR
    
    # Warm pad — Cmaj7 chord through heavy lowpass
    chord = np.zeros(n)
    for freq, amp in [(130.81, 0.18), (164.81, 0.14), (196.00, 0.11), (246.94, 0.08)]:
        # Slight detune for warmth
        chord += np.sin(2 * np.pi * freq * 1.002 * t_arr) * amp
        chord += np.sin(2 * np.pi * freq * 0.998 * t_arr) * amp * 0.8
    # Heavy lowpass for that muffled feel
    bc, ac = lp(350, 3)
    chord = lfilter(bc, ac, chord)
    # Gentle wobble
    chord *= 1 + 0.03 * np.sin(2 * np.pi * 0.15 * t_arr)
    
    # Warm noise bed — very muffled
    noise = np.random.randn(n)
    bn, an = lp(250, 3)
    warm = lfilter(bn, an, noise) * 0.12
    
    # Vinyl crackle — random clicks, clearly audible
    crackle = np.zeros(n)
    for i in range(n):
        if np.random.random() < 25 / SR:
            amp = np.random.uniform(0.05, 0.25)
            crackle[i] = amp * np.random.choice([-1, 1])
    # Slight filtering
    bk, ak = lp(6000)
    crackle = lfilter(bk, ak, crackle)
    
    # Bass pulse — slow, rhythmic
    bass = np.sin(2 * np.pi * 65.41 * t_arr) * 0.1
    bass *= 0.7 + 0.3 * np.sin(2 * np.pi * 0.5 * t_arr)
    bb, ab = lp(120)
    bass = lfilter(bb, ab, bass)
    
    out = chord + warm + crackle + bass
    return norm(crossfade_loop(out, 200))


# ═══════════════════════════════════════
# GENERATE ALL
# ═══════════════════════════════════════
OUT_DIR = r"C:\ssClawy\aguidetocloud-revamp\static\audio"

print("Generating ambient sound loops...")
sounds = {
    'pomo-rain': make_rain,
    'pomo-cafe': make_cafe,
    'pomo-forest': make_forest,
    'pomo-ocean': make_ocean,
    'pomo-whitenoise': make_whitenoise,
    'pomo-lofi': make_lofi,
}

for name, gen_fn in sounds.items():
    print(f"  Generating {name}...")
    audio = gen_fn()
    save_wav(audio, os.path.join(OUT_DIR, f"{name}.wav"))

total = sum(os.path.getsize(os.path.join(OUT_DIR, f)) for f in os.listdir(OUT_DIR) if f.startswith('pomo-'))
print(f"\nDone! Total: {total//1024}KB")
