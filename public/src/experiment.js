// ===========================
// 0. Modus-Variable definieren
// ===========================
var test_modus = false;
// → Wenn test_modus == true, sind alle Fragebögen 'nicht required'.
// → Wenn test_modus == false, sind alle Fragebögen 'required'.

var timeline = [];

// 2. jsPsych-Initalisierung
const jsPsych = initJsPsych({
  on_finish: function () {
      // 1) CSV generieren
      const csv = jsPsych.data.get().csv();

      // 2) per fetch-POST an /experiment-data senden
      fetch('/experiment-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: csv
      })
      .then(response => response.text())
      .then(msg => {
        console.log(msg); // "Experiment-Daten erfolgreich gespeichert"
      })
      .catch(error => {
        console.error('Fehler beim Speichern der Daten:', error);
        alert('Fehler beim Speichern der Daten.');
      });
  },
});

function startExperiment() {
  jsPsych.run(timeline);
}

// 3. Audio-Objekt erstellen und loopen (für Hintergrundgeräusche in den Blöcken)
var audio = new Audio("../src/Geraeusche_Ablenkung.mp3");
audio.loop = true;

// 4. Zufallsentscheidung: A oder B?
var noiseHalf = Math.random() < 0.5 ? "A" : "B";

// ===========================
// 5. Stimulus-Definitionen
// ===========================

// 5.1 Preload
var preload = {
  type: jsPsychPreload,
  images: [],
  audio: ["../src/Geraeusche_Ablenkung.mp3"],
};

// 5.2 Einleitungsseite und Audio-Test
var einleitung = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div class="instructions">
      <p><strong>Herzlich Willkommen zu unserer Studie!</strong></p>

      <p>Vielen Dank, dass Sie teilnehmen. Bitte nehmen Sie sich für die nächsten 60–75 Minuten ungestört Zeit und suchen Sie sich einen Ort, an dem Sie die Studie ohne Unterbrechungen durchführen können.</p>

      <p>In der folgenden Studie werden Sie an einer <strong> Intelligenztestung </strong> teilnehmen. Zu Beginn der Studie bitten wir Sie, sich <strong> einige Beispielaufgaben </strong> anzuschauen, um mit dem Format vertraut zu werden. Danach folgen <strong> zwei kurze Fragebögen </strong>, in denen wir Ihre aktuelle Stimmung sowie Ihre Motivation für die Teilnahme erfassen. Anschließend bearbeiten Sie die Intelligenztestung, die in zwei Blöcke unterteilt ist. Jeder Block dauert maximal 25 Minuten. Zum Abschluss bitten wir Sie, einige <strong> demografische Angaben </strong> zu machen.</p>

      <p> <strong>Bitte verwenden Sie Kopfhörer </strong> und stellen Sie sicher, dass der <strong> Ton Ihres Geräts aktiviert </strong> ist. Wenn Ihr Gerät eine Lautstärkeskala von 1–100 hat, stellen Sie diese bitte auf <strong> 70/100  </strong> oder einen vergleichbaren Wert ein. Achten Sie auch während der Studie darauf, dass die Lautstärke nicht verringert wird.
      </p>

      <p>Wir möchten Sie darum bitten, <strong> alle Aufgaben und Fragebögen sorgfältig und gewissenhaft </strong> zu bearbeiten, da dies entscheidend für die Qualität unserer Ergebnisse ist.</p>

      <p> <strong> Bitte testen Sie nun den Ton Ihres Computers </strong>, indem Sie auf den untenstehenden Button klicken:</p>
    </div>
  `,
  choices: ["Testgeräusch abspielen"],
  data: { 
    noiseHalf: noiseHalf,
  }
};

// 5.3 Erste Frage: Audio-Test (nur 2 Sekunden)
var geraeusche_frage = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div class="instructions" style="inset: 0; margin: auto; justify-content: center;">
      Konnten Sie das Geräusch deutlich hören?
    </div>
  `,
  choices: ["Ja", "Nein"],
  on_load: function () {
    // 1. Audio anlegen und abspielen
    var testAudio = new Audio("../src/Geraeusche_Ablenkung.mp3");
    testAudio.play().catch(function (err) {
      console.warn("Audio konnte nicht abgespielt werden:", err);
    });
    // 2. Nach 2 Sekunden stoppen
    setTimeout(function () {
      testAudio.pause();
      testAudio.currentTime = 0;
    }, 2000);
  },
  on_finish: function (data) {
    var response = data.response;
    if (response === 1) {
      jsPsych.abortExperiment(`Da Ihr Computeraudio nicht funktioniert, können 
        Sie leider nicht an der Studie teilnehmen. Sie können
        Ihren Browser jetzt schließen.
      `);
    }
  },
};

// 5.4 Motivation- und Angstskala

// 5.5 Erster Instruktionsblock + Beispielaufgaben
const Instructions1 = {
  type: jsPsychInstructions,
  pages: [
    `<div class="instructions">
      <p> Im Folgenden wollen wir Sie mit dem Ablauf der Intelligenztestung vertrauter machen. </p>
      <p> Sie werden im Laufe des Tests 21 Aufgaben mit unvollständigen Matrizen gezeigt bekommen. Die Matrizen sind nach bestimmten, jeweils unterschiedlichen Regeln aufgebaut, wobei das rechte untere Feld jedoch leer gelassen ist. Schauen Sie sich die jeweilige Matrix so genau wie möglich an und wählen Sie aus 8 bzw. 9 vorgegebenen Antwortalternativen diejenige aus, die die Matrix nach den jeweils vorherrschenden Regeln korrekt vervollständigt. </p>
      <p> Es ist immer nur genau eine der vorgegebenen Auswahlmöglichkeiten richtig. </p>
      <p> Sie haben insgesamt 25 Minuten Zeit! Das Ziel ist es, möglichst viele Aufgaben korrekt zu lösen. </p>
      <p> Sollten Sie nicht fertig werden, ist das nicht weiter schlimm. Versuchen Sie, sich so gut wie möglich durch den Test zu arbeiten und so weit zu kommen, wie es Ihnen möglich ist. Falls Sie bei einer Aufgabe nicht weiterwissen, gehen Sie zur nächsten über. Beachten Sie aber, dass Sie zu einer Aufgabe, die Sie übersprungen haben, nicht wieder zurückkehren können! Die verbleibende Zeit wird Ihnen immer oben in der Mitte angezeigt. </p>
      <p> Um eine bessere Ansicht zu ermöglichen, können Sie die Größe der Darstellung auf Ihrem Bildschirm mit den Tasten STRG und + bzw. - anpassen. </p>
      <p> Im Folgenden präsentieren wir Ihnen zwei Beispielaufgaben, sodass Sie sich mit dem Format vertraut machen können. Die Zeit beginnt erst mit Start des eigentlichen Tests. </p>
      <p> Bitte klicken Sie auf weiter, um zur ersten Beispielaufgabe zu gelangen. </p>

    </div>`,
  ],
  show_clickable_nav: true,
  allow_backward: false,
  show_page_number: false,
  button_label_next: "Weiter",
};

