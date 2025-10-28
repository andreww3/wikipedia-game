const jsPsych = initJsPsych({
  on_finish: () => {}
});

// declare variables
var curr_trial_num;
var curr_text_id;
var curr_ans;
var curr_choices;
var curr_cwl;
var text_list;
var trial_number = 1;

// experiment parameters
var increments = [0, 50, 100, 200, 300, 500, 750, 1000];
var core_word_lists = ['AoA', 'InStrength', 'Freq', 'cooccurrence.Instrength.COCA'];
var num_trials_per_cond = 6;
var num_trials = core_word_lists.length * num_trials_per_cond;
var num_catch_trials = 1;
var num_trials_total = num_trials + num_catch_trials;
var article_title_token = "ARTICLETITLE";
var article_title_str = "...";
var fa_full = '<i class="fa-solid fa-circle-chevron-right fa-2x"></i>';
var fa_empty = '<i class="fa-regular fa-circle fa-2x"></i>';
var score = 30;
var score_lose = -2;
var score_win = {0: 30, 50: 30, 100: 27, 200: 23, 300: 19, 500: 13, 750: 5, 1000: 1}; //must match the increments

// sample texts
var texts_exp = jsPsych.randomization.sampleWithoutReplacement(Object.keys(text_stim), num_trials);
var cwl_exp = jsPsych.randomization.repeat(core_word_lists, num_trials_per_cond);

// answer choices for texts
var text_choices_exp = {};
texts_exp.forEach(id => {
  var choices = text_choices[id];
  var title = text_titles[id][0];
  choices.push(title);
  text_choices_exp[id] = jsPsych.randomization.shuffle(choices);
});

//timeline variable for trials
var trials = [];
for (i = 0; i < num_trials; i++) {
  trials.push({
    text_id: texts_exp[i], 
    article_title: text_titles[texts_exp[i]][0], 
    choices: text_choices_exp[texts_exp[i]],
    condition: cwl_exp[i]
  });
}

//define catch trials (insert at 5th position)
var catch_texts = {
  1: `${article_title_str} ██ ███ this is an █████, ██ █████ ███████ █████ "██████████ ██". ███ attention check. █████ ██████, ████████ ██ ███ █ please click on ████ ██████████ ██ ████████. ████ ████████ ██ ████, ███ Strongly Agree ██████ █████ █████████ ██ ██████. ███ █████- ████ █████ ██, ████ ████ this is █████, ███████ an ████ ██ ████████ ██████ '██████████' attention check ███. ██████ please click ███ █████, ████ █ ██ on █████ ██ █████, ██.██% █████ Strongly Agree ███ ████████ ████. ████████ this is ███ ██ (████████) ████ ██████ an attention check ██████ █████████ ██, ███ ███████, please click ███ ███ ████████, ██████ █████████. ███ ████████ on ███ ██/██████ █ Strongly Agree ███████; █ ██ (████ ██ ████████ this is an ████████ █████ ███), █████ ██████ ██ attention ███ ████████ check ████████ ██ ██████ ██ ████████ ███ please click on ████████ ███ █ ████ █████ ███ Strongly Agree ██████████.<br /><br />████████ ██████ █ ██ this is an █████ ██. ██ attention check ███ ██████ █████. Please ██ (click on ████ ███ █ ██ ███████ ██████ ███ ██████). ███ Strongly Agree █████ ██ ████; ███ █ ██████ ████ ██ ████ this is an ███ █████ ██ ████, (██████ █████ █████████). ██ attention check ███ ███ ███, █████ ████, █████ ██ ██.██% ██ █████ █████ "██ please click on ████ ██████ '██ █████ ███' Strongly Agree ███" ██████ ██████████ ██ ██████ ██ ████████ █/██, this is an ██ ███ ██████. ████ ████; ████████ █████ ████████ ███ ██████ attention check ███ ███ █████████████. ███ ██████ █████████ ███ ████████, ███ █████. Please click on ██████ ██ ███ █ ████████ ████ ████ Strongly ████████ Agree. █████ ███, █████ ████████████ ██, ██ ████ ████████ ██ █████████████ █ ████████ █████████ █████.`
};
var catch_1_choices = ['Fossil fuel', 'Milky Way', 'Game', 'Carbon dioxide', 'Sport', 'Water', 'Film', 'Queen', 'Art', 'Strongly Agree', 'Science', 'Book'];
var catch_1 = {text_id: 1, article_title: "Strongly Agree", choices: catch_1_choices, condition: "catch"};
trials.splice(4, 0, catch_1);

// add trial number to trials
for (i = 0; i < trials.length; i++) {trials[i].trial_number = i+1}; //add trial num as timeline var

