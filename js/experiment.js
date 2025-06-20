// …existing imports/prelude…

// alias the plugin so your trial definitions can use it
const jsPsychStandardProgressiveMatricesBeispiel =
  jsPsych.plugins['standard-progressive-matrices-beispiel'];

// …rest of your experiment.js…

// example trial (around line 163)
const matrix_beispiel = {
  type: jsPsychStandardProgressiveMatricesBeispiel,
  pages: [ /* … */ ],
  /* …other parameters… */
};

timeline.push(matrix_beispiel);

// …existing code to start jsPsych…