const BeispielAufgabe1 = {
  type: jsPsychStandardProgressiveMatricesBeispiel,
  prompt: "Bitte schauen Sie sich zunächst folgende Matrix genau an:",
  instructions:
    "Wählen Sie die <b><i>passende</i></b> Antwortalternative für das freie Feld der Matrix unten rechts.",
  allow_backwards: false,
  pages: [
    {
      stimulus: "../img/HeiQA/Beispielitems/Example Item 1/E1.png",
      choices: [
        "../img/HeiQA/Beispielitems/Example Item 1/E1_a_Attractor.png",
        "../img/HeiQA/Beispielitems/Example Item 1/E1_b.png",
        "../img/HeiQA/Beispielitems/Example Item 1/E1_c.png",
        "../img/HeiQA/Beispielitems/Example Item 1/E1_d.png",
        "../img/HeiQA/Beispielitems/Example Item 1/E1_e.png",
        "../img/HeiQA/Beispielitems/Example Item 1/E1_f.png",
        "../img/HeiQA/Beispielitems/Example Item 1/E1_g.png",
        "../img/HeiQA/Beispielitems/Example Item 1/E1_h.png",
        "../img/HeiQA/Beispielitems/Example Item 1/E1_i.png",
      ],
      max_selections: 1,
      correct_choice: 1,
      allow_backwards: false,
    },
    {
      stimulus: "../img/HeiQA/Beispielitems/Example Item 2/E2.png",
      choices: [
        "../img/HeiQA/Beispielitems/Example Item 2/E2_a.png",
        "../img/HeiQA/Beispielitems/Example Item 2/E2_b.png",
        "../img/HeiQA/Beispielitems/Example Item 2/E2_c.png",
        "../img/HeiQA/Beispielitems/Example Item 2/E2_d.png",
        "../img/HeiQA/Beispielitems/Example Item 2/E2_e.png",
        "../img/HeiQA/Beispielitems/Example Item 2/E2_f_Attractor.png",
        "../img/HeiQA/Beispielitems/Example Item 2/E2_g.png",
        "../img/HeiQA/Beispielitems/Example Item 2/E2_h.png",
        "../img/HeiQA/Beispielitems/Example Item 2/E2_i.png",
      ],
      max_selections: 1,
      correct_choice: 6,
      allow_skipping: true,
      allow_backwards: false,
      prompt: `
        Bitte betrachten Sie die folgenden Antwortmöglichkeiten und versuchen Sie, die richtige Lösung zu finden. 
        Es ist immer nur genau eine der vorgegebenen Auswahlmöglichkeiten richtig.
      `,
    },
  ],
};

const Intructions2 = {
  type: jsPsychInstructions,
  pages: [
    `<div class="instructions">
      <p>Hier noch einige letzte Hinweise, bevor Sie beginnen:</p>
      <p>Die einzelnen Aufgaben sind nicht, wie Sie es ggf. von bisherigen ähnlichen Tests kennen,
      nach Schwierigkeit sortiert. Seien Sie daher nicht demotiviert, sollten einige erste Items etwas 
      schwerer sein. Falls Sie bei einem Item nicht weiterwissen, gehen Sie einfach zum nächsten Item über.
      Jedoch können Sie danach nicht wieder auf ein vorheriges Item zugreifen.</p>
    </div>`,
  ],
  allow_backward: false,
  show_clickable_nav: true,
  button_label_next: "Weiter",
};

const testStarten = {
  type: jsPsychInstructions,
  pages: [
    `<div class="instructions">
      <p>Sie haben die Übungsaufgaben nun abgeschlossen. Wenn Sie soweit sind, folgen nun einige Fragebögen zu Ihrer aktuellen Stimmung und Motivation. Danach können Sie den Test starten.
      </p>
    </div>`,
  ],
  allow_backward: false,
  show_clickable_nav: true,
  button_label_next: "Zu den Fragebögen",
};

var motivation_scale = {
  type: jsPsychSurveyLikert,
  preamble: [
    `<div class="instructions">
      In dieser Studie werden Sie verschiedene 
      Knobelaufgaben lösen. Nun wollen wir wissen, 
      wie Ihre momentane Einstellung zu diesen Aufgaben
      ist. Dazu finden Sie auf dieser Seite Aussagen.
      Wählen Sie bitte die jeweilige Zahl aus, die Ihrer 
      Antwort am besten entspricht.
    </div>`,
  ],
  questions: [
    {
      prompt: "Ich mag solche Rätsel und Knobeleien.",
      labels: ["trifft nicht zu", "", "", "", "", "", "trifft zu"],
      required: !test_modus,
    },
    {
      prompt: "Ich glaube, der Schwierigkeit dieser Aufgabe gewachsen zu sein.",
      labels: ["trifft nicht zu", "", "", "", "", "", "trifft zu"],
      required: !test_modus,
    },
    {
      prompt: "Wahrscheinlich werde ich die Aufgabe nicht schaffen.",
      labels: ["trifft nicht zu", "", "", "", "", "", "trifft zu"],
      required: !test_modus,
    },
    {
      prompt:
        "Bei der Aufgabe mag ich die Rolle des Wissenschaftlers, der Zusammenhänge entdeckt.",
      labels: ["trifft nicht zu", "", "", "", "", "", "trifft zu"],
      required: !test_modus,
    },
    {
      prompt:
        "Ich fühle mich unter Druck, bei der Aufgabe gut abschneiden zu müssen.",
      labels: ["trifft nicht zu", "", "", "", "", "", "trifft zu"],
      required: !test_modus,
    },
    {
      prompt: "Die Aufgabe ist eine richtige Herausforderung für mich.",
      labels: ["trifft nicht zu", "", "", "", "", "", "trifft zu"],
      required: !test_modus,
    },
    {
      prompt:
        "Nach dem Lesen der Instruktion erscheint mir die Aufgabe sehr interessant.",
      labels: ["trifft nicht zu", "", "", "", "", "", "trifft zu"],
      required: !test_modus,
    },
    {
      prompt:
        "Ich bin sehr gespannt darauf, wie gut ich hier abschneiden werde.",
      labels: ["trifft nicht zu", "", "", "", "", "", "trifft zu"],
      required: !test_modus,
    },
    {
      prompt:
        "Ich fürchte mich ein wenig davor, dass ich mich hier blamieren könnte.",
      labels: ["trifft nicht zu", "", "", "", "", "", "trifft zu"],
      required: !test_modus,
    },
    {
      prompt:
        "Ich bin fest entschlossen, mich bei dieser Aufgabe voll anzustrengen.",
      labels: ["trifft nicht zu", "", "", "", "", "", "trifft zu"],
      required: !test_modus,
    },
    {
      prompt:
        "Bei Aufgaben wie dieser brauche ich keine Belohnung, sie machen mir auch so viel Spaß.",
      labels: ["trifft nicht zu", "", "", "", "", "", "trifft zu"],
      required: !test_modus,
    },
    {
      prompt: "Es ist mir etwas peinlich, hier zu versagen.",
      labels: ["trifft nicht zu", "", "", "", "", "", "trifft zu"],
      required: !test_modus,
    },
    {
      prompt: "Ich glaube, dass kann jeder schaffen.",
      labels: ["trifft nicht zu", "", "", "", "", "", "trifft zu"],
      required: !test_modus,
    },
    {
      prompt: "Ich glaube, ich schaffe diese Aufgabe nicht.",
      labels: ["trifft nicht zu", "", "", "", "", "", "trifft zu"],
      required: !test_modus,
    },
    {
      prompt:
        "Wenn ich die Aufgabe schaffe, werde ich schon ein wenig stolz auf meine Tüchtigkeit sein.",
      labels: ["trifft nicht zu", "", "", "", "", "", "trifft zu"],
      required: !test_modus,
    },
    {
      prompt: "Wenn ich an die Aufgabe denke, bin ich etwas beunruhigt.",
      labels: ["trifft nicht zu", "", "", "", "", "", "trifft zu"],
      required: !test_modus,
    },
    {
      prompt:
        "Eine solche Aufgabe würde ich auch in meiner Freizeit bearbeiten.",
      labels: ["trifft nicht zu", "", "", "", "", "", "trifft zu"],
      required: !test_modus,
    },
    {
      prompt: "Die konkreten Leistungsanforderungen hier lähmen mich.",
      labels: ["trifft nicht zu", "", "", "", "", "", "trifft zu"],
      required: !test_modus,
    },
  ],
  scale_width: 500,
};

