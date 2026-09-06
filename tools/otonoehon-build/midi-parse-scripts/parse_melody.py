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
    assert data[0:4] == b'MThd'
    header_len = struct.unpack('>I', data[4:8])[0]
    fmt, ntracks, division = struct.unpack('>HHH', data[8:8+header_len])
    i = 8 + header_len
    tracks = []
    for t in range(ntracks):
        assert data[i:i+4] == b'MTrk'
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
                else:
                    raise ValueError(f"unknown status {status:x} at {i}")
        tracks.append(events)
        i = track_end
    return fmt, ntracks, division, tracks

fmt, ntracks, division, tracks = parse_midi('/mnt/user-data/uploads/ふ_んふ_んふ_ん.mid')
print('division (ticks/quarter):', division)

for e in tracks[0]:
    if e[0]=='meta' and e[2]==0x51:
        us_per_q = int.from_bytes(e[3], 'big')
        print('tempo us/quarter:', us_per_q, '-> BPM', round(60000000/us_per_q,1))
    if e[0]=='meta' and e[2]==0x58:
        num, den_pow, clocks, notated32 = e[3]
        print('time sig:', num, '/', 2**den_pow)

track = tracks[2]
notes = []
active = {}
for e in track:
    if e[0]!='midi': continue
    kind, tick, hi, ch, d1, d2 = e
    if hi==0x90 and d2>0:
        active[d1] = tick
    elif (hi==0x80) or (hi==0x90 and d2==0):
        if d1 in active:
            start = active.pop(d1)
            notes.append((start, tick, d1))

notes.sort()
NAMES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
def midi_to_name(n):
    return f"{NAMES[n%12]}{n//12 - 1}"

print(f"total notes: {len(notes)}")
for start, end, pitch in notes:
    beat = start/division
    dur_beats = (end-start)/division
    measure = int(beat//4)
    beat_in_measure = beat - measure*4
    print(f"tick {start:4d}-{end:4d} | beat(q)={beat:6.2f} dur={dur_beats:5.2f} | measure {measure} beat_in_measure {beat_in_measure:.2f} | pitch {pitch} {midi_to_name(pitch)}")
