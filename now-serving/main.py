
from threading import Thread, Lock
import pandas as pd
import time
from piper import PiperVoice
import wave
import os

from flask import Flask

app = Flask(__name__)

current_html = "<h1>Loading…</h1>"

@app.route("/")
def index():
    return current_html


voice = PiperVoice.load("piper_models/en_US-lessac-medium.onnx")

list_recent = []

display_urls = {"":"","Marjorie": "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1200&auto=format&fit=crop"}

# Use app-approved SharePoint source configured by environment.
bellini_college_checkin = os.getenv("NOW_SERVING_CHECKIN_SOURCE_URL", "")
current = {}

class student_login:
        def __init__(self,_time, _unum, _advisor, _room, _status = "waiting"):
            self.unum = _unum
            self.advisor = _advisor
            self.room = _room
            self.time = _time
            self.status = _status
            self.msg = ""

mutex = Lock()

# speaking
def to_wav(text, out_path):
    with wave.open(out_path, "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)  # 16-bit
        f.setframerate(voice.config.sample_rate)

        for chunk in voice.synthesize(text):
            # Pinned piper-tts version yields AudioChunk with audio_float_array
            # (numpy float32 in [-1, 1]); convert to int16 PCM.
            if not hasattr(chunk, "audio_float_array") or chunk.audio_float_array is None:
                raise AttributeError(
                    f"Don't know how to get PCM from AudioChunk (expected audio_float_array). "
                    f"Fields: {dir(chunk)}"
                )
            audio16 = (chunk.audio_float_array * 32767).astype("int16")
            f.writeframes(audio16.tobytes())

def check_line_status(t, status):
    # check if the status has changed
    if status != current[t].status:
        current[t].status = status  
    # check if it's paging and return true
    if current[t].status == "paging":
        return True
    return False

def test_create_line(line):
    # parse the line
    t = line['timestamp']
    unum = line['unum']
    advisor = line['advisor'].strip()
    room = line['office']
    status = line['status'].strip()
    
    # check if it exists
    if t not in current:
        # create the new login
        student_login_instance = student_login(t,unum,advisor,room,status)
        #add it
        current[t] = student_login_instance
        
    return check_line_status(t, status)

def speaking():
    global current, current_html
    while True:
        
        decrimenter = 0

        with open('current.csv') as fff:
            df = pd.read_csv(fff)
            
            
        for index, row in df.iterrows():
          try:
            ttt = test_create_line(row)
            print("declare a")
            timestamp = row['timestamp']
            
            print("declare b")
            student=current[timestamp]
            
            print("declare c")
            current_html = html_update(student.advisor)
            print("declare d")
            if ttt:
                
                print("here we chunk out the u number into two digit entries, prepending and appending the correct items")
                # here we chunk out the u number into two digit entries, prepending and appending the correct items
                chunks =[f"{student.advisor} will now see"] + [str(student.unum)[i:i+2] for i in range(0, len(str(student.unum)), 2)] + [f"in room {student.room}"]
                
                print("confirm they're all there")
                # confirm they're all there
                for i in chunks:
                    if not os.path.exists(f'words/{i.replace(' ', '-')}.wav'):
                        to_wav(i, f'words/{i.replace(' ', '-')}.wav')
                
                for i in chunks:
                    print(i)
                    os.system(f"aplay -D default words/{i.replace(' ', '-')}.wav")
                
                decrimenter -= 2
                print(decrimenter)
                time.sleep(2)
          except Exception as e:
            print(f"error: {e}")
        time.sleep(120 + decrimenter)
    
# html
def html_update(advisor_name):
    
    html_recent = ""
    for entry in update_list_recent():
        print(entry)
        html_recent += f"<tr><td>{entry['student']}</td><td>{entry['advisor']}</td><td>{entry['room']}</td></tr>\n"
        
    
    return f"""
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bellini College Waiting Room</title>
  <style>
    :root{{
      --bg: #0b0f0c;
      --panel: #0f1511;
      --green: #37ff7a;
      --green-dim: rgba(55, 255, 122, 0.45);
      --text: #d7ffe5;
    }}

    * {{ box-sizing: border-box; }}

    body{{
      margin: 0;
      min-height: 100vh;
      background: radial-gradient(1200px circle at 20% -10%, #0f2015 0%, transparent 60%),
                  radial-gradient(900px circle at 120% 10%, #0f1c25 0%, transparent 55%),
                  var(--bg);
      color: var(--text);
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      display: grid;
      place-items: center;
      padding: 24px;
    }}

    .wrap{{
      width: min(1100px, 100%);
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 20px;
      align-items: start;
    }}

    .panel{{
      background: linear-gradient(180deg, rgba(18, 28, 21, 0.9), rgba(10, 14, 12, 0.95));
      border: 1px solid var(--green-dim);
      border-radius: 14px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      padding: 14px;
    }}

    table{{
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 16px;
      color: var(--green);
    }}

    th, td{{
      border: 1px solid var(--green-dim);
      padding: 10px 12px;
      height: 44px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }}

    th{{
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
      background: rgba(55, 255, 122, 0.06);
    }}
    
    h1{{
      color: var(--green);
      letter-spacing: 0.08em;
      font-weight: 700;
      background: rgba(55, 255, 122, 0.06);
    }}

    tr:hover td{{
      background: rgba(55, 255, 122, 0.05);
    }}

    .image-panel{{
      display: grid;
      gap: 10px;
    }}

    .image-panel .title{{
      font-weight: 700;
      color: var(--green);
      letter-spacing: 0.04em;
      font-size: 14px;
      opacity: 0.9;
      margin: 2px 2px 6px;
    }}

    .image-frame{{
      position: relative;
      width: 100%;
      aspect-ratio: 4 / 3;
      border: 1px solid var(--green-dim);
      border-radius: 12px;
      overflow: hidden;
      background: #050705;
    }}

    .image-frame img{{
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      filter: saturate(1.05) contrast(1.02);
    }}

    .image-frame::after{{
      content: "";
      position: absolute;
      inset: 0;
      box-shadow: inset 0 0 0 1px rgba(55,255,122,0.12),
                  inset 0 0 40px rgba(0,0,0,0.6);
      pointer-events: none;
    }}

    /* Responsive: stack on small screens */
    @media (max-width: 820px){{
      .wrap{{
        grid-template-columns: 1fr;
      }}
    }}
  </style>
</head>
<body>
<div><h1>Bellini College of Artificial Intelligence, Cybersecurity and Computing</h1></div>
  <div class="wrap">
    <!-- LEFT: Table -->
    <div class="panel">
      <table aria-label="Two-column eight-row green table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Advisor</th>
            <th>Room Number</th>
          </tr>
        </thead>
        <tbody>
          {html_recent}      
        </tbody>
      </table>
    </div>

    <!-- RIGHT: Image -->
    <div class="panel image-panel">
      <div class="image-frame">
        <!-- replace src with your image path -->
        <img
          src="{display_urls[advisor_name]}"
          alt="Displayed picture"
        />
      </div>
    </div>
  </div>
</body>
</html>
"""

def update_list_recent():
    global list_recent

    entries = []
    for i in current:
        entries.append({
            'student': f"Student {current[i].unum}",
            'advisor': current[i].advisor,
            'room': current[i].room,
            'time': current[i].time,
            'status': current[i].status,
        })

    # Paging entries first (most recent first), then everyone else (most
    # recent first). A single sort keyed on (not paging, -time) followed by
    # one dedup pass (keeping the first -- i.e. highest-priority -- copy of
    # each student/advisor/room/time combo) reproduces the old two-list
    # sort+merge exactly: paging entries win the dedup over a matching
    # non-paging entry, same as before.
    entries.sort(key=lambda x: (x["status"] != "paging", -x["time"]))

    list_recent = []
    for entry in entries:
        content = {k: v for k, v in entry.items() if k != "status"}
        if content not in list_recent:
            list_recent.append(content)
    return list_recent

###########################################
###########################################
######### Create the UI and Run it ########
###########################################
###########################################

current_html = html_update("")




if __name__ == "__main__":
    time.sleep(5)
    Thread(target=speaking, daemon=True).start()
    app.run(host="0.0.0.0", port=5000, debug=False)