var angst_skala = {
  type: jsPsychSurveyLikert,
  preamble: [
    `<div class="instructions">
      Die folgenden Fragen beziehen sich darauf, wie Sie sich fühlen, wenn Sie daran denken, gleich die Intelligenztestung durchzuführen. Bitte wählen Sie wieder jeweils die Zahl aus, die Ihrer Antwort am besten entspricht.
    </div>`,
  ],
  questions: [
    {
      prompt: "Ich denke daran, was passiert, wenn ich schlecht abschneide",
      labels: [
        "stimmt überhaupt nicht",
        "stimmt weitgehend nicht",
        "stimmt eher nicht",
        "stimmt ein wenig",
        "stimmt weitgehend",
        "stimmt genau",
      ],
      required: !test_modus,
    },
    {
      prompt: "Ich mache mir Gedanken über mein Abschneiden",
      labels: [
        "stimmt überhaupt nicht",
        "stimmt weitgehend nicht",
        "stimmt eher nicht",
        "stimmt ein wenig",
        "stimmt weitgehend",
        "stimmt genau",
      ],
      required: !test_modus,
    },
    {
      prompt:
        "Ich denke über die Konsequenzen eines möglichen Misserfolges nach",
      labels: [
        "stimmt überhaupt nicht",
        "stimmt weitgehend nicht",
        "stimmt eher nicht",
        "stimmt ein wenig",
        "stimmt weitgehend",
        "stimmt genau",
      ],
      required: !test_modus,
    },
    {
      prompt: "Ich frage mich, ob meine Leistung ausreicht",
      labels: [
        "stimmt überhaupt nicht",
        "stimmt weitgehend nicht",
        "stimmt eher nicht",
        "stimmt ein wenig",
        "stimmt weitgehend",
        "stimmt genau",
      ],
      required: !test_modus,
    },
    {
      prompt: "Ich mache mir Sorgen, ob ich auch alles schaffe",
      labels: [
        "stimmt überhaupt nicht",
        "stimmt weitgehend nicht",
        "stimmt eher nicht",
        "stimmt ein wenig",
        "stimmt weitgehend",
        "stimmt genau",
      ],
      required: !test_modus,
    },
    {
      prompt: "Das Herz schlägt mir bis zum Hals",
      labels: [
        "stimmt überhaupt nicht",
        "stimmt weitgehend nicht",
        "stimmt eher nicht",
        "stimmt ein wenig",
        "stimmt weitgehend",
        "stimmt genau",
      ],
      required: !test_modus,
    },
    {
      prompt: "Ich habe ein beklemmendes Gefühl",
      labels: [
        "stimmt überhaupt nicht",
        "stimmt weitgehend nicht",
        "stimmt eher nicht",
        "stimmt ein wenig",
        "stimmt weitgehend",
        "stimmt genau",
      ],
      required: !test_modus,
    },
    {
      prompt: "Ich fühle mich unbehaglich",
      labels: [
        "stimmt überhaupt nicht",
        "stimmt weitgehend nicht",
        "stimmt eher nicht",
        "stimmt ein wenig",
        "stimmt weitgehend",
        "stimmt genau",
      ],
      required: !test_modus,
    },
    {
      prompt: "Ich fühle mich ängstlich",
      labels: [
        "stimmt überhaupt nicht",
        "stimmt weitgehend nicht",
        "stimmt eher nicht",
        "stimmt ein wenig",
        "stimmt weitgehend",
        "stimmt genau",
      ],
      required: !test_modus,
    },
    {
      prompt: "Ich bin zuversichtlich",
      labels: [
        "stimmt überhaupt nicht",
        "stimmt weitgehend nicht",
        "stimmt eher nicht",
        "stimmt ein wenig",
        "stimmt weitgehend",
        "stimmt genau",
      ],
      required: !test_modus,
    },
    {
      prompt: "Ich bin überzeugt, dass ich gut abschneiden werde",
      labels: [
        "stimmt überhaupt nicht",
        "stimmt weitgehend nicht",
        "stimmt eher nicht",
        "stimmt ein wenig",
        "stimmt weitgehend",
        "stimmt genau",
      ],
      required: !test_modus,
    },
    {
      prompt: "Ich weiß, dass ich mich auf mich selbst verlassen kann",
      labels: [
        "stimmt überhaupt nicht",
        "stimmt weitgehend nicht",
        "stimmt eher nicht",
        "stimmt ein wenig",
        "stimmt weitgehend",
        "stimmt genau",
      ],
      required: !test_modus,
    },
    {
      prompt:
        "Ich werde in meinem Gedankengang unterbrochen, weil mir etwas nebensächliches einfällt",
      labels: [
        "stimmt überhaupt nicht",
        "stimmt weitgehend nicht",
        "stimmt eher nicht",
        "stimmt ein wenig",
        "stimmt weitgehend",
        "stimmt genau",
      ],
      required: !test_modus,
    },
    {
      prompt: "Ich denke an andere Dinge und werde dadurch abgelenkt",
      labels: [
        "stimmt überhaupt nicht",
        "stimmt weitgehend nicht",
        "stimmt eher nicht",
        "stimmt ein wenig",
        "stimmt weitgehend",
        "stimmt genau",
      ],
      required: !test_modus,
    },
    {
      prompt:
        "Mir schießen plötzlich Gedanken durch den Kopf, die mich blockieren",
      labels: [
        "stimmt überhaupt nicht",
        "stimmt weitgehend nicht",
        "stimmt eher nicht",
        "stimmt ein wenig",
        "stimmt weitgehend",
        "stimmt genau",
      ],
      required: !test_modus,
    },
  ],
  scale_width: 500,
  footnote: `<div class="instructions">
  <p>Wenn Sie bereit sind, können Sie nun mit der Intelligenztestung beginnen. Viel Erfolg!</p>
</div>`,
  button_label: "Intelligenztestung starten",
};