//timeline variable for guesses
var guesses = [];
for (i = 0; i < increments.length; i++) {
  guesses.push({guess: i+1, increment: increments[i]});
}
for (i = increments.length; i < (increments.length+2); i++) {
  // repeat the last increment 2 more times for the 3-in-a-row correct
  guesses.push({guess: i+1, increment: increments[increments.length-1]});
}


//function for constructing stimulus with new words highlighted
function highlightNewWords(t1, t2) {
  stim = "";
  for (let i = 0; i < t1.length; i++) {
    if (t1[i] === t2[i]) {
      //if the characters in both strings are the same, simply add it
      stim += t2[i];
    } else {
      //if they are different, add a new-word class
      stim += `<span class='new-word'>${t2[i]}</span>`;
    };
  };
  return stim;
};

/*
  WELCOME===========================================================================
*/

//Subject ID
var s1 = jsPsych.randomization.randomID(4);
var s2 = jsPsych.randomization.randomID(2);
var subjectID = [s1,'rd',s2].join('');

//PLS and consent

//demographics
var demographics = {
  type: jsPsychSurveyHtmlForm,
  data: {section: "demographics"},
  preamble: "<p>First, please provide some info about yourself.</p><p>Please answer honestly - you won’t be excluded on the basis of anything you put.</p>",
  html: `<div class="demographics-container">
  <p>
    <label for="age">Age: </label>
    <select id="age" name="age" class="demographics-input">
      <option value="" selected="selected">Please select your age...</option>
      <option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option><option value="32">32</option><option value="33">33</option><option value="34">34</option><option value="35">35</option><option value="36">36</option><option value="37">37</option><option value="38">38</option><option value="39">39</option><option value="40">40</option><option value="41">41</option><option value="42">42</option><option value="43">43</option><option value="44">44</option><option value="45">45</option><option value="46">46</option><option value="47">47</option><option value="48">48</option><option value="49">49</option><option value="50">50</option><option value="51">51</option><option value="52">52</option><option value="53">53</option><option value="54">54</option><option value="55">55</option><option value="56">56</option><option value="57">57</option><option value="58">58</option><option value="59">59</option><option value="60">60</option><option value="61">61</option><option value="62">62</option><option value="63">63</option><option value="64">64</option><option value="65">65</option><option value="66">66</option><option value="67">67</option><option value="68">68</option><option value="69">69</option><option value="70">70</option><option value="71">71</option><option value="72">72</option><option value="73">73</option><option value="74">74</option><option value="75">75</option><option value="76">76</option><option value="77">77</option><option value="78">78</option><option value="79">79</option><option value="80">80</option><option value="81">81</option><option value="82">82</option><option value="83">83</option><option value="84">84</option><option value="85">85</option><option value="86">86</option><option value="87">87</option><option value="88">88</option><option value="89">89</option><option value="90">90</option><option value="91">91</option><option value="92">92</option><option value="93">93</option><option value="94">94</option><option value="95">95</option><option value="96">96</option><option value="97">97</option><option value="98">98</option><option value="99">99</option><option value="100">100</option>
    </select>
  </p>
  <p>
    <label for="gender">Gender: </label>
    <select id="gender" name="gender" class="demographics-input">
      <option value="" selected="selected">Please select your gender...</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="other">Other</option>
      <option value="prefer not to say">Prefer not to say</option>
    </select>
  </p>
  <p>What was the first language you learned? <input name="nativeLang" type="text" class="demographics-input"/></p>
  <p>What other languages do you know? (if none put N/A) <input name="otherLang" type="text" size=70 class="demographics-input"/></p>
  </div>`
}

//fullscreen
var fullscreen = {
  type: jsPsychFullscreen,
  data: {section: "setup"},
  fullscreen_mode: true,
  message: `<p>We ask that you complete this experiment in fullscreen mode to minimise distractions during the task.</p>
  <p>Press continue to do that now.</p>`,
  delay_after: 0
}

//browser data
var browser_check = {
  type: jsPsychBrowserCheck,
  data: {section: "setup"}
};


