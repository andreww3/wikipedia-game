var jsPsychWordPred = (function (jspsych) {
    'use strict';

    const info = {
        name: "word-pred",
        parameters: {
            /** Array containing the sentences to display */
            text: {
                type: jspsych.ParameterType.STRING,
                pretty_name: "Sentences",
                default: undefined,
                array: true,
            },
            /** Target word solution for the trial */
            solution: {
                type: jspsych.ParameterType.STRING,
                pretty_name: "Solution",
                default: undefined,
            },
            /** Current guess number */
            guess: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Guess number",
                default: null,
            },
            /** Practice trial (disables scores) */
            practice: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Practice trial",
                default: false,
            },
        },
    };
    /**
     * **word-pred**
     *
     * jsPsych plugin for displaying a set of sentences and guessing a word that fits them all
     */
    class WordPredPlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }
        trial(display_element, trial) {
            var html = '<div class="trial-container">';

            // background image
            html += '<img src="img/trial-background.png">';

            // previous guesses div
            var curr_timelineNodeID = jsPsych.getCurrentTimelineNodeID();
            var curr_trial_timelineNodeID = curr_timelineNodeID.slice(0,curr_timelineNodeID.lastIndexOf("-"));
            var prev_guesses = jsPsych.data.getDataByTimelineNode(curr_trial_timelineNodeID).select("response").values;
            prev_guesses.unshift("<span id='guesses-heading'>Previous guesses:</span>");
            var html_guesses = `<div class="guesses">
            ${prev_guesses.join("<br>")}
            </div>`;
            html += html_guesses;

            // scores div
            if (!trial.practice) {
                var trial_unlocked_num = jsPsych.data.get().filter({section: "test_trial"}).select('correct').sum();
                var trial_locked_num = jsPsych.data.get().filter({section: "test_trial", guess: num_hints, correct: 0}).count(); //defined as not correct on last guess
                var trial_remaining_num = num_trials_total - trial_unlocked_num - trial_locked_num;
                var html_scores = `<div class="scores">
                <p><br>Codewords remaining: ${trial_remaining_num}</p>
                <p>Codewords cracked: ${trial_unlocked_num}<br>
                Codewords failed: ${trial_locked_num}</p>
                </div>`;
                html += html_scores;
            }

            // cloze div
            var html_cloze = `<div class="cloze">
            <form id="word-pred-form" autocomplete="off">
                What is the code word?
                <input id="trial-guess" name="guess" type="text" required/>
                <input type="submit" id="finish-cloze-button" value="Guess"></input>
            </form>
            </div>
            `;
            html += html_cloze;

            // sentences div
            var sentence_text = trial.text.join("<br>");
            var html_sentences = `<div class="sentences">
            ${sentence_text}
            </div>`;
            html += html_sentences;
            

            // check function
            const check = (event) => {
                // don't submit form
                event.preventDefault();
                
                // measure response time
                var endTime = performance.now();
                var response_time = endTime - startTime;

                // get answer
                var answer = document.getElementById("trial-guess").value;

                // clean up answer
                var answer_clean = answer.replace(/[^A-Za-z0-9]/g, ""); // remove non-alphabet
                answer_clean = answer_clean.toLowerCase(); // lower case

                // convert US/UK spelling
                var spell_alts = [];
                if (spell_uk.includes(answer_clean)) {
                    for (i = 0; i < spell_uk.length; i++) {
                        if (spell_uk[i] === answer_clean) {spell_alts.push(spell_us[i]);}
                    }
                } else if (spell_us.includes(answer_clean)) {
                    for (i = 0; i < spell_us.length; i++) {
                        if (spell_us[i] === answer_clean) {spell_alts.push(spell_uk[i]);}
                    }
                }
                
                // check answer
                var usukspellcorrected = false;
                if (answer_clean === trial.solution) {
                    var answer_correct = 1;
                } else if (spell_alts.includes(trial.solution)) {
                    var answer_correct = 1;
                    usukspellcorrected = true;
                } else {
                    var answer_correct = 0;
                }

                // save data
                var trial_data = {
                    rt: response_time,
                    response: answer,
                    correct: answer_correct
                };
                if (usukspellcorrected) {trial_data.spellingConversion = true;}

                // next trial
                display_element.innerHTML = "";
                this.jsPsych.finishTrial(trial_data);
            };
                
            
            html += "</div>"; // close trial container div
            display_element.innerHTML = html;

            // autofocus
            var focus_element = display_element.querySelector('#trial-guess');
            focus_element.focus();


            display_element.querySelector("#word-pred-form").addEventListener("submit", check);

            var startTime = performance.now();
        }
        getSolutions(text) {
            const solutions = [];
            const elements = text.split("%");
            for (let i = 0; i < elements.length; i++) {
                if (i % 2 == 1) {
                    solutions.push(elements[i].trim());
                }
            }
            return solutions;
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
            const solutions = this.getSolutions(trial.text);
            const responses = [];
            for (const word of solutions) {
                if (word == "") {
                    responses.push(this.jsPsych.randomization.randomWords({ exactly: 1 }));
                }
                else {
                    responses.push(word);
                }
            }
            const default_data = {
                response: responses,
            };
            const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
            //this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
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
            const inputs = display_element.querySelectorAll('input[type="text"]');
            let rt = this.jsPsych.randomization.sampleExGaussian(750, 200, 0.01, true);
            for (let i = 0; i < data.response.length; i++) {
                this.jsPsych.pluginAPI.fillTextInput(inputs[i], data.response[i], rt);
                rt += this.jsPsych.randomization.sampleExGaussian(750, 200, 0.01, true);
            }
            this.jsPsych.pluginAPI.clickTarget(display_element.querySelector("#finish_cloze_button"), rt);
        }
    }
    WordPredPlugin.info = info;

    return WordPredPlugin;

})(jsPsychModule);
