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

fmt, ntracks, division, tracks = parse_midi('/mnt/user-data/uploads/シャホ_ン玉.mid')
print('format', fmt, 'ntracks', ntracks, 'division', division)

for e in tracks[0]:
    if e[0]=='meta' and e[2]==0x51:
        us = int.from_bytes(e[3],'big')
        print('tempo', us, '-> bpm', round(60000000/us,1))
    if e[0]=='meta' and e[2]==0x58:
        print('timesig', e[3][0], '/', 2**e[3][1])

for idx, events in enumerate(tracks):
    metas = [e for e in events if e[0]=='meta']
    names = [e[3] for e in metas if e[2]==0x03]
    prog = [e for e in events if e[0]=='midi' and e[2]==0xC0]
    note_ons = [e for e in events if e[0]=='midi' and e[2]==0x90 and e[5]>0]
    if names or prog or note_ons:
        nm = [n.decode('shift_jis','ignore') for n in names]
        progs = set((e[3], e[4]) for e in prog)
        pitches = sorted(set(e[4] for e in note_ons))
        print(f"track {idx}: names={nm} programs={progs} notecount={len(note_ons)} pitch_range={pitches[:3]}..{pitches[-3:] if pitches else []}")
