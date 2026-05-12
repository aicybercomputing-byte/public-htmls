
from threading import Thread, Lock
import matplotlib
import pandas as pd
import queue
import time
from piper import PiperVoice
import wave
import os
import math
import threading

from flask import Flask
from flask_sock import Sock
import threading, time

app = Flask(__name__)
sock = Sock(app)

current_html = "<h1>Loading…</h1>"

@app.route("/")
def index():
    return current_html

@sock.route('/ws')
def ws_route(ws):
    global current_html
    last = None
    while True:
        if current_html != last:
            ws.send(current_html)
            last = current_html
        time.sleep(0.05)

def update_loop():
    global current_html
    n = 0
    while True:
        n += 1
        current_html = f"<h1>Counter: {n}</h1><p>Updated live</p>"
        time.sleep(2)



voice = PiperVoice.load("piper_models/en_US-lessac-medium.onnx")

list_recent = []

display_urls = {"":"","Marjorie": "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1200&auto=format&fit=crop"}

#matplotlib.use("Agg") #check if commenting this breaks anything, if not, delete

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
            # New Piper returns AudioChunk with audio arrays
            audio = None

            if hasattr(chunk, "audio_int16_array") and chunk.audio_int16_array is not None:
                audio = chunk.audio_int16_array  # numpy int16 array
                f.writeframes(audio.tobytes())
                continue

            if hasattr(chunk, "audio_float_array") and chunk.audio_float_array is not None:
                audio = chunk.audio_float_array  # numpy float32 array in [-1, 1]
                # convert float -> int16
                audio16 = (audio * 32767).astype("int16")
                f.writeframes(audio16.tobytes())
                continue

            # Fallbacks in case field names differ slightly
            if hasattr(chunk, "samples") and chunk.samples is not None:
                audio = chunk.samples
                # assume already int16-like
                f.writeframes(audio.tobytes())
                continue

            raise AttributeError(
                f"Don't know how to get PCM from AudioChunk. Fields: {dir(chunk)}"
            )

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
    list_recent = []
    
    list_secondary = []
    
    for i in current:
        entry = {
            'student': f"Student {current[i].unum}",
            'advisor': current[i].advisor,
            'room': current[i].room,
            'time': current[i].time
        }
        if current[i].status == "paging":
            if entry not in list_recent:
                list_recent.append(entry)
        else:
            if entry not in list_secondary:
                list_secondary.append(entry)
    
    list_recent = sorted(list_recent, key=lambda x: x["time"], reverse=True)
    list_secondary = sorted(list_secondary, key=lambda x: x["time"], reverse=True)
   
    for i in list_secondary:
        if i not in list_recent:
            list_recent.append(i)
    
    return list_recent

###########################################
###########################################
######### Create the UI and Run it ########
###########################################
###########################################

current_html=f"""
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
          
        </tbody>
      </table>
    </div>

    <!-- RIGHT: Image -->
    <div class="panel image-panel">
      <div class="image-frame">
        <!-- replace src with your image path -->
        <img
          src="{display_urls[""]}"
          alt="Displayed picture"
        />
      </div>
    </div>
  </div>
</body>
</html>
"""




if __name__ == "__main__":
    time.sleep(5)
    threading.Thread(target=speaking, daemon=True).start()
    app.run(host="0.0.0.0", port=5000, debug=False)