//language background questions
var languages;
var lgq_aoa_options = `<option value="" selected="selected">Age</option>
<option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option><option value="32">32</option><option value="33">33</option><option value="34">34</option><option value="35">35</option><option value="36">36</option><option value="37">37</option><option value="38">38</option><option value="39">39</option><option value="40">40</option><option value="41">41</option><option value="42">42</option><option value="43">43</option><option value="44">44</option><option value="45">45</option><option value="46">46</option><option value="47">47</option><option value="48">48</option><option value="49">49</option><option value="50">50</option><option value="51">51</option><option value="52">52</option><option value="53">53</option><option value="54">54</option><option value="55">55</option><option value="56">56</option><option value="57">57</option><option value="58">58</option><option value="59">59</option><option value="60">60</option><option value="61">61</option><option value="62">62</option><option value="63">63</option><option value="64">64</option><option value="65">65</option><option value="66">66</option><option value="67">67</option><option value="68">68</option><option value="69">69</option><option value="70">70</option><option value="71">71</option><option value="72">72</option><option value="73">73</option><option value="74">74</option><option value="75">75</option><option value="76">76</option><option value="77">77</option><option value="78">78</option><option value="79">79</option><option value="80">80</option><option value="81">81</option><option value="82">82</option><option value="83">83</option><option value="84">84</option><option value="85">85</option><option value="86">86</option><option value="87">87</option><option value="88">88</option><option value="89">89</option><option value="90">90</option><option value="91">91</option><option value="92">92</option><option value="93">93</option><option value="94">94</option><option value="95">95</option><option value="96">96</option><option value="97">97</option><option value="98">98</option><option value="99">99</option><option value="100">100</option>
`;
var lgq_prof_options = `<option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option></option><option value="10">10</option>`;

lbg_env = function(x) {
  return `
  <input id="${x}" name="${x}_yy" type="number" min="0" max="100" step="1" class="demographics-input lbq_env_number" placeholder="YY" style="margin:auto;float:left;" />
  <input name="${x}_mm" type="number" min="0" max="12" step="1" class="demographics-input lbq_env_number" placeholder="MM" style="margin:auto;float:left;" />`
}

var lbq1 = {
  type: jsPsychSurveyHtmlForm,
  data: {section: "lang_background"},
  autofocus: 'L1',
  preamble: "<p class='narrow-text'>We have a couple of questions for you about your language background. Firstly, please list all the languages you know <u>in order of acquisition</u> (your native language first), and the <u>age</u> when you began acquiring each language.</p>",
  on_finish: function(data) {languages = data.response;},
  html: `
  <div class="table_component" role="region" tabindex="0">
    <table>
      <tbody>
          <tr>
              <td>Language 1</td>
              <td><input id="L1" name="L1" type="text" class="demographics-input" /></td>
              <td><select name="L1_age" class="demographics-input">${lgq_aoa_options}</select></td>
          </tr>
          <tr>
              <td>Language 2</td>
              <td><input name="L2" type="text" class="demographics-input" /></td>
              <td><select name="L2_age" class="demographics-input">${lgq_aoa_options}</select></td>
          </tr>
          <tr>
              <td>Language 3</td>
              <td><input name="L3" type="text" class="demographics-input" /></td>
              <td><select name="L3_age" class="demographics-input">${lgq_aoa_options}</select></td>
          </tr>
          <tr>
              <td>Language 4</td>
              <td><input name="L4" type="text" class="demographics-input" /></td>
              <td><select name="L4_age" class="demographics-input">${lgq_aoa_options}</select></td>
          </tr>
          <tr>
              <td>Language 5</td>
              <td><input name="L5" type="text" class="demographics-input" /></td>
              <td><select name="L5_age" class="demographics-input">${lgq_aoa_options}</select></td>
          </tr>
      </tbody>
    </table>
  </div>`
};

var lbq2 = {
  type: jsPsychSurveyHtmlForm,
  data: {section: "lang_background"},
  preamble: "<p>Please rate your level of <u>proficiency</u> from 0 (none) to 10 (perfect) in terms of:</p>",
  html: () => {

    return `
    <div class="table_component" role="region" tabindex="0">
      <table>
          <thead>
              <tr>
                  <th></th>
                  <th>Speaking/listening</th>
                  <th>Reading/writing</th>
              </tr>
          </thead>
          <tbody>
              <tr>
                  <td>${languages.L1}</td>
                  <td><select name="L1_prof_speaking" class="demographics-input" style="margin:auto;">${lgq_prof_options}</select></td>
                  <td><select name="L1_prof_reading" class="demographics-input" style="margin:auto;">${lgq_prof_options}</select></td>
              </tr>
              <tr style=${languages.L2 === '' ? "display:none;" : ''}>
                  <td>${languages.L2}</td>
                  <td><select name="L2_prof_speaking" class="demographics-input" style="margin:auto;">${lgq_prof_options}</select></td>
                  <td><select name="L2_prof_reading" class="demographics-input" style="margin:auto;">${lgq_prof_options}</select></td>
              </tr>
              <tr style=${languages.L3 === '' ? "display:none;" : ''}>
                  <td>${languages.L3}</td>
                  <td><select name="L3_prof_speaking" class="demographics-input" style="margin:auto;">${lgq_prof_options}</select></td>
                  <td><select name="L3_prof_reading" class="demographics-input" style="margin:auto;">${lgq_prof_options}</select></td>
              </tr>
              <tr style=${languages.L4 === '' ? "display:none;" : ''}>
                  <td>${languages.L4}</td>
                  <td><select name="L4_prof_speaking" class="demographics-input" style="margin:auto;">${lgq_prof_options}</select></td>
                  <td><select name="L4_prof_reading" class="demographics-input" style="margin:auto;">${lgq_prof_options}</select></td>
              </tr>
              <tr style=${languages.L5 === '' ? "display:none;" : ''}>
                  <td>${languages.L5}</td>
                  <td><select name="L5_prof_speaking" class="demographics-input" style="margin:auto;">${lgq_prof_options}</select></td>
                  <td><select name="L5_prof_reading" class="demographics-input" style="margin:auto;">${lgq_prof_options}</select></td>
              </tr>
          </tbody>
      </table>
    </div>`;
  }
};

