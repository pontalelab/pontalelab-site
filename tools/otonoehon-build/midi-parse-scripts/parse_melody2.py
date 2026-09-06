import struct

def read_var_len(data, i):
    value = 0
    while True:
        b = data[i]; i += 1
        value = (value << 7) | (b & 0x7f)
        if not (b & 0x80):
            break
    return value, i

def parse_midi(path):
    data = open(path, 'rb').read()
    header_len = struct.unpack('>I', data[4:8])[0]
    fmt, ntracks, division = struct.unpack('>HHH', data[8:8+header_len])
    i = 8 + header_len
    tracks = []
    for t in range(ntracks):
        i += 4
        track_len = struct.unpack('>I', data[i:i+4])[0]
        i += 4
        track_end = i + track_len
        events = []
        tick = 0
        running_status = None
        while i < track_end:
            delta, i = read_var_len(data, i)
            tick += delta
            status = data[i]
            if status < 0x80:
                status = running_status
            else:
                i += 1
                running_status = status if status < 0xF0 else running_status
            if status == 0xFF:
                meta_type = data[i]; i += 1
                length, i = read_var_len(data, i)
                meta_data = data[i:i+length]; i += length
                events.append(('meta', tick, meta_type, meta_data))
            elif status in (0xF0, 0xF7):
                length, i = read_var_len(data, i)
                i += length
            else:
                hi = status & 0xF0
                ch = status & 0x0F
                if hi in (0x80, 0x90, 0xA0, 0xB0, 0xE0):
                    d1 = data[i]; d2 = data[i+1]; i += 2
                    events.append(('midi', tick, hi, ch, d1, d2))
                elif hi in (0xC0, 0xD0):
                    d1 = data[i]; i += 1
                    events.append(('midi', tick, hi, ch, d1, None))
        tracks.append(events)
        i = track_end
    return fmt, ntracks, division, tracks

fmt, ntracks, division, tracks = parse_midi('/mnt/user-data/uploads/シャホ_ン玉.mid')
NAMES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
def midi_name(n): return f"{NAMES[n%12]}{n//12 - 1}"

for tidx in (1,2):
    print(f"--- track {tidx} ---")
    active = {}
    notes = []
    for e in tracks[tidx]:
        if e[0]!='midi': continue
        kind, tick, hi, ch, d1, d2 = e
        if hi==0x90 and d2>0:
            active[d1] = tick
        elif hi==0x80 or (hi==0x90 and d2==0):
            if d1 in active:
                start = active.pop(d1)
                notes.append((start, tick, d1))
    notes.sort()
    for start,end,pitch in notes[:20]:
        beatq = start/division
        dur = (end-start)/division
        measure = int(beatq//4)
        pos = beatq - measure*4
        print(f"  m{measure} pos{pos:.2f} dur{dur:.2f} {midi_name(pitch)}({pitch})")
