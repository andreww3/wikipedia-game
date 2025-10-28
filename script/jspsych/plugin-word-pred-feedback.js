var jsPsychWordPredFeedback = (function (jspsych) {
  'use strict';

  const info = {
      name: "word-pred-feedback",
      parameters: {
          /** Target word solution for the trial */
          solution: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Solution",
              default: undefined,
          },
          /** Array containing the sentences to display */
          text: {
            type: jspsych.ParameterType.STRING,
            pretty_name: "Sentences",
            default: undefined,
            array: true,
          },
          /** Array containing the label(s) for the button(s). */
          choices: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Choices",
              default: undefined,
              array: true,
          },
          /** The HTML for creating button. Can create own style. Use the "%choice%" string to indicate where the label from the choices parameter should be inserted. */
          button_html: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Button HTML",
              default: '<button class="jspsych-btn">%choice%</button>',
              array: true,
          },
          /** Any content here will be displayed under the button(s). */
          prompt: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Prompt",
              default: null,
          },
          /** How long to show the stimulus. */
          stimulus_duration: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Stimulus duration",
              default: null,
          },
          /** How long to show the trial. */
          trial_duration: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Trial duration",
              default: null,
          },
          /** The vertical margin of the button. */
          margin_vertical: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Margin vertical",
              default: "0px",
          },
          /** The horizontal margin of the button. */
          margin_horizontal: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Margin horizontal",
              default: "8px",
          },
          /** If true, then trial will end when user responds. */
          response_ends_trial: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Response ends trial",
              default: true,
          },
      },
  };
  /**
   * word-pred-feedback
   * based on html-button-response
   */
  class WordPredFeedbackPlugin {
      constructor(jsPsych) {
          this.jsPsych = jsPsych;
      }
      trial(display_element, trial) {
          // create stimulus
          var stimulus = '<div class="trial-container">';
          var lastTrialData = jsPsych.data.getLastTrialData().values()[0];

            // background image
          stimulus += '<img src="img/trial-background.png">';

            // previous guesses div
          var curr_timelineNodeID = jsPsych.getCurrentTimelineNodeID().split("-");
          curr_timelineNodeID[2] = curr_timelineNodeID[2].replace('2', '1');
          var curr_trial_timelineNodeID = curr_timelineNodeID.join("-");
          var prev_guesses = jsPsych.data.getDataByTimelineNode(curr_trial_timelineNodeID).select("response").values;
          prev_guesses.unshift("<span id='guesses-heading'>Previous guesses:</span>");
          //prev_guesses.pop();
          var html_guesses = `<div class="guesses">
          ${prev_guesses.join("<br>")}
          </div>`;
          stimulus += html_guesses;

            // scores div
          var trial_unlocked_num = jsPsych.data.get().filter({section: "test_trial"}).select('correct').sum();
          var trial_locked_num = jsPsych.data.get().filter({section: "test_trial", guess: num_hints, correct: 0}).count(); //defined as not correct on last guess
          var trial_remaining_num = num_trials_total - trial_unlocked_num - trial_locked_num;
          var html_scores = `<div class="scores">
          <p><br>Codewords remaining: ${trial_remaining_num}</p>
          <p>Codewords cracked: ${trial_unlocked_num}<br>
          Codewords failed: ${trial_locked_num}</p>
          </div>`;
          stimulus += html_scores;

            // sentences div
          var sentence_text = trial.text.slice(0, lastTrialData.guess).join("<br>");
          var html_sentences = `<div class="sentences">
          ${sentence_text}
          </div>`;
          stimulus += html_sentences;

            // feedback div
          var feedback_message = lastTrialData.correct ? "YOU GOT IT!" : "BAD LUCK!";
          var feedback_target = `The codeword was: ${trial.solution}`;
          //var feedback_numguess = `You guessed the codeword in ${lastTrialData.guess} guesses.`;
          var feedback_guessavg = jsPsych.data.get().filter({section: "test_trial", correct: 1}).select("guess").mean();
          //var feedback_guessavgtext = `Your current guess average is ${} guesses.`;
          var html_feedback =  `<div class="feedback feedback-answer">
          <span id='feedback-heading'>${feedback_message}</span> ${feedback_target}
          </div>
          <div class="feedback feedback-guesses">
            Guesses taken: ${lastTrialData.guess}<br>
            Guess average: ${isNaN(feedback_guessavg) ? "-" : Math.round(feedback_guessavg)}
          </div>`;
          stimulus += html_feedback;

            //display buttons
          var buttons = [];
          if (Array.isArray(trial.button_html)) {
              if (trial.button_html.length == trial.choices.length) {
                  buttons = trial.button_html;
              }
              else {
                  console.error("Error in html-button-response plugin. The length of the button_html array does not equal the length of the choices array");
              }
          }
          else {
              for (var i = 0; i < trial.choices.length; i++) {
                  buttons.push(trial.button_html);
              }
          }
          stimulus += '<div class="feedback-button" id="jspsych-html-button-response-btngroup">';
          for (var i = 0; i < trial.choices.length; i++) {
              var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
              stimulus +=
                  '<div class="jspsych-html-button-response-button feedback-button" style="display: inline-block; margin:' +
                      trial.margin_vertical +
                      " " +
                      trial.margin_horizontal +
                      '" id="jspsych-html-button-response-button-' +
                      i +
                      '" data-choice="' +
                      i +
                      '">' +
                      str +
                      "</div>";
          }
          stimulus += "</div>";

          stimulus += "</div>"; // close trial container div
          var html = '<div id="jspsych-html-button-response-stimulus">' + stimulus + "</div>";




          //show prompt if there is one
          if (trial.prompt !== null) {
              html += trial.prompt;
          }
          display_element.innerHTML = html;
          // start time
          var start_time = performance.now();
          // add event listeners to buttons
          for (var i = 0; i < trial.choices.length; i++) {
              display_element
                  .querySelector("#jspsych-html-button-response-button-" + i)
                  .addEventListener("click", (e) => {
                  var btn_el = e.currentTarget;
                  var choice = btn_el.getAttribute("data-choice"); // don't use dataset for jsdom compatibility
                  after_response(choice);
              });
          }
          // store response
          var response = {
              rt: null,
              button: null,
          };
          // function to end trial when it is time
          const end_trial = () => {
              // kill any remaining setTimeout handlers
              this.jsPsych.pluginAPI.clearAllTimeouts();
              // gather the data to store for the trial
              var trial_data = {
                  rt: response.rt,
                  //stimulus: trial.stimulus,
                  //response: response.button,
              };
              // clear the display
              display_element.innerHTML = "";
              // move on to the next trial
              this.jsPsych.finishTrial(trial_data);
          };
          // function to handle responses by the subject
          function after_response(choice) {
              // measure rt
              var end_time = performance.now();
              var rt = Math.round(end_time - start_time);
              response.button = parseInt(choice);
              response.rt = rt;
              // after a valid response, the stimulus will have the CSS class 'responded'
              // which can be used to provide visual feedback that a response was recorded
              display_element.querySelector("#jspsych-html-button-response-stimulus").className +=
                  " responded";
              // disable all the buttons after a response
              var btns = document.querySelectorAll(".jspsych-html-button-response-button button");
              for (var i = 0; i < btns.length; i++) {
                  //btns[i].removeEventListener('click');
                  btns[i].setAttribute("disabled", "disabled");
              }
              if (trial.response_ends_trial) {
                  end_trial();
              }
          }
          // hide image if timing is set
          if (trial.stimulus_duration !== null) {
              this.jsPsych.pluginAPI.setTimeout(() => {
                  display_element.querySelector("#jspsych-html-button-response-stimulus").style.visibility = "hidden";
              }, trial.stimulus_duration);
          }
          // end trial if time limit is set
          if (trial.trial_duration !== null) {
              this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
          }
      }
      simulate(trial, simulation_mode, simulation_options, load_callback) {
          if (simulation_mode == "data-only") {
              load_callback();
              this.simulate_data_only(trial, simulation_options);
          }
          if (simulation_mode == "visual") {
              this.simulate_visual(trial, simulation_options, load_callback);
          }
      }
      create_simulation_data(trial, simulation_options) {
          const default_data = {
              stimulus: trial.stimulus,
              rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
              response: this.jsPsych.randomization.randomInt(0, trial.choices.length - 1),
          };
          const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
          this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
          return data;
      }
      simulate_data_only(trial, simulation_options) {
          const data = this.create_simulation_data(trial, simulation_options);
          this.jsPsych.finishTrial(data);
      }
      simulate_visual(trial, simulation_options, load_callback) {
          const data = this.create_simulation_data(trial, simulation_options);
          const display_element = this.jsPsych.getDisplayElement();
          this.trial(display_element, trial);
          load_callback();
          if (data.rt !== null) {
              this.jsPsych.pluginAPI.clickTarget(display_element.querySelector(`div[data-choice="${data.response}"] button`), data.rt);
          }
      }
  }
  WordPredFeedbackPlugin.info = info;

  return WordPredFeedbackPlugin;

})(jsPsychModule);