var lbq3 = {
  type: jsPsychSurveyHtmlForm,
  data: {section: "lang_background"},
  autofocus: 'L1_fam',
  preamble: "<p class='narrow-text'>Please estimate the <u>total amount of time</u> in years/months that you have spent using each language:</p>",
  html: () => {

    return `
    <div class="table_component" role="region" tabindex="0">
      <table>
          <thead>
              <tr>
                  <th></th>
                  <th>${languages.L1}</th>
                  <th>${languages.L2}</th>
                  <th>${languages.L3}</th>
                  <th>${languages.L4}</th>
                  <th>${languages.L5}</th>
              </tr>
          </thead>
          <tbody>
              <tr>
                  <td>With family</td>
                  <td>${lbg_env("L1_fam")}</td>
                  <td style=${languages.L2 === '' ? "display:none;" : ''}>${lbg_env("L2_fam")}</td>
                  <td style=${languages.L3 === '' ? "display:none;" : ''}>${lbg_env("L3_fam")}</td>
                  <td style=${languages.L4 === '' ? "display:none;" : ''}>${lbg_env("L4_fam")}</td>
                  <td style=${languages.L5 === '' ? "display:none;" : ''}>${lbg_env("L5_fam")}</td>
              </tr>
              <tr>
                  <td>For school</td>
                  <td>${lbg_env("L1_sch")}</td>
                  <td style=${languages.L2 === '' ? "display:none;" : ''}>${lbg_env("L2_sch")}</td>
                  <td style=${languages.L3 === '' ? "display:none;" : ''}>${lbg_env("L3_sch")}</td>
                  <td style=${languages.L4 === '' ? "display:none;" : ''}>${lbg_env("L4_sch")}</td>
                  <td style=${languages.L5 === '' ? "display:none;" : ''}>${lbg_env("L5_sch")}</td>
              </tr>
              <tr>
                  <td>For university</td>
                  <td>${lbg_env("L1_uni")}</td>
                  <td style=${languages.L2 === '' ? "display:none;" : ''}>${lbg_env("L2_uni")}</td>
                  <td style=${languages.L3 === '' ? "display:none;" : ''}>${lbg_env("L3_uni")}</td>
                  <td style=${languages.L4 === '' ? "display:none;" : ''}>${lbg_env("L4_uni")}</td>
                  <td style=${languages.L5 === '' ? "display:none;" : ''}>${lbg_env("L5_uni")}</td>
              </tr>
              <tr>
                  <td>At work</td>
                  <td>${lbg_env("L1_wrk")}</td>
                  <td style=${languages.L2 === '' ? "display:none;" : ''}>${lbg_env("L2_wrk")}</td>
                  <td style=${languages.L3 === '' ? "display:none;" : ''}>${lbg_env("L3_wrk")}</td>
                  <td style=${languages.L4 === '' ? "display:none;" : ''}>${lbg_env("L4_wrk")}</td>
                  <td style=${languages.L5 === '' ? "display:none;" : ''}>${lbg_env("L5_wrk")}</td>
              </tr>
              <tr>
                  <td>With friends</td>
                  <td>${lbg_env("L1_fri")}</td>
                  <td style=${languages.L2 === '' ? "display:none;" : ''}>${lbg_env("L2_fri")}</td>
                  <td style=${languages.L3 === '' ? "display:none;" : ''}>${lbg_env("L3_fri")}</td>
                  <td style=${languages.L4 === '' ? "display:none;" : ''}>${lbg_env("L4_fri")}</td>
                  <td style=${languages.L5 === '' ? "display:none;" : ''}>${lbg_env("L5_fri")}</td>
              </tr>
              <tr>
                  <td style='width:9em;'>For entertainment/<br>social media/<br>online activities</td>
                  <td>${lbg_env("L1_ent")}</td>
                  <td style=${languages.L2 === '' ? "display:none;" : ''}>${lbg_env("L2_ent")}</td>
                  <td style=${languages.L3 === '' ? "display:none;" : ''}>${lbg_env("L3_ent")}</td>
                  <td style=${languages.L4 === '' ? "display:none;" : ''}>${lbg_env("L4_ent")}</td>
                  <td style=${languages.L5 === '' ? "display:none;" : ''}>${lbg_env("L5_ent")}</td>
              </tr>
          </tbody>
      </table>
    </div>`;
  }
};