// 5.6 Block A: HeiQ_A mit on_start/on_finish
const HeiQ_A = {
  type: jsPsychStandardProgressiveMatrices,
  allow_skipping: true,
  prompt: "<b>Bitte betrachten Sie die folgende Matrix:</b>",
  instructions: `Bitte wählen Sie die <i>passende</i> Antwortalternative für das freie Feld der Matrix unten rechts.`,
  required: true,
  time_limit: 1500, // 25 Minuten in Sekunden
  pages: [
    {
      stimulus: "../img/HeiQA/Item A01/A01.png",
      choices: [
        "../img/HeiQA/Item A01/A01_a.png",
        "../img/HeiQA/Item A01/A01_b.png",
        "../img/HeiQA/Item A01/A01_c.png",
        "../img/HeiQA/Item A01/A01_d_attractor.png",
        "../img/HeiQA/Item A01/A01_e.png",
        "../img/HeiQA/Item A01/A01_f.png",
        "../img/HeiQA/Item A01/A01_g.png",
        "../img/HeiQA/Item A01/A01_h.png",
        "../img/HeiQA/Item A01/A01_i.png",
      ],
      correct_choice: 4,
      max_selections: 1,
      required: true,
      prompt: `
        <b>Bitte betrachten Sie die folgende Matrix:</b><br>
        (Erinnerung: Zur besseren Darstellung drücken Sie STRG und +/-, um die Größe der 
        Bildschirmanzeige anzupassen. Es empfiehlt sich, die Größe so anzupassen, dass Sie 
        die Matrix und die Antwortalternativen auf einer Seite betrachten können.)
      `,
      instruction:
        "Bitte wählen Sie die <b><i>passende</i></b> Antwortalternative für das freie Feld der Matrix unten rechts.",
    },
    {
      stimulus: "../img/HeiQA/Item A02/A02.png",
      choices: [
        "../img/HeiQA/Item A02/A02_a.png",
        "../img/HeiQA/Item A02/A02_b.png",
        "../img/HeiQA/Item A02/A02_c.png",
        "../img/HeiQA/Item A02/A02_d.png",
        "../img/HeiQA/Item A02/A02_e.png",
        "../img/HeiQA/Item A02/A02_f.png",
        "../img/HeiQA/Item A02/A02_g_Attraktor.png",
        "../img/HeiQA/Item A02/A02_h.png",
        "../img/HeiQA/Item A02/A02_i.png",
      ],
      correct_choice: 6,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQA/Item A03/A03.png",
      choices: [
        "../img/HeiQA/Item A03/A03_a.png",
        "../img/HeiQA/Item A03/A03_b.png",
        "../img/HeiQA/Item A03/A03_c.png",
        "../img/HeiQA/Item A03/A03_d.png",
        "../img/HeiQA/Item A03/A03_e_attractor.png",
        "../img/HeiQA/Item A03/A03_f.png",
        "../img/HeiQA/Item A03/A03_g.png",
        "../img/HeiQA/Item A03/A03_h.png",
        "../img/HeiQA/Item A03/A03_i.png",
      ],
      correct_choice: 5,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQA/Item A04/A04.png",
      choices: [
        "../img/HeiQA/Item A04/A04_a.png",
        "../img/HeiQA/Item A04/A04_b.png",
        "../img/HeiQA/Item A04/A04_c_attractor.png",
        "../img/HeiQA/Item A04/A04_d.png",
        "../img/HeiQA/Item A04/A04_e.png",
        "../img/HeiQA/Item A04/A04_f.png",
        "../img/HeiQA/Item A04/A04_g.png",
        "../img/HeiQA/Item A04/A04_h.png",
        "../img/HeiQA/Item A04/A04_i.png",
      ],
      correct_choice: 3,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQA/Item A05/A05.png",
      choices: [
        "../img/HeiQA/Item A05/A05_a.png",
        "../img/HeiQA/Item A05/A05_b.png",
        "../img/HeiQA/Item A05/A05_c.png",
        "../img/HeiQA/Item A05/A05_d.png",
        "../img/HeiQA/Item A05/A05_e.png",
        "../img/HeiQA/Item A05/A05_f.png",
        "../img/HeiQA/Item A05/A05_g_attractor.png",
        "../img/HeiQA/Item A05/A05_h.png",
        "../img/HeiQA/Item A05/A05_i.png",
      ],
      correct_choice: 7,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQA/Item A06/A06.png",
      choices: [
        "../img/HeiQA/Item A06/A06_a.png",
        "../img/HeiQA/Item A06/A06_b.png",
        "../img/HeiQA/Item A06/A06_c.png",
        "../img/HeiQA/Item A06/A06_d.png",
        "../img/HeiQA/Item A06/A06_e.png",
        "../img/HeiQA/Item A06/A06_f.png",
        "../img/HeiQA/Item A06/A06_g_attractor.png",
        "../img/HeiQA/Item A06/A06_h.png",
        "../img/HeiQA/Item A06/A06_i.png",
      ],
      correct_choice: 6,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQA/Item A07/A07.png",
      choices: [
        "../img/HeiQA/Item A07/A07_a.png",
        "../img/HeiQA/Item A07/A07_b.png",
        "../img/HeiQA/Item A07/A07_c.png",
        "../img/HeiQA/Item A07/A07_d.png",
        "../img/HeiQA/Item A07/A07_e.png",
        "../img/HeiQA/Item A07/A07_f.png",
        "../img/HeiQA/Item A07/A07_g.png",
        "../img/HeiQA/Item A07/A07_h.png",
        "../img/HeiQA/Item A07/A07_i_attractor.png",
      ],
      correct_choice: 9,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQA/Item A08/A08.png",
      choices: [
        "../img/HeiQA/Item A08/A08_a.png",
        "../img/HeiQA/Item A08/A08_b.png",
        "../img/HeiQA/Item A08/A08_c.png",
        "../img/HeiQA/Item A08/A08_d.png",
        "../img/HeiQA/Item A08/A08_e.png",
        "../img/HeiQA/Item A08/A08_f.png",
        "../img/HeiQA/Item A08/A08_g_attractor.png",
        "../img/HeiQA/Item A08/A08_h.png",
        "../img/HeiQA/Item A08/A08_i.png",
      ],
      correct_choice: 7,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQA/Item A09/A09.png",
      choices: [
        "../img/HeiQA/Item A09/A09_a.png",
        "../img/HeiQA/Item A09/A09_b_attractor.png",
        "../img/HeiQA/Item A09/A09_c.png",
        "../img/HeiQA/Item A09/A09_d.png",
        "../img/HeiQA/Item A09/A09_e.png",
        "../img/HeiQA/Item A09/A09_f.png",
        "../img/HeiQA/Item A09/A09_g.png",
        "../img/HeiQA/Item A09/A09_h.png",
        "../img/HeiQA/Item A09/A09_i.png",
      ],
      correct_choice: 2,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQA/Item A10/A10.png",
      choices: [
        "../img/HeiQA/Item A10/A10_a.png",
        "../img/HeiQA/Item A10/A10_b.png",
        "../img/HeiQA/Item A10/A10_c_attractor.png",
        "../img/HeiQA/Item A10/A10_d.png",
        "../img/HeiQA/Item A10/A10_e.png",
        "../img/HeiQA/Item A10/A10_f.png",
        "../img/HeiQA/Item A10/A10_g.png",
        "../img/HeiQA/Item A10/A10_h.png",
        "../img/HeiQA/Item A10/A10_i.png",
      ],
      correct_choice: 3,
      max_selections: 1,
      required: true,
    },
    {
      stimulus:
        "../img/HeiQA/Kontrollitem/Kontrollitem (Zwischen Item A10 und A11)/Item_Control.png",
      choices: [
        "../img/HeiQA/Kontrollitem/Kontrollitem (Zwischen Item A10 und A11)/ItemCo_a.png",
        "../img/HeiQA/Kontrollitem/Kontrollitem (Zwischen Item A10 und A11)/ItemCo_b.png",
        "../img/HeiQA/Kontrollitem/Kontrollitem (Zwischen Item A10 und A11)/ItemCo_c.png",
        "../img/HeiQA/Kontrollitem/Kontrollitem (Zwischen Item A10 und A11)/ItemCo_d.png",
        "../img/HeiQA/Kontrollitem/Kontrollitem (Zwischen Item A10 und A11)/ItemCo_e_Attractor.png",
        "../img/HeiQA/Kontrollitem/Kontrollitem (Zwischen Item A10 und A11)/ItemCo_f.png",
        "../img/HeiQA/Kontrollitem/Kontrollitem (Zwischen Item A10 und A11)/ItemCo_g.png",
        "../img/HeiQA/Kontrollitem/Kontrollitem (Zwischen Item A10 und A11)/ItemCo_h.png",
      ],
      correct_choice: 5,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQA/Item A11/A11.png",
      choices: [
        "../img/HeiQA/Item A11/A11_a_attractor.png",
        "../img/HeiQA/Item A11/A11_b.png",
        "../img/HeiQA/Item A11/A11_c.png",
        "../img/HeiQA/Item A11/A11_d.png",
        "../img/HeiQA/Item A11/A11_e.png",
        "../img/HeiQA/Item A11/A11_f.png",
        "../img/HeiQA/Item A11/A11_g.png",
        "../img/HeiQA/Item A11/A11_h.png",
        "../img/HeiQA/Item A11/A11_i.png",
      ],
      correct_choice: 1,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQA/Item A12/A12.png",
      choices: [
        "../img/HeiQA/Item A12/A12_a.png",
        "../img/HeiQA/Item A12/A12_b.png",
        "../img/HeiQA/Item A12/A12_c.png",
        "../img/HeiQA/Item A12/A12_d.png",
        "../img/HeiQA/Item A12/A12_e.png",
        "../img/HeiQA/Item A12/A12_f.png",
        "../img/HeiQA/Item A12/A12_g.png",
        "../img/HeiQA/Item A12/A12_h.png",
        "../img/HeiQA/Item A12/A12_i_attractor.png",
      ],
      correct_choice: 9,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQA/Item A13/A13.png",
      choices: [
        "../img/HeiQA/Item A13/A13_a.png",
        "../img/HeiQA/Item A13/A13_b.png",
        "../img/HeiQA/Item A13/A13_c.png",
        "../img/HeiQA/Item A13/A13_d.png",
        "../img/HeiQA/Item A13/A13_e.png",
        "../img/HeiQA/Item A13/A13_f.png",
        "../img/HeiQA/Item A13/A13_g_attractor.png",
        "../img/HeiQA/Item A13/A13_h.png",
      ],
      correct_choice: 7,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQA/Item A14/A14.png",
      choices: [
        "../img/HeiQA/Item A14/A14_a.png",
        "../img/HeiQA/Item A14/A14_b_attractor.png",
        "../img/HeiQA/Item A14/A14_c.png",
        "../img/HeiQA/Item A14/A14_d.png",
        "../img/HeiQA/Item A14/A14_e.png",
        "../img/HeiQA/Item A14/A14_f.png",
        "../img/HeiQA/Item A14/A14_g.png",
        "../img/HeiQA/Item A14/A14_h.png",
      ],
      correct_choice: 2,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQA/Item A15/A15.png",
      choices: [
        "../img/HeiQA/Item A15/A15_a.png",
        "../img/HeiQA/Item A15/A15_b.png",
        "../img/HeiQA/Item A15/A15_c.png",
        "../img/HeiQA/Item A15/A15_d.png",
        "../img/HeiQA/Item A15/A15_e.png",
        "../img/HeiQA/Item A15/A15_f_attractor.png",
        "../img/HeiQA/Item A15/A15_g.png",
        "../img/HeiQA/Item A15/A15_h.png",
      ],
      correct_choice: 6,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQA/Item A16/A16.png",
      choices: [
        "../img/HeiQA/Item A16/A16_a_attractor.png",
        "../img/HeiQA/Item A16/A16_b.png",
        "../img/HeiQA/Item A16/A16_c.png",
        "../img/HeiQA/Item A16/A16_d.png",
        "../img/HeiQA/Item A16/A16_e.png",
        "../img/HeiQA/Item A16/A16_f.png",
        "../img/HeiQA/Item A16/A16_g.png",
        "../img/HeiQA/Item A16/A16_h.png",
      ],
      correct_choice: 1,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQA/Item A17/A17.png",
      choices: [
        "../img/HeiQA/Item A17/A17_a.png",
        "../img/HeiQA/Item A17/A17_b.png",
        "../img/HeiQA/Item A17/A17_c.png",
        "../img/HeiQA/Item A17/A17_d.png",
        "../img/HeiQA/Item A17/A17_e.png",
        "../img/HeiQA/Item A17/A17_f.png",
        "../img/HeiQA/Item A17/A17_g_attractor.png",
        "../img/HeiQA/Item A17/A17_h.png",
      ],
      correct_choice: 7,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQA/Item A18/A18.png",
      choices: [
        "../img/HeiQA/Item A18/A18_a.png",
        "../img/HeiQA/Item A18/A18_b.png",
        "../img/HeiQA/Item A18/A18_c.png",
        "../img/HeiQA/Item A18/A18_d.png",
        "../img/HeiQA/Item A18/A18_e.png",
        "../img/HeiQA/Item A18/A18_f_attractor.png",
        "../img/HeiQA/Item A18/A18_g.png",
        "../img/HeiQA/Item A18/A18_h.png",
      ],
      correct_choice: 6,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQA/Item A19/A19.png",
      choices: [
        "../img/HeiQA/Item A19/A19_a_attractor.png",
        "../img/HeiQA/Item A19/A19_b.png",
        "../img/HeiQA/Item A19/A19_c.png",
        "../img/HeiQA/Item A19/A19_d.png",
        "../img/HeiQA/Item A19/A19_e.png",
        "../img/HeiQA/Item A19/A19_f.png",
        "../img/HeiQA/Item A19/A19_g.png",
        "../img/HeiQA/Item A19/A19_h.png",
      ],
      correct_choice: 1,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQA/Item A20/A20.png",
      choices: [
        "../img/HeiQA/Item A20/A20_a.png",
        "../img/HeiQA/Item A20/A20_b.png",
        "../img/HeiQA/Item A20/A20_c.png",
        "../img/HeiQA/Item A20/A20_d.png",
        "../img/HeiQA/Item A20/A20_e_attractor.png",
        "../img/HeiQA/Item A20/A20_f.png",
        "../img/HeiQA/Item A20/A20_g.png",
        "../img/HeiQA/Item A20/A20_h.png",
      ],
      correct_choice: 5,
      max_selections: 1,
      required: true,
    },
  ],
  on_start: function () {
    if (noiseHalf === "A") {
      if (audio.paused) {
        audio.currentTime = 0;
        audio.play().catch(function (err) {
          console.warn("Audio konnte nicht abgespielt werden:", err);
        });
      }
    }
  },
  on_finish: function () {
    if (noiseHalf === "A") {
      audio.pause();
      audio.currentTime = 0;
    }
  },
};

