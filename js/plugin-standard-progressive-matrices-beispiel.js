// jspsych-standard-progressive-matrices-beispiel.js
// Version 1.4.0 – Progress-Bar, Feedback klick- und hover-sicher

var jsPsychStandardProgressiveMatricesBeispiel = (function(jspsych) {
  "use strict";

  const info = {
    name: "jsPsychStandardProgressiveMatricesBeispiel",
    version: "1.4.0",
    parameters: {
      pages:           { type: jspsych.ParameterType.COMPLEX, array: true, default: [] },
      prompt:         { type: jspsych.ParameterType.HTML_STRING, default: "" },
      instructions:   { type: jspsych.ParameterType.HTML_STRING, default: "Wähle die richtige Antwort und klicke auf Weiter." },
      button_next:    { type: jspsych.ParameterType.STRING,       default: "Weiter" },
      remark_correct: { type: jspsych.ParameterType.HTML_STRING, default: "Das ist richtig!" },
      remark_incorrect:{ type: jspsych.ParameterType.HTML_STRING, default: "Das ist leider falsch." }
    }
  };

  class Plugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      this.trial    = trial;
      this.idx      = 0;
      this.feedback = false;
      this.letters  = ["a","b","c","d","e","f","g","h","i"];
      this.sel      = Array(trial.pages.length).fill(null);
      this.stamps   = [];
      this.rts      = [];

      const imgs = trial.pages.flatMap(p => [p.stimulus, ...p.choices]);
      this.jsPsych.pluginAPI.preloadImages(imgs, () => this.render(display_element));
    }

    render(el) {
      const p      = this.trial.pages[this.idx];
      const total  = this.trial.pages.length;
      const corrIx = (p.correct_choice ?? 1) - 1;
      const picked = this.sel[this.idx];
      const correct= picked === corrIx;
      const lCorr  = this.letters[corrIx];

      // inject only feedback-CSS once
      if (!document.getElementById("spm-feedback-css")) {
  const st = document.createElement("style");
  st.id = "spm-feedback-css";
  st.textContent = `
    /* Container bleibt grün getönt */
    .feedback .spm-item-container {
      cursor: default !important;
      pointer-events: none !important;
      transform: none !important;
      box-shadow: none !important;
    }
    /* Label-Box transparent, damit das Grün durchscheint */
    .feedback .spm-label {
      background: transparent !important;
    }
  `;
  document.head.appendChild(st);
}

      // HEADER
      let html = `
        <div id="spm-header" style="
          display:grid;
          grid-template-columns:auto 1fr;
          align-items:center;
          gap:.6rem;
          width:70%; max-width:1800px;
          margin:0.6rem auto 0.4rem;
        ">
          <div id="spm-page-counter">${this.idx+1}.</div>
          <div></div>
        </div>`;

      // PROGRESS BAR
      const pct = ((this.idx+1)/total)*100;
      html += `
        <div id="spm-progress" style="
          width:70%; max-width:1800px; height:6px;
          background:var(--border-color);
          margin:0 auto 0.8rem;
          border-radius:3px; overflow:hidden;
        ">
          <div id="spm-progress-bar" style="
            height:100%; width:${pct}%;
            background:var(--accent-color);
          "></div>
        </div>`;

      // CONTAINER mit optionalem .feedback-Klasse
      const cls = this.feedback ? ' class="feedback"' : "";
      html += `<div id="spm-container"${cls}>`;

      // Prompt / Feedback-Text
      if (!this.feedback) {
        html += `
          <div id="spm-prompt-box">
            <div id="spm-prompt-text">${p.prompt ?? this.trial.prompt}</div>
          </div>`;
      } else {
        const l1 = `<span style="font-size:1.3em;font-weight:600;">
                      ${correct ? this.trial.remark_correct : this.trial.remark_incorrect}
                    </span>`;
        const l2 = correct ? "" : `Die richtige Lösung ist <i>${lCorr}</i>.`;
        html += `
          <div id="spm-prompt-box">
            <div id="spm-prompt-text">${l1}<br>${l2}</div>
          </div>`;
      }

      // Stimulus
      html += `
        <div id="spm-stimulus-box">
          <img class="spm-stimulus-image" src="${p.stimulus}">
        </div>`;

      // Instructions / Feedback
      if (!this.feedback) {
        html += `
          <div id="spm-instructions-box">
            <div id="spm-instructions-text">${
              p.instructions ?? this.trial.instructions
            }</div>
          </div>`;
      } else {
        html += `
          <div id="spm-instructions-box">
            <div id="spm-instructions-text">
              Antwort <i>${lCorr}</i> ist richtig!
            </div>
          </div>`;
      }

      // Antwortmöglichkeiten
      html += `<div id="spm-gray-box">`;
      p.choices.forEach((url,i) => {
        const sel   = picked === i;
        let tint    = "";
        if (this.feedback) {
          if (i === corrIx) tint = 'style="background:rgba(76,175,80,.40);"';
          else if (sel && !correct) tint = 'style="background:rgba(244,67,54,.40);"';
        }
        const checked = sel ? "checked" : "";
        const hide    = this.feedback ? 'style="display:none"' : "";
        html += `
          <div class="spm-item-container" data-idx="${i}" ${tint}>
            <img src="${url}">
            <input type="checkbox" ${checked} ${hide}>
            <div class="spm-label">${this.letters[i]}.</div>
          </div>`;
      });
      html += `</div>`;

      // FOOTER & NEXT-Button
      html += `<div id="spm-footer" style="justify-content:space-between;">`;
      if (this.feedback) {
        const dark = document.body.classList.contains("dark");
        html += `<div style="color:${dark?"#fff":"var(--primary-color)"};">
                   Bitte klicken Sie auf <i>Weiter</i>.
                 </div>`;
      } else {
        html += `<div></div>`;
      }
      html += `<button id="spm-next" class="jspsych-btn">${this.trial.button_next}</button>`;
      html += `</div></div>`;

      el.innerHTML = html;

      // RT-Timestamp
      this.stamps.push(performance.now());

      this.bind(el);
    }

   finishAll() {
  // grab the underlying array of data rows
  const dataRows = this.jsPsych.data.get().values();

  // for each page, push exactly the row you want
  this.sel.forEach((v, i) => {
    const p       = this.trial.pages[i];
    const corrIx  = (p.correct_choice ?? 1) - 1;
    const choice  = v!=null ? v+1 : "skipped";
    const correct = choice === (corrIx+1) ? "yes" : "no";
    const rt      = this.rts[i];
    dataRows.push({
      trial_type:      info.name,
      question_number: i+1,
      stimulus:        p.stimulus,
      choices:         p.choices.slice(),
      prompt:          p.prompt       ?? this.trial.prompt,
      instructions:    p.instructions ?? this.trial.instructions,
      correct_choice:  p.correct_choice,
      choice:          choice,
      correct:         correct,
      rt:              rt
    });
  });

  // final summary row
  dataRows.push({
    trial_type: info.name,
    time_limit: this.trial.time_limit
  });

  // now end the trial without adding any extra data
  this.jsPsych.finishTrial();
}



    bind(el) {
      const next  = el.querySelector("#spm-next");
      const boxes = Array.from(el.querySelectorAll(".spm-item-container"));

      // nur auf Auswahl-Seite toggeln
      if (!this.feedback) {
        boxes.forEach(box => {
          const cb = box.querySelector("input[type=checkbox]");
          box.onclick = () => {
            const idx = parseInt(box.dataset.idx, 10);
            if (cb.checked) {
              cb.checked = false;
              this.sel[this.idx] = null;
            } else {
              boxes.forEach(b => b.querySelector("input").checked = false);
              cb.checked = true;
              this.sel[this.idx] = idx;
            }
          };
        });

        next.onclick = () => {
          if (this.sel[this.idx] != null) {
            // RT speichern
            const rt = performance.now() - this.stamps[this.idx];
            this.rts.push(rt);
            this.feedback = true;
            this.render(el);
          }
        };
      } else {
        // im Feedback keine Klicks auf Items erlauben
        boxes.forEach(box => box.onclick = null);

        next.onclick = () => {
          this.feedback = false;
          this.idx++;
          if (this.idx < this.trial.pages.length) {
            this.render(el);
          } else {
            this.finishAll();
          }
        };
      }
    }
  }

  Plugin.info = info;
  return Plugin;
})(jsPsychModule);