var lbq = {
  timeline: [lbq1, lbq2, lbq3]
};

var welcome = {
  timeline: [browser_check, fullscreen, demographics, lbq]
};

/*
  INSTRUCTIONS======================================================================
*/

var instructions = {
  type: jsPsychInstructions,
  data: {section: "instructions"},
  pages: [
    `<div class="narrow-text"><p>In this game, you will see extracts of Wikipedia articles, but some of the words have been covered up. Your aim is to guess the topic of the article from the remaining words.</p><p>The articles give a general description about each topic and can be about anything: people, places, objects, theoretical concepts, and so on.</p></div>`,
    `<div class="narrow-text"><p>Make your guess by clicking on the options below the text. Each time you make a guess, a certain number more words will be revealed. This may reveal a lot more words, or may not reveal any words at all. The new words will be highlighted. Please take the time to check carefully to see which words have been revealed each time.</p><p>You must be sure about your choice: in order to correctly guess the article, you will need to click the correct option 3 times in a row.</p><p>Keep guessing until you run out of tries. A status bar below will show how many guesses you have made so far.</p></div>`,
    `<div class="narrow-text"><p>Your score shows how well you are doing. You will start with 30 points. If you don't get the answer, you will lose 2 points. If you successfully get the right answer, you will win points, and you will win more points if you guess it in fewer tries.</p></div>`
  ],
  show_clickable_nav: true
};

var instructions_quiz_q1_answer = "Extracts of Wikipedia articles";
var instructions_quiz_q1 = {
  prompt: "In this game, you will see:",
  options: [
    instructions_quiz_q1_answer,
    "Reviews of restaurants",
    "Images from Wikipedia",
    "Posts from a social media website"
  ],
  required: true
}

var instructions_quiz_q2_answer = "Guess the topic of the Wikipedia article";
var instructions_quiz_q2 = {
  prompt: "The aim of the game is to:",
  options: [
    "Rate how good the post is",
    instructions_quiz_q2_answer,
    "Write a summary of the text",
    "Find an image for the article"
  ],
  required: true
}

var instructions_quiz_q3_answer = "You may see some or no new words";
var instructions_quiz_q3 = {
  prompt: "What will happen each time you make a guess?",
  options: [
    "You will always see more new words",
    "The round will end immediately if you guess the wrong answer",
    instructions_quiz_q3_answer,
    "You will see a new text",
  ],
  required: true
}

var instructions_quiz_q4_answer = "Click the correct option 3 times in a row";
var instructions_quiz_q4 = {
  prompt: "What do you need to do in order to correctly guess each article?",
  options: [
    "Click the correct option",
    instructions_quiz_q4_answer,
    "Click the correct option 3 times in total",
    "Click the correct option twice in a row",
  ],
  required: true
}

var instructions_quiz = {
  type: jsPsychSurveyMultiChoice,
  data: {section: "instruction_check"},
  preamble: "<p>Before you begin, we have a couple of questions for you to make sure you understand the task.</p><p>If you get any of them wrong you'll have to read the instructions again.</p>",
  questions: [instructions_quiz_q1, instructions_quiz_q2, instructions_quiz_q3, instructions_quiz_q4]
}

var instruction_quiz_failed = {
  type: jsPsychInstructions,
  data: {section: "instruction_check_failed"},
  pages: ['<p>Sorry, you got at least one of those questions wrong.</p><p>Please have another read of the instructions and try again.</p>'],
  show_clickable_nav: true,
  allow_backward: false,
  button_label_next: "Continue"
}

var instructions_quiz_check = {
  timeline: [instruction_quiz_failed],
  conditional_function: () => {
    var instruction_responses = jsPsych.data.get().last(1).values()[0].response;
    if (instruction_responses.Q0==instructions_quiz_q1_answer &&
      instruction_responses.Q1==instructions_quiz_q2_answer &&
      instruction_responses.Q2 ==instructions_quiz_q3_answer &&
      instruction_responses.Q3 ==instructions_quiz_q4_answer) {
      return false;
    } else {
      return true;
    }
  }
}

var instruction_timeline = {
  timeline: [instructions],
}

/*
  PRACTICE==========================================================================
*/