var HeiQ_A_fertig = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div class="instructions">
      <p>Herzlichen Glückwunsch! Sie haben den ersten Block der Intelligenztestung geschafft!</p>
    </div>
  `,
  choices: ["Weiter"],
};

var fokus_frage_1 = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt: `
        <div class="instructions">
          Wir möchten Sie nun bitten, die folgende Frage zu Ihren Gedanken 
          während der Bearbeitung der vorangegangenen Aufgaben zu beantworten. 
          Wählen Sie bitte die Option aus, die am ehesten auf Ihre Gedankengänge zutrifft.
        </div>
      `,
      name: "fokus1", 
      options: [
        "Ich habe mich voll auf die aktuelle Aufgabe konzentriert",
        "Ich habe über meine Leistung bei der Aufgabe nachgedacht und/oder darüber, wie lange sie dauern könnte",
        "Ich war abgelenkt durch etwas in der Umgebung",
        "Ich war in Gedanken unterwegs, ohne dass es einen äußeren Anlass gab",
        "keine der oben genannten Optionen trifft zu",
      ],
      required: true,
    },
  ],
  button_label: "Weiter",
};

// 5.8 Block 2 Instruktionen
const Instructions_block_2 = {
  type: jsPsychInstructions,
  pages: [
    `<div class="instructions">
      <p>Nun folgt der zweite Aufgabenblock. Bearbeiten Sie bitte auch diese Aufgaben gewissenhaft.</p>
      <p>Zur Erinnerung:</p>
      <p>Im Folgenden wollen wir Sie mit dem Ablauf des nächsten Tests vertrauter machen.</p>
      <p>Sie werden im Laufe des Tests 21 Aufgaben mit unvollständigen Matrizen gezeigt bekommen. Die
      Matrizen sind nach bestimmten, jeweils unterschiedlichen Regeln aufgebaut, wobei das rechte untere
      Feld jedoch leer gelassen ist. Schauen Sie sich die jeweilige Matrix so genau wie möglich an und
      wählen Sie aus 8 bzw. 9 vorgegebenen Antwortalternativen diejenige aus, die die Matrix nach den
      jeweils vorherrschenden Regeln korrekt vervollständigt.</p>
      <p>Es ist immer nur genau eine der vorgegebenen Auswahlmöglichkeiten richtig.</p>
      <p>Sie haben insgesamt 25 Minuten Zeit! Das Ziel ist es, möglichst viele Aufgaben korrekt zu lösen.</p>
      <p>Sollten Sie nicht fertig werden, ist das nicht weiter schlimm. Versuchen Sie, sich so gut wie möglich
      durch den Test zu arbeiten und so weit zu kommen, wie es Ihnen möglich ist. Falls Sie bei einer
      Aufgabe nicht weiterwissen, gehen Sie zur nächsten über. Beachten Sie aber, dass Sie zu einer
      Aufgabe, die Sie übersprungen haben, nicht wieder zurückkehren können! Die verbleibende Zeit wird
      Ihnen immer oben in der Mitte angezeigt.</p>
      <p>Um eine bessere Ansicht zu ermöglichen, können Sie die Größe der Darstellung auf Ihrem Bildschirm
      mit den Tasten STRG und + bzw. - anpassen.</p>
    </div>`,
  ],
  show_clickable_nav: true,
  allow_backward: false,
  show_page_number: false,
  button_label_next: "Weiter",
};

// 5.9 Block B: HeiQ_B mit on_start/on_finish
const HeiQ_B = {
  type: jsPsychStandardProgressiveMatrices,
  prompt: "<b>Bitte betrachten Sie die folgende Matrix:</b>",
  instructions: `Bitte wählen Sie die <i>passende</i> Antwortalternative für das freie Feld der Matrix unten rechts.`,
  time_limit: 1500, // 25 Minuten in Sekunden
  allow_backwards: false,
  allow_skipping: true,
  required: true,
  show_question_number: true,
  max_selections: 1,
  pages: [
    {
      stimulus: "../img/HeiQB/Item B01/B01.png",
      choices: [
        "../img/HeiQB/Item B01/B01_a.png",
        "../img/HeiQB/Item B01/B01_b.png",
        "../img/HeiQB/Item B01/B01_c.png",
        "../img/HeiQB/Item B01/B01_d_attractor.png",
        "../img/HeiQB/Item B01/B01_e.png",
        "../img/HeiQB/Item B01/B01_f.png",
        "../img/HeiQB/Item B01/B01_g.png",
        "../img/HeiQB/Item B01/B01_h.png",
        "../img/HeiQB/Item B01/B01_i.png",
      ],
      correct_choice: 4,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQB/Item B02/B02.png",
      choices: [
        "../img/HeiQB/Item B02/B02_a.png",
        "../img/HeiQB/Item B02/B02_b.png",
        "../img/HeiQB/Item B02/B02_c.png",
        "../img/HeiQB/Item B02/B02_d.png",
        "../img/HeiQB/Item B02/B02_e.png",
        "../img/HeiQB/Item B02/B02_f_attractor.png",
        "../img/HeiQB/Item B02/B02_g.png",
        "../img/HeiQB/Item B02/B02_h.png",
        "../img/HeiQB/Item B02/B02_i.png",
      ],
      correct_choice: 6,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQB/Item B03/B03.png",
      choices: [
        "../img/HeiQB/Item B03/B03_a.png",
        "../img/HeiQB/Item B03/B03_b_attractor.png",
        "../img/HeiQB/Item B03/B03_c.png",
        "../img/HeiQB/Item B03/B03_d.png",
        "../img/HeiQB/Item B03/B03_e.png",
        "../img/HeiQB/Item B03/B03_f.png",
        "../img/HeiQB/Item B03/B03_g.png",
        "../img/HeiQB/Item B03/B03_h.png",
        "../img/HeiQB/Item B03/B03_i.png",
      ],
      correct_choice: 2,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQB/Item B04/B04.png",
      choices: [
        "../img/HeiQB/Item B04/B04_a.png",
        "../img/HeiQB/Item B04/B04_b.png",
        "../img/HeiQB/Item B04/B04_c.png",
        "../img/HeiQB/Item B04/B04_d.png",
        "../img/HeiQB/Item B04/B04_e_attractor.png",
        "../img/HeiQB/Item B04/B04_f.png",
        "../img/HeiQB/Item B04/B04_g.png",
        "../img/HeiQB/Item B04/B04_h.png",
        "../img/HeiQB/Item B04/B04_i.png",
      ],
      correct_choice: 5,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQB/Item B05/B05.png",
      choices: [
        "../img/HeiQB/Item B05/B05_a.png",
        "../img/HeiQB/Item B05/B05_b.png",
        "../img/HeiQB/Item B05/B05_c.png",
        "../img/HeiQB/Item B05/B05_d.png",
        "../img/HeiQB/Item B05/B05_e_attractor.png",
        "../img/HeiQB/Item B05/B05_f.png",
        "../img/HeiQB/Item B05/B05_g.png",
        "../img/HeiQB/Item B05/B05_h.png",
        "../img/HeiQB/Item B05/B05_i.png",
      ],
      correct_choice: 5,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQB/Item B06/B06.png",
      choices: [
        "../img/HeiQB/Item B06/B06_a.png",
        "../img/HeiQB/Item B06/B06_b.png",
        "../img/HeiQB/Item B06/B06_c.png",
        "../img/HeiQB/Item B06/B06_d.png",
        "../img/HeiQB/Item B06/B06_e_attractor.png",
        "../img/HeiQB/Item B06/B06_f.png",
        "../img/HeiQB/Item B06/B06_g.png",
        "../img/HeiQB/Item B06/B06_h.png",
        "../img/HeiQB/Item B06/B06_i.png",
      ],
      correct_choice: 5,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQB/Item B07/B07.png",
      choices: [
        "../img/HeiQB/Item B07/B07_a_attractor.png",
        "../img/HeiQB/Item B07/B07_b.png",
        "../img/HeiQB/Item B07/B07_c.png",
        "../img/HeiQB/Item B07/B07_d.png",
        "../img/HeiQB/Item B07/B07_e.png",
        "../img/HeiQB/Item B07/B07_f.png",
        "../img/HeiQB/Item B07/B07_g.png",
        "../img/HeiQB/Item B07/B07_h.png",
        "../img/HeiQB/Item B07/B07_i.png",
      ],
      correct_choice: 1,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQB/Item B08/B08.png",
      choices: [
        "../img/HeiQB/Item B08/B08_a.png",
        "../img/HeiQB/Item B08/B08_b.png",
        "../img/HeiQB/Item B08/B08_c_attractor.png",
        "../img/HeiQB/Item B08/B08_d.png",
        "../img/HeiQB/Item B08/B08_e.png",
        "../img/HeiQB/Item B08/B08_f.png",
        "../img/HeiQB/Item B08/B08_g.png",
        "../img/HeiQB/Item B08/B08_h.png",
        "../img/HeiQB/Item B08/B08_i.png",
      ],
      correct_choice: 3,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQB/Item B09/B09.png",
      choices: [
        "../img/HeiQB/Item B09/B09_a.png",
        "../img/HeiQB/Item B09/B09_b.png",
        "../img/HeiQB/Item B09/B09_c.png",
        "../img/HeiQB/Item B09/B09_d.png",
        "../img/HeiQB/Item B09/B09_e_attractor.png",
        "../img/HeiQB/Item B09/B09_f.png",
        "../img/HeiQB/Item B09/B09_g.png",
        "../img/HeiQB/Item B09/B09_h.png",
        "../img/HeiQB/Item B09/B09_i.png",
      ],
      correct_choice: 5,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQB/Item B10/B10.png",
      choices: [
        "../img/HeiQB/Item B10/B10_a.png",
        "../img/HeiQB/Item B10/B10_b.png",
        "../img/HeiQB/Item B10/B10_c_attractor.png",
        "../img/HeiQB/Item B10/B10_d.png",
        "../img/HeiQB/Item B10/B10_e.png",
        "../img/HeiQB/Item B10/B10_f.png",
        "../img/HeiQB/Item B10/B10_g.png",
        "../img/HeiQB/Item B10/B10_h.png",
        "../img/HeiQB/Item B10/B10_i.png",
      ],
      correct_choice: 3,
      max_selections: 1,
      required: true,
    },
    {
      stimulus:
        "../img/HeiQB/Kontrollitem/Kontrollitem (Zwischen Item B10 und B11)/Item_Control.png",
      choices: [
        "../img/HeiQB/Kontrollitem/Kontrollitem (Zwischen Item B10 und B11)/ItemCo_a.png",
        "../img/HeiQB/Kontrollitem/Kontrollitem (Zwischen Item B10 und B11)/ItemCo_b.png",
        "../img/HeiQB/Kontrollitem/Kontrollitem (Zwischen Item B10 und B11)/ItemCo_c.png",
        "../img/HeiQB/Kontrollitem/Kontrollitem (Zwischen Item B10 und B11)/ItemCo_d.png",
        "../img/HeiQB/Kontrollitem/Kontrollitem (Zwischen Item B10 und B11)/ItemCo_e_Attractor.png",
        "../img/HeiQB/Kontrollitem/Kontrollitem (Zwischen Item B10 und B11)/ItemCo_f.png",
        "../img/HeiQB/Kontrollitem/Kontrollitem (Zwischen Item B10 und B11)/ItemCo_g.png",
        "../img/HeiQB/Kontrollitem/Kontrollitem (Zwischen Item B10 und B11)/ItemCo_h.png",
      ],
      correct_choice: 5,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQB/Item B11/B11.png",
      choices: [
        "../img/HeiQB/Item B11/B11_a.png",
        "../img/HeiQB/Item B11/B11_b.png",
        "../img/HeiQB/Item B11/B11_c.png",
        "../img/HeiQB/Item B11/B11_d_attractor.png",
        "../img/HeiQB/Item B11/B11_e.png",
        "../img/HeiQB/Item B11/B11_f.png",
        "../img/HeiQB/Item B11/B11_g.png",
        "../img/HeiQB/Item B11/B11_h.png",
        "../img/HeiQB/Item B11/B11_i.png",
      ],
      correct_choice: 4,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQB/Item B12/B12.png",
      choices: [
        "../img/HeiQB/Item B12/B12_a.png",
        "../img/HeiQB/Item B12/B12_b.png",
        "../img/HeiQB/Item B12/B12_c.png",
        "../img/HeiQB/Item B12/B12_d.png",
        "../img/HeiQB/Item B12/B12_e.png",
        "../img/HeiQB/Item B12/B12_f.png",
        "../img/HeiQB/Item B12/B12_g.png",
        "../img/HeiQB/Item B12/B12_h.png",
        "../img/HeiQB/Item B12/B12_i_attractor.png",
      ],
      correct_choice: 9,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQB/Item B13/B13.png",
      choices: [
        "../img/HeiQB/Item B13/B13_a.png",
        "../img/HeiQB/Item B13/B13_b.png",
        "../img/HeiQB/Item B13/B13_c.png",
        "../img/HeiQB/Item B13/B13_d.png",
        "../img/HeiQB/Item B13/B13_e_attractor.png",
        "../img/HeiQB/Item B13/B13_f.png",
        "../img/HeiQB/Item B13/B13_g.png",
        "../img/HeiQB/Item B13/B13_h.png",
      ],
      correct_choice: 5,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQB/Item B14/B14.png",
      choices: [
        "../img/HeiQB/Item B14/B14_a.png",
        "../img/HeiQB/Item B14/B14_b.png",
        "../img/HeiQB/Item B14/B14_c.png",
        "../img/HeiQB/Item B14/B14_d.png",
        "../img/HeiQB/Item B14/B14_e.png",
        "../img/HeiQB/Item B14/B14_f_attractor.png",
        "../img/HeiQB/Item B14/B14_g.png",
        "../img/HeiQB/Item B14/B14_h.png",
      ],
      correct_choice: 6,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQB/Item B15/B15.png",
      choices: [
        "../img/HeiQB/Item B15/B15_a.png",
        "../img/HeiQB/Item B15/B15_b_attractor.png",
        "../img/HeiQB/Item B15/B15_c.png",
        "../img/HeiQB/Item B15/B15_d.png",
        "../img/HeiQB/Item B15/B15_e.png",
        "../img/HeiQB/Item B15/B15_f.png",
        "../img/HeiQB/Item B15/B15_g.png",
        "../img/HeiQB/Item B15/B15_h.png",
      ],
      correct_choice: 2,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQB/Item B16/B16.png",
      choices: [
        "../img/HeiQB/Item B16/B16_a.png",
        "../img/HeiQB/Item B16/B16_b.png",
        "../img/HeiQB/Item B16/B16_c.png",
        "../img/HeiQB/Item B16/B16_d.png",
        "../img/HeiQB/Item B16/B16_e_attractor.png",
        "../img/HeiQB/Item B16/B16_f.png",
        "../img/HeiQB/Item B16/B16_g.png",
        "../img/HeiQB/Item B16/B16_h.png",
      ],
      correct_choice: 5,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQB/Item B17/B17.png",
      choices: [
        "../img/HeiQB/Item B17/B17_a.png",
        "../img/HeiQB/Item B17/B17_b.png",
        "../img/HeiQB/Item B17/B17_c.png",
        "../img/HeiQB/Item B17/B17_d.png",
        "../img/HeiQB/Item B17/B17_e.png",
        "../img/HeiQB/Item B17/B17_f.png",
        "../img/HeiQB/Item B17/B17_g_attractor.png",
        "../img/HeiQB/Item B17/B17_h.png",
      ],
      correct_choice: 7,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQB/Item B18/B18.png",
      choices: [
        "../img/HeiQB/Item B18/B18_a.png",
        "../img/HeiQB/Item B18/B18_b.png",
        "../img/HeiQB/Item B18/B18_c.png",
        "../img/HeiQB/Item B18/B18_d.png",
        "../img/HeiQB/Item B18/B18_e.png",
        "../img/HeiQB/Item B18/B18_f_attractor.png",
        "../img/HeiQB/Item B18/B18_g.png",
        "../img/HeiQB/Item B18/B18_h.png",
      ],
      correct_choice: 6,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQB/Item B19/B19.png",
      choices: [
        "../img/HeiQB/Item B19/B19_a.png",
        "../img/HeiQB/Item B19/B19_b.png",
        "../img/HeiQB/Item B19/B19_c.png",
        "../img/HeiQB/Item B19/B19_d.png",
        "../img/HeiQB/Item B19/B19_e.png",
        "../img/HeiQB/Item B19/B19_f.png",
        "../img/HeiQB/Item B19/B19_g_attractor.png",
        "../img/HeiQB/Item B19/B19_h.png",
      ],
      correct_choice: 7,
      max_selections: 1,
      required: true,
    },
    {
      stimulus: "../img/HeiQB/Item B20/B20.png",
      choices: [
        "../img/HeiQB/Item B20/B20_a.png",
        "../img/HeiQB/Item B20/B20_b.png",
        "../img/HeiQB/Item B20/B20_c.png",
        "../img/HeiQB/Item B20/B20_d.png",
        "../img/HeiQB/Item B20/B20_e.png",
        "../img/HeiQB/Item B20/B20_f.png",
        "../img/HeiQB/Item B20/B20_g_attractor.png",
        "../img/HeiQB/Item B20/B20_h.png",
      ],
      correct_choice: 7,
      max_selections: 1,
      required: true,
    },
  ],
  on_start: function () {
    if (noiseHalf === "B") {
      if (audio.paused) {
        audio.currentTime = 0;
        audio.play().catch(function (err) {
          console.warn("Audio konnte nicht abgespielt werden:", err);
        });
      }
    }
  },
  on_finish: function () {
    if (noiseHalf === "B") {
      audio.pause();
      audio.currentTime = 0;
    }
  },
};

// 5.10 Zweite Fokussierungsfrage
var fokus_frage_2 = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt: ` <div class="instructions" > Sie sind nun fertig mit der Intelligenztestung. Wir möchten 
      Sie erneut bitten, die folgende Frage zu Ihren Gedanken während der Bearbeitung der 
      vorangegangenen Aufgaben zu beantworten. Wählen Sie bitte die Option aus, die am ehesten 
      auf Ihre Gedankengänge zutrifft. </div>`,
      options: [
        "Ich habe mich voll auf die aktuelle Aufgabe konzentriert",
        "Ich habe über meine Leistung bei der Aufgabe nachgedacht und/oder darüber, wie lange sie dauern könnte",
        "Ich war abgelenkt durch etwas in der Umgebung",
        "Ich war in Gedanken unterwegs, ohne dass es einen äußeren Anlass gab",
        "keine der oben genannten Optionen trifft zu",
      ],
      required: !test_modus,
    },
  ],
  button_label: "Weiter",
};

// 5.11 Zweite Frage: Geräuschreduzierung
var geraeusche_frage_reduktion = {
  type: jsPsychSurveyMultiChoice,
  preamble: `<div class="instructions">
  <p>Nun möchten wir Sie bitten, einige Fragen zu beantworten, die uns helfen sollen, die Bedingungen Ihrer individuellen Testung besser zu verstehen. Bitte beantworten Sie diese Fragen ehrlich, nur so können wir eine hohe Qualität unserer Daten gewährleisten. Ihre Antworten haben keinen Einfluss auf die Vergütung mit Versuchspersonenstunden.</p>
