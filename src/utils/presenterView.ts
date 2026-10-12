/**
 * A lightweight "Presenter View" that opens a second browser window showing the
 * current slide text, speaker notes, the upcoming slide, and an elapsed timer.
 * The presenter window is updated from the main app with postMessage, so no
 * second physical display is required.
 */

export type PresenterData = {
  index: number;
  total: number;
  notes: string;
  slideText: string;
  nextText: string;
};

let presenterWin: Window | null = null;

export function isPresenterViewOpen(): boolean {
  return !!presenterWin && !presenterWin.closed;
}

export function openPresenterView(): Window | null {
  presenterWin = window.open(
    "",
    "britslide-presenter",
    "width=1000,height=660,menubar=no,toolbar=no,location=no,status=no"
  );
  if (!presenterWin) return null;
  presenterWin.document.write(`<!doctype html><html><head><meta charset="utf-8">
<title>Presenter View</title>
<style>
  html,body{margin:0;height:100%;font-family:'Segoe UI',Calibri,sans-serif;background:#1c1c1c;color:#eee}
  .grid{display:grid;grid-template-columns:1.4fr 1fr;grid-template-rows:auto 1fr;height:100%;gap:10px;padding:12px;box-sizing:border-box}
  .bar{grid-column:1/3;display:flex;justify-content:space-between;align-items:center;font-size:15px}
  .card{background:#2b2b2b;border-radius:8px;padding:14px;overflow:auto}
  .lbl{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#9aa0a6;margin-bottom:8px}
  .big{font-size:20px;line-height:1.4;white-space:pre-wrap}
  #notes{font-size:16px;line-height:1.5;white-space:pre-wrap;color:#dfe1e5}
  #timer{font-variant-numeric:tabular-nums;font-size:22px;font-weight:600}
  .next .big{font-size:16px;color:#c7c9cc}
</style></head><body>
  <div class="grid">
    <div class="bar">
      <div id="slideNo" class="big" style="font-size:16px">Slide 1 of 1</div>
      <div id="timer">00:00:00</div>
    </div>
    <div class="card">
      <div class="lbl">Current slide</div>
      <div id="current" class="big"></div>
    </div>
    <div class="card">
      <div class="lbl">Speaker notes</div>
      <div id="notes"></div>
    </div>
    <div class="card next" style="grid-column:1/3">
      <div class="lbl">Next slide</div>
      <div id="next" class="big"></div>
    </div>
  </div>
  <script>
    var started = Date.now();
    function pad(n){return (n<10?'0':'')+n;}
    setInterval(function(){
      var s = Math.floor((Date.now()-started)/1000);
      document.getElementById('timer').textContent =
        pad(Math.floor(s/3600))+':'+pad(Math.floor(s/60)%60)+':'+pad(s%60);
    }, 500);
    window.addEventListener('message', function(e){
      var d = e.data;
      if(!d || d.type!=='britslide-presenter') return;
      document.getElementById('slideNo').textContent = 'Slide ' + (d.index+1) + ' of ' + d.total;
      document.getElementById('current').textContent = d.slideText || '(no text)';
      document.getElementById('notes').textContent = d.notes || '(no speaker notes)';
      document.getElementById('next').textContent = d.nextText || '(end of presentation)';
    });
  <\/script>
</body></html>`);
  presenterWin.document.close();
  return presenterWin;
}

export function updatePresenterView(data: PresenterData): void {
  if (!presenterWin || presenterWin.closed) return;
  try {
    presenterWin.postMessage({ type: "britslide-presenter", ...data }, "*");
  } catch {
    /* window closed between checks */
  }
}

export function closePresenterView(): void {
  if (presenterWin && !presenterWin.closed) presenterWin.close();
  presenterWin = null;
}