var prac_text_1 = `
<p>ARTICLETITLE ████-███████ ██████ ████████████, ███████ and ██████████ by a █████████ of ██████████, ███████████ █████ as ███████████, ███████ ████ █████████████ and the ███ 
of ████-█████ ███████ ██████ █████████. █████████ is the ███████ and ████-████ █████████ ████ in ███████. It has been ██████ ████████████ one of the ██ most ███████ ████████ 
in the █████.</p>
<p>█████████ only █████████ in ███████, ████████ in █████ █████████ were ███████ █████████. █████████'█ ████████, when ████████, ████████ more than ██ ███████ ████████, 
██████████ around █ ███████ ██████ ██████ ██████ per █████ and more than ██ ███████ █████ per █████ (about █.█ █████ per ██████ on ███████) as of ████████ ████.</p>
`;

var prac_text_2 = `
<p>ARTICLETITLE free-███████ online encyclopedia, written and ██████████ by a █████████ of ██████████, ███████████ known as ███████████, through ████ █████████████ and the use 
of ████-█████ ███████ ██████ █████████. █████████ is the largest and most-read █████████ work in ███████. It has been ██████ ████████████ one of the ██ most popular ████████ 
in the world.</p>
<p>█████████ only █████████ in ███████, ████████ in other languages were ███████ █████████. █████████'█ ████████, when ████████, ████████ more than ██ ███████ articles, 
██████████ around █ ███████ ██████ ██████ ██████ per month and more than ██ ███████ █████ per month (about █.█ █████ per ██████ on ███████) as of ████████ ████.</p>
`;

var prac_text_3 = `
<p>Wikipedia is a free-content online encyclopedia, written and maintained by a community of volunteers, collectively known as Wikipedians, through open collaboration and the use of wiki-based editing system MediaWiki. Wikipedia is the largest and most-read reference work in history. It has been ranked consistently one of the 10 most popular websites in the world.</p>
<p>Initially only available in English, editions in other languages were quickly developed. Wikipedia's editions, when combined, comprise more than 62 million articles, attracting around 2 billion unique device visits per month and more than 14 million edits per month (about 5.2 edits per second on average) as of November 2023.</p>
`;

var prac_choices = ['Wikipedia', 'Taylor Swift', 'United States', 'Art', 'Music', 'Human', 'Encyclopaedia', 'Square', 'Zero', 'World War I'];
prac_choices = jsPsych.randomization.shuffle(prac_choices);

var practice_1 = {
  type: jsPsychInstructions,
  data: {section: "practice"},
  pages: ["<div class='narrow-text'><p>Great! Before beginning the real game, you will try a practice round to see the features of the game in more detail. Click 'Continue' to do that now.</p></div>"],
  show_clickable_nav: true,
  allow_backward: false,
  button_label_next: "Continue"
};

var practice_2 = {
  type: jsPsychHtmlButtonResponse,
  data: {section: "practice"},
  stimulus: "",
  choices: () => prac_choices,
  prompt: "<p class='prac-instructions'>First, have a look at the options.</p><p class='prac-instructions'>(Click one to continue).</p>",
  on_finish: function(data) {
    //recode response as choice text
    data.response = prac_choices[data.response];
  }
};

var practice_3 = {
  type: jsPsychHtmlButtonResponse,
  data: {section: "practice", stimulus: NaN},
  stimulus: () => {
    var stimulus = prac_text_1;
    stimulus = stimulus.replace(article_title_token, article_title_str); //replace article title
    stimulus = stimulus.replaceAll("<p>", "<p class='text-stimuli'>") //add text-stimuli class for practice stim
    return stimulus;
  },
  choices: ['Continue'],
  prompt: `<p class='prac-instructions'>Then, read through the text. Focus on the words that are uncovered.</p>
  <p class='prac-instructions'>Note that the very beginning of the article (${article_title_str}) has been omitted.</p>`,
};

var practice_4 = {
  type: jsPsychHtmlButtonResponse,
  data: {section: "practice", stimulus: NaN},
  stimulus: () => {
    var stimulus = prac_text_1;
    stimulus = stimulus.replace(article_title_token, article_title_str); //replace article title
    stimulus = stimulus.replaceAll("<p>", "<p class='text-stimuli'>") //add text-stimuli class for practice stim
    return stimulus;
  },
  choices: () => prac_choices,
  prompt: () => {
    var max_guesses = guesses[guesses.length-1].guess;
    return `
      <p class="status-bar">${fa_full.repeat(1)}${fa_empty.repeat(max_guesses-1)}</p>
      <p class='prac-instructions'>Guess what the topic is by clicking on one of the options.</p>
    `;
  },
  on_finish: function(data) {
    //recode response as choice text
    data.response = prac_choices[data.response];
  }
};

