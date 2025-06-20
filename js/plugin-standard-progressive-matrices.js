// jspsych-standard-progressive-matrices.js
// Version 1.6.6 – mit per-page Datenaufzeichnung inkl. question_number, prompt, instructions und time_limit-Zeile
var jsPsychStandardProgressiveMatrices = (function (jspsych) {
  "use strict";

  /* ---------- Parameter ---------- */
  const info = {
    name: "jsPsychStandardProgressiveMatrices",
    version: "1.6.6",
    parameters: {
      pages:          { type: jspsych.ParameterType.COMPLEX,     default: undefined },
      prompt:         { type: jspsych.ParameterType.HTML_STRING, default: ""        },
      instructions:   { type: jspsych.ParameterType.HTML_STRING, default: ""        },
      required:       { type: jspsych.ParameterType.BOOL,        default: false     },
      allow_skipping: { type: jspsych.ParameterType.BOOL,        default: false     },
      time_limit:     { type: jspsych.ParameterType.INT,         default: 7200      },
    },
  };

  /* Helper: DOM-Element erstellen */
  const el = (tag, idOrCls, parent, html = "") => {
    const d = document.createElement(tag);
    if (idOrCls?.startsWith("#")) d.id = idOrCls.slice(1);
    else if (idOrCls) d.className = idOrCls;
    if (html) d.innerHTML = html;
    if (parent) parent.appendChild(d);
    return d;
  };

  class StandardProgressiveMatricesPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      if (!Array.isArray(trial.pages) || trial.pages.length === 0) {
        throw new Error("Keine Seiten definiert.");
      }

      // Seiten kopieren und Parameter auslesen
      const pages = trial.pages.map(p => ({
        stimulus:       p.stimulus,
        choices:        p.choices.slice(),
        prompt:         p.prompt       ?? trial.prompt,
        instructions:   p.instructions ?? trial.instructions,
        correct_choice: p.correct_choice ?? null
      }));

      let idx          = 0;
      const responses   = [];
      const correctness  = [];
      const stamps       = [];
      const rts          = [];
      let remaining     = trial.time_limit;
      let timer;

      // Grund-Layout
      display_element.innerHTML = "";
      const header    = el("div", "#spm-header", display_element);
      const counter   = el("div", "#spm-page-counter", header);
      const timerDiv  = el("div", "#spm-timer", header);

      const barWrap   = el("div", "#spm-progress", display_element);
      const barFill   = el("div", "#spm-progress-bar", barWrap);

      const container = el("div", "#spm-container", display_element);

      // Timer-Funktion
      const tick = () => {
        const m = String(Math.floor(remaining / 60)).padStart(2, "0");
        const s = String(remaining % 60).padStart(2, "0");
        timerDiv.textContent = `${m}:${s}`;
        if (--remaining < 0) {
          clearInterval(timer);
          finish();
        }
      };
      tick();
      timer = setInterval(tick, 1000);

      const letters = "abcdefghi".split("");

      // Render-Funktion
      const render = () => {
        if (idx > 0) {
          container.style.minHeight = container.clientHeight + "px";
        }

        stamps.push(performance.now());
        counter.textContent = `${idx + 1}.`;
        barFill.style.width  = (((idx + 1) / pages.length) * 100).toFixed(1) + "%";

        const { stimulus, choices, prompt, instructions } = pages[idx];

        container.innerHTML = `
          <div id="spm-prompt-box"><div id="spm-prompt-text">${prompt}</div></div>
          <div id="spm-stimulus-box" style="background:#fff;">
            <img class="spm-stimulus-image" src="${stimulus}" style="background:#fff;">
          </div>
          <div id="spm-instructions-box"><div id="spm-instructions-text">${instructions}</div></div>
          <div id="spm-gray-box" style="visibility:hidden;">
            ${choices.map((url,i) => `
              <div class="spm-item-container">
                <img src="${url}">
                <input type="checkbox" name="spm-choice">
                <div class="spm-label">${letters[i]}.</div>
              </div>
            `).join("")}
          </div>
          <div id="spm-footer" style="visibility:hidden;">
            <div id="spm-skip-container">
              <label><input type="checkbox" id="spm-skip"> Frage überspringen</label>
            </div>
            <button id="spm-next">Weiter</button>
          </div>`;

        // Sichtbar machen, wenn alle Bilder geladen
        const gray   = container.querySelector("#spm-gray-box");
        const footer = container.querySelector("#spm-footer");
        const imgs   = Array.from(container.querySelectorAll("img"));
        let ready = 0;
        const unveil = () => {
          if (++ready === imgs.length) {
            gray.style.visibility   = "visible";
            footer.style.visibility = "visible";
            container.style.minHeight = "";
          }
        };
        imgs.forEach(img => {
          if (img.complete) unveil();
          else img.addEventListener("load", unveil, { once: true });
        });

        // Interaktion
        const boxes   = Array.from(container.querySelectorAll(".spm-item-container"));
        const nextBtn = container.querySelector("#spm-next");
        const skipChk = container.querySelector("#spm-skip");
        const skipWrp = container.querySelector("#spm-skip-container");

        boxes.forEach((box) => {
  const cb = box.querySelector("input");
  box.onclick = (e) => {
    if (e.target.tagName === "INPUT") return;
    // Wenn dieses Kästchen schon angehakt ist → abwählen
    if (cb.checked) {
      cb.checked = false;
      this.sel[this.idx] = null;
    } else {
      // Sonst: alle abwählen und dieses anhaken
      boxes.forEach((b) => b.querySelector("input").checked = false);
      cb.checked = true;
      this.sel[this.idx] = parseInt(box.dataset.idx, 10);
      skipWrp.classList.remove("visible");
    }
  };
});


        nextBtn.onclick = () => {
          const rt = performance.now() - stamps[idx];
          rts.push(rt);

          const selIdx = boxes.findIndex(b => b.querySelector("input").checked);
          const resp   = selIdx >= 0 ? selIdx + 1 : "skipped";
          const corrCh = pages[idx].correct_choice;
          const isCorr = corrCh != null && resp !== "skipped" && corrCh === resp ? "yes" : "no";

          if (trial.required && resp === "skipped" && !skipChk.checked) {
            if (trial.allow_skipping) skipWrp.classList.add("visible");
            return;
          }

          responses.push(resp);
          correctness.push(isCorr);
          idx++;
          if (idx < pages.length) render();
          else finish();
        };
      };

      // Finish-Funktion: pro Seite eine Zeile, dann Zeitlimit-Zeile
      const finish = () => {
        clearInterval(timer);
        const dataArray = this.jsPsych.data.get();
        // pro Seite
        responses.forEach((choice, i) => {
          dataArray.push({
            trial_type:     info.name,
            question_number:i + 1,
            stimulus:       pages[i].stimulus,
            choices:        pages[i].choices,
            prompt:         pages[i].prompt,
            instructions:   pages[i].instructions,
            correct_choice: pages[i].correct_choice,
            choice:         choice,
            correct:        correctness[i],
            rt:             rts[i]
          });
        });
        // Zusammenfassungs-Zeile mit time_limit
        dataArray.push({
          trial_type: info.name,
          time_limit: trial.time_limit
        });
        this.jsPsych.finishTrial();
      };

      render();
    }
  }

  StandardProgressiveMatricesPlugin.info = info;
  return StandardProgressiveMatricesPlugin;
})(jsPsychModule);