</div>`,
  questions: [
    {
      prompt: `<div class="instructions">
          Haben Sie alle Aufgaben und Fragebögen sorgfältig und gewissenhaft bearbeitet?
        </div>`,
      options: [
        "Ja, ich habe alle Aufgaben und Fragebögen sorgfältig und gewissenhaft bearbeitet",
        "Nein, ich habe die Aufgaben und Fragebögen nicht sorgfältig und gewissenhaft bearbeitet",
      ],
      required: true,
    },
    {
      prompt: `<div class="instructions">
        <br> 
        Haben Sie aktiv etwas unternommen, um die Geräusche, die während der Bearbeitung des Tests abgespielt wurden, zu verringern? Haben Sie beispielsweise das Audio Ihres Computers stark verringert oder ausgestellt?
        </div>`,
      options: [
        "Nein, ich habe die Geräusche nicht aktiv minimiert",
        "Ja, ich habe die Geräusche aktiv minimiert",
      ],
      required: true,
    },
    {
      prompt: `<div class="instructions"> <br>
          Gab es während der Testung zusätzliche Störungen oder Unterbrechungen durch das Umfeld (z.B. durch andere Personen, Klingeln des Telefons o.Ä.)? Falls ja, beschreiben Sie diese Störungen bitte.
        </div>`,
      options: [
        "Ja, es gab weitere Störungen:",
        "Nein, es gab keine weiteren Störungen",
      ],
      name: "stoerungen",
      required: true,
    },
    {
      prompt: `<div class="instructions"> <br>
          Wo haben Sie die Testung durchgeführt?
        </div>`,
      options: [
        "Am Institut",
        "Zuhause"
      ],
      name: "untersuchungsort",
      required: true,
    }
  ],
  button_label: "Weiter",
  on_load: function () {
    // Container der 3. Frage
    var container = document.querySelectorAll(
      ".jspsych-survey-multi-choice-question"
    )[2];

    // Erstelle das Textfeld-Element (ohne Label)
    var div = document.createElement("div");
    div.id = "stoerungen-details-container";
    div.style.margin = "8px 0";

    var textarea = document.createElement("textarea");
    textarea.id = "stoerungen-details";
    textarea.name = "stoerungen_details";
    textarea.rows = 4;
    textarea.style.width = "100%";

    var error = document.createElement("div");
    error.id = "stoerungen-error";
    error.textContent = "Bitte beschreiben Sie die Störungen.";
    error.style.color = "red";
    error.style.marginTop = "4px";
    error.style.display = "none";

    div.appendChild(textarea);
    div.appendChild(error);

    // Füge das Textfeld direkt nach der "Ja"-Option ein
    var options = container.querySelectorAll(
      ".jspsych-survey-multi-choice-option"
    );
    options.forEach(function (opt) {
      if (opt.innerText.includes("Ja, es gab weitere Störungen:")) {
        opt.insertAdjacentElement("afterend", div);
      }
    });

    // Kontrolliere beim Klick auf "Weiter"
    var nextBtn = document.querySelector(".jspsych-btn");
    nextBtn.addEventListener("click", function (event) {
      var selected = document.querySelector('input[name="stoerungen"]:checked');
      if (selected && selected.value === "Ja, es gab weitere Störungen:") {
        if (!textarea.value.trim()) {
          event.preventDefault();
          error.style.display = "block";
        }
      }
    });
  },
  on_finish: function (data) {
    var details = document.getElementById("stoerungen-details");
    if (
      details &&
      data.response.stoerungen === "Ja, es gab weitere Störungen:"
    ) {
      data.stoerungen_details = details.value;
    }
  },
};

// 5.12 Demografische Angaben
const survey_trial = {
  type: jsPsychSurvey,
  survey_json: {
    showQuestionNumbers: false,
    title: "Demografische Daten",
    completeText: "Weiter",
    pageNextText: "Continue",
    pagePrevText: "Previous",
    pages: [
      {
        name: "demografie",
        title:
          "Nun möchten wir Sie bitte, einige Angaben zu demografischen Daten zu machen und weiterführende Fragen zu beantworten.",
        description: "",
        elements: [
          {
            type: "dropdown",
            title: "Geschlecht",
            name: "Geschlecht",
            isRequired: !test_modus,
            optionsCaption: "",
            choices: [
              "Männlich",
              "Weiblich",
              "Nicht-binär",
              "Anderes",
              "Keine Angabe",
            ],
          },
          {
            type: "dropdown",
            title: "Alter",
            name: "Alter",
            isRequired: !test_modus,
            optionsCaption: "",
            choices: ["< 18", "18-24", "25-35", "> 35"],
          },
          {
            type: "text",
            title: "Studiengang",
            name: "Studiengang",
            placeholder: "",
            size: 135,
            isRequired: !test_modus,
          },
          {
            type: "dropdown",
            title: "Höchster Bildungsabschluss",
            name: "Bildungsabschluss",
            isRequired: !test_modus,
            optionsCaption: "",
            choices: [
              "(Fach-)Abitur/Allgemeine Hochschulreife",
              "Bachelorabschluss",
              "Masterabschluss",
            ],
          },
        ],
      },
    ],
  },
};

// 5.13 VPN-Vergütungshinweis
var vpn_hinweis = {
  type: jsPsychHtmlButtonResponse,
  stimulus: ` <div class="instructions"> <p>Vielen Dank für Ihre Teilnahme! Falls Sie für 
  Ihre Teilnahme mit Versuchspersonenstunden vergütet werden möchten, senden Sie bitte eine
   E-Mail mit Ihrem vollen Namen und dem Stichwort "VPN-Stunden" an andrea.quint@stud.uni-heidelberg.de</p> </div>`,
  choices: ["Weiter"],
};

// 5.14 Aufklärungsseite / Abschluss
var aufklaerung = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `<div class="instructions">
    <p>Vielen Dank, dass Sie an dieser Studie teilgenommen haben! In dieser Untersuchung ging es darum, die Auswirkungen unterschiedlicher Testumgebungen (zu Hause vs. Labor) auf die Leistung bei Intelligenztests zu erforschen. Daher wurden die Aufgaben von einer Gruppe an Probanden in ihrer häuslichen Umgebung und von der anderen Gruppe an Probanden in einer laborartigen Umgebung am psychologischen Institut durchgeführt. </p>
    
    <p> Insbesondere haben wir untersucht, ob Ablenkungen in verschiedenen Umgebungen unterschiedlich stark wirken und wie sich dies auf die Testleistung auswirkt. Daher waren während der Bearbeitung von einer der beiden Testhälften verschiedene Geräusche im Hintergrund zu hören.</p>

    <p> Sollten Sie Fragen oder Anmerkungen zur Studie haben oder wenn Sie über die Ergebnisse informiert werden möchten, können Sie sich gerne jederzeit an uns wenden (andrea.quint@stud.uni-heidelberg.de).  </p>

    <p>Ihre Teilnahme ist von großem Wert, und wir danken Ihnen herzlich für Ihre Unterstützung! </p>
  </div>`,
  choices: ["Studie beenden und Browser-Tab schließen"],
  on_finish: function () {
    // Beende die Studie und schließe den Tab
    jsPsych.abortExperiment();
    window.close(); // Schließt den Tab, wenn möglich
  },
};


// ===========================
// 6. Alle timeline.push() ans Ende verschieben
// ===========================


timeline.push(einleitung);
timeline.push(geraeusche_frage);
timeline.push(Instructions1);
timeline.push(BeispielAufgabe1);
timeline.push(Intructions2);
timeline.push(testStarten);
timeline.push(motivation_scale);
timeline.push(angst_skala);
timeline.push(HeiQ_A);
timeline.push(HeiQ_A_fertig);
timeline.push(fokus_frage_1);
timeline.push(Instructions_block_2);
timeline.push(HeiQ_B);
timeline.push(fokus_frage_2);
timeline.push(geraeusche_frage_reduktion);
timeline.push(survey_trial);
timeline.push(vpn_hinweis);
timeline.push(aufklaerung);