var practice_5 = {
  type: jsPsychHtmlButtonResponse,
  data: {section: "practice", stimulus: NaN},
  stimulus: () => {
    var stimulus = highlightNewWords(prac_text_1, prac_text_2);//var stimulus = prac_text_2;
    stimulus = stimulus.replace(article_title_token, article_title_str); //replace article title
    stimulus = stimulus.replaceAll("<p>", "<p class='text-stimuli'>") //add text-stimuli class for practice stim
    return stimulus;
  },
  choices: () => prac_choices,
  prompt: () => {
    var max_guesses = guesses[guesses.length-1].guess;
    return `
      <p class="status-bar">${fa_full.repeat(2)}${fa_empty.repeat(max_guesses-2)}</p>
      <p class='prac-instructions'>Each time you make a guess, a certain number more words will be revealed. Take some time to look at the new words, then make your next guess.</p>
      <p class='prac-instructions'>You must click the correct answer 3 times in a row to win. Once you guess the correct answer 3 times, the current round will end.</p>
    `;
  },
  on_finish: function(data) {
    //recode response as choice text
    data.response = prac_choices[data.response];
  }
};

var practice_6 = {
  type: jsPsychHtmlButtonResponse,
  data: {section: "practice", stimulus: NaN},
  stimulus: () => {
    var stimulus = prac_text_3;
    stimulus = stimulus.replace(article_title_token, article_title_str); //replace article title
    stimulus = stimulus.replaceAll("<p>", "<p class='text-stimuli'>") //add text-stimuli class for practice stim
    return stimulus;
  },
  choices: ['Continue'],
  prompt: `<p class='prac-instructions'>At the end of each round, the full text and answer will be revealed. The answer here was <strong>Wikipedia</strong>.</p>`,
};

var practice_7 = {
  type: jsPsychInstructions,
  data: {section: "practice"},
  pages: ["<div class='narrow-text'><p>That was a slightly easier example, but the real game will be harder, with more choices and fewer revealed words. Some of the rounds may be difficult, but please just try your best to guess each article, and as quickly as you can.</p><p>Once you press 'Continue', the game will begin.</p></div>"],
  show_clickable_nav: true,
  allow_backward: false,
  button_label_next: "Continue"
};

var practice = {
  timeline: [practice_1, practice_2, practice_3, practice_4, practice_5, practice_6, practice_7]
};

/*
  EXPERIMENT========================================================================
*/

//set trial parameters
var param = {
  type: jsPsychCallFunction,
  data: {section: "trial_start"},
  func: () => {
    // set the parameters for the current trial
    curr_trial_num = jsPsych.timelineVariable('trial_number', true);
    curr_text_id = jsPsych.timelineVariable('text_id', true);
    curr_ans = jsPsych.timelineVariable('article_title', true);
    curr_choices = jsPsych.timelineVariable('choices', true);
    curr_cwl = jsPsych.timelineVariable('condition', true);
    text_list = curr_cwl=="catch" ? catch_texts[curr_text_id] : text_stim[curr_text_id][curr_cwl];
  }
}

//view choices
var view_choices = {
  type: jsPsychHtmlButtonResponse,
  data: () => {
    return {
      section: "trial_start", 
      stimulus: curr_text_id
    };
  },
  stimulus: () => {
    if (curr_cwl=="catch") {return `<p class='text-stimuli view-choices-text'>${text_list}</p>`;}; //text_list for catch trials is just one text

    var stimulus = text_list[increments[0]][0];
    stimulus = stimulus.replaceAll("\n", "<br>"); //replace newline characters
    stimulus = stimulus.replace(article_title_token, article_title_str); //replace article title
    return `<p class='text-stimuli view-choices-text'>${stimulus}</p>`;
  },
  choices: () => curr_choices,
  prompt: () => {
    return `
      <p>Take a moment to look at the choices. When you are ready, click any to continue.</p>
      <p>You need to click the correct answer 3 times in a row to win.</p>
      <div class="stats"><p class='stats-score'>Score: ${score}</p><p class='stats-remaining'>Remaining: ${num_trials_total-(curr_trial_num-1)}</p></div>
    `;
  },
  on_finish: function(data) {
    //recode response as choice text
    data.response = curr_choices[data.response];
  }
};

//code for each guess
var guess = {
  type: jsPsychHtmlButtonResponse,
  stimulus: () => {
    //catch trial
    if (curr_cwl=="catch") {return `<p class='text-stimuli'>${text_list}</p>`;}; //text_list for catch trials is just one text

    var curr_inc = jsPsych.timelineVariable("increment", true);
    var curr_guess = jsPsych.timelineVariable("guess", true);

    var stimulus = text_list[curr_inc][0];
    if (curr_guess > 1) {
      //after the first guess, highlight new words from previous text OR from start text (0 increment)
      var prev_inc = guesses[curr_guess-2].increment
      stimulus = highlightNewWords(text_list[prev_inc][0], stimulus);
    }
    stimulus = stimulus.replaceAll("\n", "<br>"); //replace newline characters
    stimulus = stimulus.replace(article_title_token, article_title_str); //replace article title

    return `<p class='text-stimuli'>${stimulus}</p>`;
  },
  choices: () => curr_choices,
  prompt: () => {
    var curr_guess = jsPsych.timelineVariable("guess", true);
    var max_guesses = guesses[guesses.length-1].guess;
    return `
      <p class="status-bar">${fa_full.repeat(curr_guess)}${fa_empty.repeat(max_guesses-curr_guess)}</p>
      <div class="stats"><p class='stats-score'>Score: ${score}</p><p class='stats-remaining'>Remaining: ${num_trials_total-(curr_trial_num-1)}</p></div>
    `;
  },
  data: () => {
    var curr_guess = jsPsych.timelineVariable("guess", true);
    var curr_inc = jsPsych.timelineVariable("increment", true);
    return {
      section: "test_trial",
      trial_num: curr_trial_num,
      stimulus: curr_text_id,
      answer: curr_ans,
      condition: curr_cwl,
      guess: curr_guess,
      increment: curr_inc
    };
  },
  on_finish: function(data) {
    //recode response as choice text
    data.response = curr_choices[data.response];
    var response = data.response;

    //code whether guess is correct
    if (response == curr_ans) {
      data.correct = 1;
      //jsPsych.endCurrentTimeline(); // only end if correct 3 times in a row
    } else {
      data.correct = 0;
    };

    // if catch trial, end immediately after first guess
    if (data.condition=="catch") {
      jsPsych.endCurrentTimeline();
    };

    //if correct answer 3 times in a row, end this trial
    var curr_trial_data = jsPsych.data.get().filter({section: "test_trial", trial_num: curr_trial_num}).values();
    var last_3_guesses = curr_trial_data.slice(Math.max(curr_trial_data.length - 3, 0));
    var last_3_guesses_correct = last_3_guesses.reduce((a, b) => a + b.correct, 0);
    if (last_3_guesses_correct === 3) {
      data.correct_trial = 1;
      jsPsych.endCurrentTimeline();
    } else {
      data.correct_trial = 0;
    }
  }
};

var trial = {
  timeline: [guess],
  timeline_variables: guesses
};

var feedback = {
  type: jsPsychHtmlButtonResponse,
  data: () => {
    return {
      section: "test_feedback", 
      stimulus: curr_text_id
    };
  },
  stimulus: () => {
    var stimulus = text_full[curr_text_id][0];
    stimulus = stimulus.replaceAll("\n", "<br>"); //replace newline characters
    return `<p class='text-stimuli'>${stimulus}</p>`;
  },
  choices: ["Continue"],
  prompt: () => {
    var last_trial_data = jsPsych.data.getLastTrialData().values()[0];
    var last_trial_correct = last_trial_data.correct_trial==1;
    return `
      <p>${last_trial_correct ? "You got it" : "Bad luck"}! The answer was <strong>${curr_ans}</strong>.</p>
      <p ${last_trial_correct ? "" : 'style="visibility:hidden;"'}>You guessed the answer in ${last_trial_data.guess} ${last_trial_data.guess==1 ? "guess" : "guesses"}.</p>
    `;
  },
  on_start: function(trial) {
    //update score
    var last_trial_data = jsPsych.data.getLastTrialData().values()[0];
    var last_trial_correct = last_trial_data.correct_trial==1;
    if (last_trial_correct) {
      score += score_win[last_trial_data.increment];
    } else {
      score += score_lose;
    }
    //update prompt with updated score
    trial.prompt += `<div class="stats"><p class='stats-score'>Score: ${score}</p><p class='stats-remaining'>Remaining: ${num_trials_total-(curr_trial_num-1)}</p></div>`;
  },
}

var feedback_timeline = {
  timeline: [feedback],
  conditional_function: () => {
    //skip if catch trial
    return curr_cwl!="catch";
  }
};

var exp = {
  timeline: [param, view_choices, trial, feedback_timeline],
  timeline_variables: trials
}

/*
  END==========================================================================
*/

var endscreen = {
  type: jsPsychInstructions,
  data: {section: "debrief"},
  pages: () => {

    //percentile

    return [`
      <p>That's it! Your final score is <strong>${score}</strong></p>
      <p>Thanks for playing!</p>
    `];
  },
  show_clickable_nav: true,
  allow_backward: false,
  button_label_next: "Continue"
}

var end_fullscreen = {
  type: jsPsychFullscreen,
  data: {section: "setup"},
  fullscreen_mode: false
}

var endexp = {
  timeline: [endscreen]
}

/*
  OVERALL TIMELINE==================================================================
*/

var timeline = [];
// timeline.push(welcome);
timeline.push(instruction_timeline);
// timeline.push(practice);
// timeline.push(exp);
timeline.push(endexp);

jsPsych.data.addProperties({subject: subjectID});

jsPsych.run(timeline);