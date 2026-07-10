we're trying to get the stat-bar on each page to match the jobs.html page - we're having a few problems though


Searched code, read a file
Searched
stat-bar
pattern: stat-bar
output_mode: files_with_matches
Found 8 files
tcap\omnicms-snippets\faq.snippet.html
tcap\omnicms-snippets\experiential-learning.snippet.html
tcap\omnicms-snippets\stages.snippet.html
tcap\omnicms-snippets\overview.snippet.html
tcap\omnicms-snippets\jobs.html
tcap\omnicms-snippets\jobs-source-context.html
reference\live-jobs-page.html
reference\usf-cms\tmp-usf-jobs-live.html
Searched
stat-bar
pattern: stat-bar
path: tcap/omnicms-snippets/jobs.html
output_mode: content
-n: true
-C: 3
104-    display: block;
105-  }
106-
107:  .jobs-stat-bar {
108-    display: grid;
109-    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
110-    gap: 2rem;
--
112-    align-items: start;
113-  }
114-
115:  .jobs-stat-bar > * {
116-    align-self: start;
117-    margin: 2px 0 0 0;
118-    padding: 0;
--
609-      font-size: 1.2rem;
610-    }
611-
612:    .jobs-stat-bar {
613-      grid-template-columns: 1fr;
614-      gap: 1rem;
615-    }
--
887-  }
888-</style>
889-<div id="jobs-asset-root">
890:<div id="stat-bar" class="jobs-stat-bar">
891-<div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
892-<h3 class="c-calloutText_heading">+17.9%</h3>
893-<div class="c-calloutText_text">Software developer growth 2023&ndash;2033
Read
jobs.html
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\jobs.html
<style>
  #jobs-asset-root {
    font-family: inherit;
    color: inherit;

    --jobs-green: #006747;
    --jobs-green-dark: #004c35;

    /* Higher-contrast neutral palette for ADA/WCAG readability */
    --jobs-text: #1f1f1f;
    --jobs-text-muted: #333333;
    --jobs-border: #4a4a4a;
    --jobs-border-strong: #2f2f2f;
    --jobs-surface-muted: #f2f2f2;
    --jobs-surface-subtle: #f7f7f7;
  }

  .snippetButton {
    display: inline-block !important;
    width: auto !important;
    min-width: 220px;
    margin: 0.5rem 0 1rem 0 !important;
    padding: 0.85rem 1.35rem !important;

    border: 2px solid #006747 !important;
    border-radius: 0 !important;

    background-color: #006747 !important;
    color: #ffffff !important;

    font-family: inherit !important;
    font-size: 1rem !important;
    font-weight: 700 !important;
    line-height: 1.2 !important;
    text-align: center !important;
    text-decoration: none !important;

    cursor: pointer !important;
    box-sizing: border-box !important;
  }

  .snippetButton:focus-visible {
    outline: 3px solid var(--jobs-border-strong);
    outline-offset: 3px;
  }

  .dateItems-list .dateItem.hidden {
    display: none;
  }

  .jobs-tabs {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin: 2rem 0;
    border-bottom: 1px solid var(--jobs-border);
    width: 100%;
  }

  .jobs-tabs button {
    display: grid;
    place-items: center;
    padding: 0.75rem;
    border: none;
    background: transparent;
    color: var(--jobs-text-muted);
    cursor: pointer;
    font-size: 1rem;
    font-family: inherit;
    white-space: nowrap;
    opacity: 1;
  }

  .jobs-tabs button.active {
    color: var(--jobs-text);
    opacity: 1;
    font-weight: 700;
    border-bottom: 2px solid var(--jobs-border-strong);
  }

  .jobs-tabs button:hover,
  .jobs-tabs button:focus {
    color: var(--jobs-text);
    opacity: 1;
  }

  .jobs-tabs button.active:hover {
    opacity: 1;
  }

  .jobs-tabs button:focus-visible {
    outline: 3px solid var(--jobs-border-strong);
    outline-offset: 3px;
  }

  .jobs-panel {
    display: none;
  }

  .jobs-panel.active {
    display: block;
  }

  .jobs-stat-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
    align-items: start;
  }

  .jobs-stat-bar > * {
    align-self: start;
    margin: 2px 0 0 0;
    padding: 0;
  }

  .jobs-form {
    width: 100%;
    box-sizing: border-box;
  }

  .jobs-form-row {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    column-gap: 24px;
    row-gap: 18px;
    margin: 0 0 1.5rem 0;
    padding: 0;
    align-items: start !important;
    width: 100%;
    box-sizing: border-box;
  }

  .jobs-form-row.full {
    grid-template-columns: 1fr !important;
  }
Now let's look at the actual stat-bar markup and its full context around line 887-920 in jobs.html, plus how the other snippet files implement it currently.


Read a file, searched code
Read
jobs.html
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\jobs.html
      gap: 1rem;
    }

    .recruiting-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
</style>
<div id="jobs-asset-root">
<div id="stat-bar" class="jobs-stat-bar">
<div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
<h3 class="c-calloutText_heading">+17.9%</h3>
<div class="c-calloutText_text">Software developer growth 2023&ndash;2033
<section class="all-sources" aria-labelledby="stat-sources-heading">
<p class="all-sources-text">Software developer growth 2023&ndash;2033: <span>BLS / MLR 2025.</span></p>
</section>
</div>
</div>
<div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
<h3 class="c-calloutText_heading">546K</h3>
<div class="c-calloutText_text">Tech workers in Florida (No. 4 nationally)
<section class="all-sources" aria-labelledby="stat-sources-heading">
<p class="all-sources-text">Florida tech workforce count: <span>CompTIA 2025.</span></p>
</section>
</div>
</div>
<div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
<h3 class="c-calloutText_heading">$102,908</h3>
<div class="c-calloutText_text">Florida tech wage &mdash; 122% above state median
<section class="all-sources" aria-labelledby="stat-sources-heading">
<p class="all-sources-text">Median Florida tech wage: <span>CompTIA / Lightcast 2024.</span></p>
</section>
</div>
</div>
<div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
<h3 class="c-calloutText_heading">12,735</h3>
<div class="c-calloutText_text">Active Florida job postings requiring AI skills
<section class="all-sources" aria-labelledby="stat-sources-heading">
<p class="all-sources-text">Florida AI-skill job postings: <span>CompTIA 2024.</span></p>
</section>
</div>
</div>
</div>
<div class="jobs-tabs"><button class="active" style="font-weight: 600; margin-top: -10px; align-self: end;" tabindex="0" data-panel="prospective" onclick="switchPanel('prospective', this)">Prospective Students</button> <button tabindex="0" data-panel="current" onclick="switchPanel('current', this)">Current Students</button> <button tabindex="0" data-panel="matchme" onclick="switchPanel('matchme', this)">Find My Job ✨</button> <button tabindex="0" data-panel="internships" onclick="switchPanel('internships', this)">Find My Internship ✨</button> <button tabindex="0" data-panel="events" onclick="switchPanel('events', this)">Events Calendar</button> <button tabindex="0" data-panel="employers" onclick="switchPanel('employers', this)">Employers</button></div>
<div id="prospective" class="jobs-panel active">
<h3>National Occupation Projections &mdash; 2023 to 2033</h3>
<div style="margin: 1.5rem 0;">
<div class="jobs-form-group"><label for="prospective-degree">Select Degree Program:</label><select id="prospective-degree" style="max-width: 400px;" onchange="updateProjections()">
<option value="bscs">BS Computer Science</option>
<option value="bscp">BS Computer Engineering</option>
<option value="bscse">BS Computer Science and Engineering</option>
<option value="bsai">BS Artificial Intelligence</option>
<option value="bscys">BS Cybersecurity</option>
<option value="bsit">BS Information Technology</option>
<option value="bscsb">BS Computer Science &amp; Business</option>
<option value="bscsc">BS Computer Science &amp; Criminology</option>
<option value="bscsiss">BS Computer Science &amp; Interdisciplinary Social Sciences</option>
<option value="mscs">MS Computer Science</option>
<option value="mscpe">MS Computer Engineering</option>
<option value="msai">MS Artificial Intelligence</option>
<option value="mscys">MS Cybersecurity</option>
<option value="phdcse">PhD Computer Science and Engineering</option>
<option value="phdds">PhD Data Science</option>
</select></div>
<div id="projection-status" style="margin-top: 0.5rem; font-size: 0.9rem;"></div>
</div>
<table class="jobs-table">
<thead>
<tr>
<th style="width: 50%;">Occupation</th>
<th style="width: 10%;">2023 Jobs</th>
<th style="width: 10%;">2033 Est.</th>
<th style="width: 5%;">Growth</th>
<th style="width: 25%;">Trend</th>
</tr>
</thead>
<tbody id="projection-body">
<tr>
<td>Software developers</td>
<td>1,692,100</td>
<td>1,995,900</td>
<td>+17.9%</td>
<td class="bar-cell">
<div class="bar-wrap">
<div class="bar" style="width: 100%;">&nbsp;</div>
</div>
</td>
</tr>
<tr>
<td>Computer occupations (all)</td>
<td>5,021,800</td>
<td>5,610,700</td>
<td>+11.7%</td>
<td class="bar-cell">
<div class="bar-wrap">
<div class="bar" style="width: 100%;">&nbsp;</div>
</div>
</td>
</tr>
<tr>
<td>Database architects</td>
<td>61,400</td>
<td>68,000</td>
<td>+10.8%</td>
<td class="bar-cell">
<div class="bar-wrap">
<div class="bar" style="width: 100%;">&nbsp;</div>
</div>
</td>
</tr>
<tr>
<td>Financial &amp; investment analysts</td>
<td>347,400</td>
<td>380,300</td>
<td>+9.5%</td>
<td class="bar-cell">
<div class="bar-wrap">
<div class="bar" style="width: 100%;">&nbsp;</div>
</div>
</td>
</tr>
</tbody>
</table>
<h3>Florida Spotlight</h3>
<div class="spotlight-grid">
<div class="c-calloutText c-calloutText--grey">
<h3 class="c-calloutText_heading">107,404</h3>
<div class="c-calloutText_text">
<p class="p1">Software development jobs in Florida &mdash; +5% projected 2025 (3.2&times; benchmark)</p>
</div>
</div>
<div class="c-calloutText c-calloutText--grey">
<h3 class="c-calloutText_heading">16,973</h3>
<div class="c-calloutText_text">
<p class="p1">Data science and Machine Learning jobs &mdash; +5.6% projected, fastest-growing Florida category</p>
</div>
</div>
<div class="c-calloutText c-calloutText--grey">
<h3 class="c-calloutText_heading">No. 3</h3>
<div class="c-calloutText_text">
<p class="p1">Florida&rsquo;s aggregate CompTIA ranking among all 50 states</p>
</div>
</div>
</div>
<h3>Why the AI Era Boosts &mdash; Not Replaces &mdash; Computing Careers</h3>
<div class="spotlight-grid">
<div class="c-calloutText c-calloutText--grey">
<h3 class="c-calloutText_heading">Productivity Creates Demand</h3>
<div class="c-calloutText_text">
<p class="p1"><strong>Bureau of Labor Statistics finding:</strong> AI-assisted productivity lowers software costs, expands the market and boosts demand for developers who build AI tools.</p>
</div>
</div>
<div class="c-calloutText c-calloutText--grey">
<h3 class="c-calloutText_heading">Data &amp; AI: Fastest-Growing Segment</h3>
<div class="c-calloutText_text">
<p class="p1"><strong>CompTIA 2025:</strong> Data science, Machine Learning, and database roles are Florida&rsquo;s fastest-growing tech category at 5.6% annually &mdash; 3.6&times; the national benchmark, which directly aligns with Bellini College programs.</p>
</div>
</div>
</div>
<section class="all-sources" aria-labelledby="ai-careers-sources-heading">
<h4 id="ai-careers-sources-heading" class="all-sources-heading">Sources</h4>
<ol class="all-sources-list">
<li>BLS Monthly Labor Review Feb. 2025</li>
<li>CompTIA State of the Tech Workforce 2025</li>
<li>AIMaps / LinkUp.</li>
<li>Maintained by Bellini College Career Services.</li>
</ol>
<p class="all-sources-text">Updated quarterly.</p>
<p class="all-sources-text">Wage and workforce figures are aggregate regional estimates. Individual earnings vary by role, employer, experience, and location. Employment projections are national estimates from the U.S. Bureau of Labor Statistics and Lightcast, based on historical trends and modeling. They are not guarantees of job availability, salary, or outcomes for any individual or program.</p>
</section>
</div>
<div id="current" class="jobs-panel">
<h3>Resources for Current Students</h3>
<h2>Career Development</h2>
<div class="career-grid">
<div class="c-calloutText c-calloutText--grey">
<div class="c-calloutText_text"><img class="career-dev-img" src="https://www.usf.edu/ai-cybersecurity-computing/images/00-icons/reliaquest-labs.png" alt="USF Logo" />
<h4 class="c-calloutText_heading"><a tabindex="0" href="https://www.usf.edu/ai-cybersecurity-computing/academics/student-opportunities/reliaquest-labs.aspx"> ReliaQuest Labs</a></h4>
</div>
</div>
<div class="c-calloutText c-calloutText--grey">
<div class="c-calloutText_text"><img class="career-dev-img" src="https://www.usf.edu/ai-cybersecurity-computing/images/00-icons/internships.png" alt="USF Logo" />
<h4 class="c-calloutText_heading"><a tabindex="0" href="https://www.usf.edu/ai-cybersecurity-computing/academics/student-opportunities/internships.aspx"> Internships</a></h4>
</div>
</div>
<div class="c-calloutText c-calloutText--grey">
<div class="c-calloutText_text"><img class="career-dev-img" src="https://www.usf.edu/ai-cybersecurity-computing/images/00-icons/assistantships.png" alt="USF Logo" />
<h4 class="c-calloutText_heading"><a tabindex="0" href="https://www.usf.edu/ai-cybersecurity-computing/academics/student-opportunities/assistantships.aspx"> Assistantships</a></h4>
</div>
</div>
<div class="c-calloutText c-calloutText--grey">
<div class="c-calloutText_text"><img class="career-dev-img" src="https://www.usf.edu/ai-cybersecurity-computing/images/00-icons/career-services.png" alt="USF Logo" />
<h4 class="c-calloutText_heading"><a tabindex="0" href="https://www.usf.edu/career-services/"> Career Services </a></h4>
</div>
</div>
<div class="c-calloutText c-calloutText--grey">
<div class="c-calloutText_text"><img class="career-dev-img" src="https://www.usf.edu/ai-cybersecurity-computing/images/00-icons/international-study.png" alt="USF Logo" />
<h4 class="c-calloutText_heading"><a tabindex="0" href="https://educationabroad.global.usf.edu/_portal/program-discovery?search=%5B%7B%22filterType%22:%22programDiscoveryKeyword%22,%22filterValues%22:%5B%7B%22value%22:%22cyber%22%7D%5D%7D%5D"> International Study</a></h4>
</div>
</div>
<div class="c-calloutText c-calloutText--grey">
<div class="c-calloutText_text"><img class="career-dev-img" src="https://www.usf.edu/ai-cybersecurity-computing/images/00-icons/student-orgs.png" alt="USF Logo" />
<h4 class="c-calloutText_heading"><a tabindex="0" href="https://www.usf.edu/ai-cybersecurity-computing/academics/student-opportunities/student-organizations.aspx"> Student Organizations</a></h4>
</div>
</div>
<div class="c-calloutText c-calloutText--grey">
<div class="c-calloutText_text"><img class="career-dev-img" src="https://www.usf.edu/ai-cybersecurity-computing/images/00-icons/scholarships.png" alt="USF Logo" />
<h4 class="c-calloutText_heading"><a tabindex="0" href="https://www.usf.edu/financial-aid/scholarships/index.aspx"> Scholarships</a></h4>
</div>
</div>
<div class="c-calloutText c-calloutText--grey">
<div class="c-calloutText_text"><img class="career-dev-img" src="https://www.usf.edu/ai-cybersecurity-computing/images/00-icons/peer-tutoring.png" alt="USF Logo" />
<h4 class="c-calloutText_heading"><a tabindex="0" href="https://www.usf.edu/ai-cybersecurity-computing/academics/student-opportunities/peer_tut.aspx"> Peer Tutoring</a></h4>
</div>
</div>
<div class="c-calloutText c-calloutText--grey">
<div class="c-calloutText_text"><img class="career-dev-img" src="https://www.usf.edu/ai-cybersecurity-computing/images/00-icons/cyberherd.png" alt="USF Logo" />
<h4 class="c-calloutText_heading"><a tabindex="0" href="https://www.usf.edu/ai-cybersecurity-computing/academics/student-opportunities/cyberherd.aspx"> Cyberherd</a></h4>
</div>
</div>
</div>
<h2>Growing Metro Areas</h2>
<div class="metro-grid">
<div class="c-calloutText c-calloutText--grey metro-card metro-card--top">
<h3 class="c-calloutText_heading"><a tabindex="0" href="https://tampabayedc.com/why-tampa-bay/work-tampa/">Tampa Bay</a></h3>
<div class="c-calloutText_text">
<p class="p1">#1 year-over-year job growth among all Florida counties</p>
</div>
</div>
<div class="c-calloutText c-calloutText--grey metro-card metro-card--top">
<h3 class="c-calloutText_heading"><a tabindex="0" href="https://becomestpete.com/industries-and-businesses/data-analytics-and-technology/">St. Petersburg</a></h3>
<div class="c-calloutText_text">
<p class="p1">#2 place in Florida for tech jobs in 2024</p>
</div>
</div>
<div class="c-calloutText c-calloutText--grey metro-card metro-card--top">
<h3 class="c-calloutText_heading"><a tabindex="0" href="https://business.orlando.org/l/technology/">Orlando</a></h3>
<div class="c-calloutText_text">
<p class="p1">Almost 25,000 Industry Professionals</p>
</div>
</div>
<div class="c-calloutText c-calloutText--grey metro-card metro-card--bottom-left">
<h3 class="c-calloutText_heading"><a tabindex="0" href="https://www.beaconcouncil.com/technology/">Miami</a></h3>
<div class="c-calloutText_text">
<p class="p1">More than 2,000 startups supporting roughly 90,000 jobs</p>
</div>
</div>
<div class="c-calloutText c-calloutText--grey metro-card metro-card--bottom-right">
<h3 class="c-calloutText_heading"><a tabindex="0" href="https://jaxusa.org/industry/technology-services/">Jacksonville</a></h3>
<div class="c-calloutText_text">
<p class="p1">28,000 professionals employed in the technology services industry.</p>
</div>
</div>
</div>
<section class="all-sources" aria-labelledby="all-sources-heading">
<h4 id="all-sources-heading" class="all-sources-heading">Sources</h4>
<ol class="all-sources-list">
<li>Tampa Bay: <a tabindex="0" href="https://tampabayedc.com/why-tampa-bay/work-tampa/"> Tampa Bay Economic Development Council </a></li>
<li>St. Petersburg: <a tabindex="0" href="https://becomestpete.com/industries-and-businesses/data-analytics-and-technology/"> St. Petersburg Area Economic Development Corporation </a></li>
<li>Orlando: <a tabindex="0" href="https://business.orlando.org/l/technology/"> Orlando Economic Partnership </a></li>
<li>Miami: <a tabindex="0" href="https://www.beaconcouncil.com/technology/"> Miami-Dade Beacon Council </a></li>
<li>Jacksonville: <a tabindex="0" href="https://jaxusa.org/wp-content/uploads/2026/Technology-Services-Business-Case.pdf"> JAXUSA Partnership </a></li>
</ol>
</section>
</div>
<!-- FIND MY JOB: Left column (degree+grad) | Right column (location+auth) | Full-width skills -->
<div id="matchme" class="jobs-panel">
<h3>Find My Job Match</h3>
<form class="jobs-form">
<div class="jobs-form-row">
<div class="jobs-form-group"><label for="jm-program">Your Degree Program:</label><select id="jm-program" data-option-set="degreePrograms"></select></div>
<div class="jobs-form-group"><label for="jm-grad">Graduation Year:</label><select id="jm-grad" data-option-set="graduationTerms"></select></div>
</div>
<div class="jobs-form-row">
<div class="jobs-form-group"><label for="jm-location">Preferred Location:</label><select id="jm-location" data-option-set="locations"></select></div>
<div class="jobs-form-group"><label for="jm-auth">Work Authorization:</label><select id="jm-auth">
<option>US citizen / permanent resident</option>
<option>F-1 OPT / STEM OPT eligible</option>
<option>H-1B sponsorship needed</option>
</select></div>
</div>
<div class="jobs-form-row full">
<div class="jobs-form-group"><label for="jm-skills">Your Skills (comma-separated):</label> <input id="jm-skills" type="text" placeholder="e.g. Python, React, SQL, AWS" /></div>
</div>
<button id="jm-btn" class="snippetButton" tabindex="0" type="button" onclick="runJobMatch()">Find My Job Matches &rarr;</button></form>
<div class="all-sources">
<p class="all-sources-text">Listings are aggregated from third-party sources (including USAJOBS) and are not verified or endorsed by the University of South Florida. Match scores are automated estimates and do not guarantee eligibility, fit, or employment. Results may be incomplete or inaccurate and should not be your only source for career decisions. Confirm all details on the original posting before applying.</p>
</div>
<div id="jm-loading" class="jobs-loading" aria-live="polite" aria-busy="true"><span class="jobs-spinner" aria-hidden="true"></span> <span>Loading job matches...</span></div>
<div id="jm-results" class="jobs-results"></div>
</div>
<!-- FIND MY INTERNSHIP: Two columns with program+grad on left, skills on right -->
<div id="internships" class="jobs-panel">
<h3>Find My Internship Match</h3>
<form class="jobs-form">
<div class="jobs-form-row">
<div class="jobs-form-group"><label for="ji-program">Your Degree Program:</label><select id="ji-program" data-option-set="degreePrograms"></select></div>
<div class="jobs-form-group"><label for="ji-grad">Graduation Year:</label><select id="ji-grad" data-option-set="graduationTerms"></select></div>
</div>
<div class="jobs-form-row">
<div class="jobs-form-group"><label for="ji-location">Preferred Location:</label><select id="ji-location" data-option-set="locations"></select></div>
<div class="jobs-form-group"><label for="ji-auth">Work Authorization:</label><select id="ji-auth">
<option>US citizen / permanent resident</option>
<option>F-1 OPT / STEM OPT eligible</option>
<option>H-1B sponsorship needed</option>
</select></div>
</div>
<div class="jobs-form-row full">
<div class="jobs-form-group"><label for="ji-skills">Your Skills (comma-separated):</label> <input id="ji-skills" type="text" placeholder="e.g. Python, React, SQL, AWS" /></div>
</div>
<button id="ji-btn" class="snippetButton" tabindex="0" type="button" onclick="runInternshipMatch()">Find My Internship Matches &rarr;</button></form>
<p class="all-sources-text">Listings are aggregated from third-party sources (including USAJOBS) and are not verified or endorsed by the University of South Florida. Match scores are automated estimates and do not guarantee eligibility, fit, or employment. Results may be incomplete or inaccurate and should not be your only source for career decisions. Confirm all details on the original posting before applying.</p>
<div id="ji-loading" class="jobs-loading" aria-live="polite" aria-busy="true"><span class="jobs-spinner" aria-hidden="true"></span> <span>Loading internship matches...</span></div>
<div id="ji-results" class="jobs-results"></div>
</div>
<div id="events" class="jobs-panel">
<h3>Events Calendar</h3>
<div class="jobs-filters" role="group" aria-label="Event filters"><button class="jobs-filter-button active" tabindex="0" type="button" aria-pressed="true" onclick="filterEvents('all', this)"> All Events </button> <button class="jobs-filter-button" tabindex="0" type="button" aria-pressed="false" onclick="filterEvents('workshops', this)"> Workshops </button> <button class="jobs-filter-button" tabindex="0" type="button" aria-pressed="false" onclick="filterEvents('panels', this)"> Panels </button> <button class="jobs-filter-button" tabindex="0" type="button" aria-pressed="false" onclick="filterEvents('networking', this)"> Networking </button> <button class="jobs-filter-button" tabindex="0" type="button" aria-pressed="false" onclick="filterEvents('student-orgs', this)"> Student Org Events </button></div>
<div id="events-loading" class="jobs-loading" aria-live="polite" aria-busy="true"><span class="jobs-spinner" aria-hidden="true"></span> <span>Loading events...</span></div>
<div id="events-list" class="dateItems-list"><!-- Events will be generated here by JavaScript --></div>
</div>
<div id="employers" class="jobs-panel">
<h3>Why Recruit from Bellini College</h3>
<div class="employer-grid">
<div class="c-calloutText c-calloutText--grey employer-card"><span class="employer-tag">Talent pipeline</span>
<h3 class="c-calloutText_heading">Programs aligned to market demand</h3>
<div class="c-calloutText_text">
<p>We offer degree programs in high-demand fields such as computer science, AI, data intelligence, cybersecurity and computer engineering, preparing talent for some of the fastest-growing roles in Florida and across the U.S.</p>
</div>
</div>
<div class="c-calloutText c-calloutText--grey employer-card"><span class="employer-tag">AI-ready graduates</span>
<h3 class="c-calloutText_heading">Curriculum built for the AI era</h3>
<div class="c-calloutText_text">
<p>Graduates trained in machine learning, deep learning, natural language processing and applied AI systems &mdash; directly address the 12,735 Florida postings requiring AI skills identified in 2024.</p>
</div>
</div>
<div class="c-calloutText c-calloutText--grey employer-card"><span class="employer-tag">Scale</span>
<h3 class="c-calloutText_heading">One of Florida&rsquo;s largest computing colleges</h3>
<div class="c-calloutText_text">
<p>More than 70 faculty across AI, cybersecurity, computer science and computer engineering. USF is Florida&rsquo;s fastest-growing research university.</p>
</div>
</div>
<div class="c-calloutText c-calloutText--grey employer-card"><span class="employer-tag">Location</span>
<h3 class="c-calloutText_heading">Tampa Bay &mdash; a rising tech market</h3>
<div class="c-calloutText_text">
<p>Florida is No. 4 nationally in net tech employment and No. 3 for projected job gains.</p>
</div>
</div>
</div>
<h3>Recruiting Options</h3>
<div class="recruiting-grid">
<div class="c-calloutText c-calloutText--grey recruiting-card">
<h3 class="c-calloutText_heading">On-campus recruiting</h3>
<div class="c-calloutText_text">
<p>Info sessions, tech talks and interview suites. Spring and fall career fairs with targeted computing tracks.</p>
<a class="recruiting-link" tabindex="0" href="mailto:ecouillard@usf.edu">Schedule a visit &rarr;</a></div>
</div>
<div class="c-calloutText c-calloutText--grey recruiting-card">
<h3 class="c-calloutText_heading">Internship partnerships</h3>
<div class="c-calloutText_text">
<p>Post internship and co-op positions directly to Bellini College students via our career portal.</p>
<a class="recruiting-link" tabindex="0" href="mailto:ecouillard@usf.edu">Post a position &rarr;</a></div>
</div>
<div class="c-calloutText c-calloutText--grey recruiting-card">
<h3 class="c-calloutText_heading">Capstone sponsorship</h3>
<div class="c-calloutText_text">
<p>Sponsor a senior or graduate capstone. Your real-world problem, our students&rsquo; solutions &mdash; with faculty oversight.</p>
<a class="recruiting-link" tabindex="0" href="#">Explore capstones &rarr;</a></div>
</div>
</div>
<h3>Recruit Bellini College Talent</h3>
<p>Connect with our top computer science and technology students. Fill out the form below to express your hiring interest.</p>
<form id="recruit-form" class="jobs-form" onsubmit="submitRecruitment(event)">
<div class="jobs-form-group"><label for="recruit-company">Company Name:</label> <input id="recruit-company" name="company" required="" type="text" /></div>
<div class="jobs-form-group"><label for="recruit-name">Contact Name:</label> <input id="recruit-name" name="contactName" required="" type="text" /></div>
<div class="jobs-form-group"><label for="recruit-email">Contact Email:</label> <input id="recruit-email" name="email" required="" type="email" /></div>
<div class="jobs-form-group"><label for="recruit-positions">Open Positions:</label> <textarea id="recruit-positions" style="min-height: 100px;" name="message" required=""></textarea></div>
<!-- Honeypot anti-spam field. Keep hidden from real users. --> <input id="recruit-website" style="position: absolute; left: -9999px;" tabindex="-1" autocomplete="off" name="website" type="text" /> <button class="snippetButton" tabindex="0" type="submit">Submit Your Interest</button>
<p class="all-sources-text">Information submitted through this form is used only to respond to your recruiting interest. Submitting it does not create a hiring agreement or partnership with USF.</p>
</form></div>
</div>
<script>
  function isSafariBrowser() {
    return /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(navigator.userAgent);
  }

  if (isSafariBrowser()) {
    document.documentElement.classList.add("is-safari");
  }

  //<![CDATA[
  function switchPanel(panelName, button) {
    document.querySelectorAll('.jobs-panel').forEach(panel => panel.classList.remove('active'));
    const panel = document.getElementById(panelName);
    if (panel) panel.classList.add('active');
    document.querySelectorAll('.jobs-tabs button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  }

  function filterEvents(category, button) {
    const events = document.querySelectorAll('[data-category]');

    events.forEach(event => {
      if (category === 'all' || event.dataset.category === category) {
        event.classList.remove('hidden');
      } else {
        event.classList.add('hidden');
      }
    });

    document.querySelectorAll('.jobs-filters button').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });

    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
  }

  // ═══ LIGHTCAST API CONFIGURATION ═══
  const LIGHTCAST_BASE_CONFIG = {
    apiKey: "n3pncM4UFnbKWMWVoFy65EOR9AkCZTd93WC2Q1x8",
    clientName: "UniversitySouthFloridaCMS",
    country: "us",
    geoIds: ["-1"],
    level: "nation"
  };

  const LIGHTCAST_DEGREE_CONFIGS = {
    bscs: { key: "bscs", label: "BS Computer Science", occupationCodes: ["15-1211.00", "15-1211.01", "15-1242.00", "15-1244.00", "15-1253.00", "15-1255.00", "15-1255.01", "15-1299.01", "15-1299.03", "15-1299.04", "15-1299.06", "15-1299.07"] },
    bscp: { key: "bscp", label: "BS Computer Engineering", occupationCodes: ["15-1231.00", "15-1232.00", "15-1241.01", "15-1252.00", "15-1253.00", "17-2061.00"] },
    bscse: { key: "bscse", label: "BS Computer Science and Engineering", occupationCodes: ["11-3021.00", "15-1211.00", "15-1221.00", "15-1241.00", "15-1242.00", "15-1243.00", "15-1244.00", "15-1253.00", "15-1255.00", "15-1299.04", "15-1299.06", "25-1021.00"] },
    bsai: { key: "bsai", label: "BS Artificial Intelligence", occupationCodes: ["15-1253.00", "15-1299.01", "15-1299.03", "15-2051.01", "15-2051.02"] },
    bscys: { key: "bscys", label: "BS Cybersecurity", occupationCodes: ["15-1212.00", "15-1231.00", "15-1242.00", "15-1244.00", "15-1299.04", "15-1299.06"] },
    bsit: { key: "bsit", label: "BS Information Technology", occupationCodes: ["15-1211.00", "15-1211.01", "15-1212.00", "15-1231.00", "15-1244.00", "15-1252.00", "15-1253.00", "15-1299.01"] },
    mscs: { key: "mscs", label: "MS Computer Science", occupationCodes: ["15-1221.00", "15-1241.00", "15-1242.00", "15-1243.00", "15-1252.00", "15-1253.00", "15-1299.08", "15-1299.09", "15-2051.00"] },
    mscpe: { key: "mscpe", label: "MS Computer Engineering", occupationCodes: ["15-1221.00", "15-1241.00", "15-1243.00", "15-1251.00", "15-1252.00", "15-1253.00", "15-1299.08", "17-2061.00"] },
    msai: { key: "msai", label: "MS Artificial Intelligence", occupationCodes: ["15-1221.00", "15-1241.00", "15-1243.00", "15-1252.00", "15-1299.08", "15-2031.00", "15-2041.00", "15-2051.00"] },
    mscys: { key: "mscys", label: "MS Cybersecurity", occupationCodes: ["11-3021.00", "13-1199.07", "15-1212.00", "15-1241.00", "15-1299.04", "15-1299.05", "15-1299.08"] },
    phdcse: { key: "phdcse", label: "PhD Computer Science and Engineering", occupationCodes: ["14-0901.00"] }, 
    phdds: { key: "phdds", label: "PhD Data Science", occupationCodes: ["11-0104.00"] }

};
// 
  // ═══ CALENDAR API CONFIGURATION ═══
  const CALENDAR_FEED_API_KEY = "";
  const EVENTS_FEED_URL =
    typeof window.EVENTS_FEED_URL !== "undefined" && window.EVENTS_FEED_URL
      ? window.EVENTS_FEED_URL
      : "https://script.google.com/macros/s/AKfycbzb9t1LqPA7HjmHP-8tqYYsvZv771zIzp9n70Ij5eDI0_A-rMKXsg1br-A2JS9i6qZy/exec";

  // Utility functions
  function parseNum(v) {
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    if (typeof v !== "string") return null;
    const n = Number(v.replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : null;
  }

  function formatInt(n) {
    return (parseNum(n) ?? 0).toLocaleString("en-US");
  }

  function formatPct(n) {
    const v = parseNum(n) ?? 0;
    return (v >= 0 ? "+" : "") + v.toFixed(1) + "%";
  }

  function pickNum(obj, keys) {
    for (const k of keys) {
      if (obj && Object.prototype.hasOwnProperty.call(obj, k)) {
        const n = parseNum(obj[k]);
        if (n != null) return { value: n, key: k };
      }
    }
    return { value: null, key: null };
  }

  function pickEmploymentYear(career, year) {
    if (!career || !Array.isArray(career.employment)) {
      return { value: null, key: null, raw: null };
    }
    for (const row of career.employment) {
      if (!row || parseNum(row.year) !== year) continue;
      const n = parseNum(row.number);
      if (n != null) {
        return { value: n, key: "employment[" + year + "]", raw: row.number };
      }
    }
    return { value: null, key: null, raw: null };
  }

  // Build Lightcast API URL
  function buildLightcastWidgetDataUrl(degreeKey) {
    const degreeConfig = LIGHTCAST_DEGREE_CONFIGS[degreeKey];
    if (!degreeConfig || !Array.isArray(degreeConfig.occupationCodes) || !degreeConfig.occupationCodes.length) {
      throw new Error("No occupation codes configured.");
    }
    const params = new URLSearchParams();
    params.set("occupationCodes", degreeConfig.occupationCodes.join(","));
    params.set("geoIds", LIGHTCAST_BASE_CONFIG.geoIds.join(","));
    params.set("level", LIGHTCAST_BASE_CONFIG.level);
    params.set("cacheTimestamp", Date.now().toString());
    return "https://api.pathways.moderncampus.net/v1/tenant-public/clients/" +
      encodeURIComponent(LIGHTCAST_BASE_CONFIG.clientName) + "/" +
      encodeURIComponent(LIGHTCAST_BASE_CONFIG.country) + "/widget-data?" + params.toString();
  }

  // Fetch Lightcast data
  async function fetchLightcastDataForDegree(degreeKey) {
    const response = await fetch(buildLightcastWidgetDataUrl(degreeKey), {
      method: "GET",
      mode: "cors",
      cache: "default",
      credentials: "omit",
      headers: {
        "Accept": "application/json",
        "x-api-key": LIGHTCAST_BASE_CONFIG.apiKey
      }
    });
    if (!response.ok) throw new Error("Projection API request failed (" + response.status + ").");
    const payload = await response.json();
    if (!payload || !payload.data || !Array.isArray(payload.data.careers)) {
      throw new Error("Unexpected projection payload.");
    }
    return payload.data.careers;
  }

  // Convert career object to projection row with robust field extraction
  function toProjectionRow(career) {
    const title = career.occupationTitle || career.title || career.name || (career.occupation && career.occupation.title) || "Occupation";
    const jobs2023YearPick = pickEmploymentYear(career, 2023);
    const jobs2033YearPick = pickEmploymentYear(career, 2033);
    const jobs2023FallbackPick = pickNum(career, [
      "jobsCurrent",
      "currentEmployment",
      "employment",
      "employment2023",
      "baseEmployment",
      "jobsBase",
      "currentJobs"
    ]);
    const jobs2033FallbackPick = pickNum(career, [
      "jobsProjected",
      "projectedEmployment",
      "projectedJobs",
      "employment2033",
      "futureEmployment",
      "forecastEmployment"
    ]);
    const apiGrowthPick = pickNum(career, [
      "percentChange",
      "growthRate",
      "projectedGrowthPercent",
      "percent_growth"
    ]);
    const jobs2023 = jobs2023YearPick.value ?? jobs2023FallbackPick.value ?? 0;
    const jobs2033 = jobs2033YearPick.value ?? jobs2033FallbackPick.value;
    const apiGrowthPct = apiGrowthPick.value;
    const computedGrowthPct =
      jobs2033 != null && jobs2023 > 0
        ? ((jobs2033 - jobs2023) / jobs2023) * 100
        : null;
    const growthPct = computedGrowthPct != null ? computedGrowthPct : (apiGrowthPct ?? 0);
    return {
      title,
      jobs2023,
      jobs2033,
      growthPct
    };
  }

  function updateProjections() {
    const degree = document.getElementById('prospective-degree').value;
    const status = document.getElementById('projection-status');
    if (!degree) return;

    if (status) status.textContent = "Loading projections...";

    fetchLightcastDataForDegree(degree)
      .then(careers => {
        const rows = careers.map(toProjectionRow).filter(r => r.title && r.jobs2023 != null && r.growthPct != null);
        const sorted = [...rows].sort((a, b) => b.growthPct - a.growthPct).slice(0, 8);
        const maxGrowth = Math.max(...sorted.map(r => Math.max(r.growthPct, 0)), 1);

        const body = document.getElementById('projection-body');
        if (body) {
          let html = '';
          sorted.forEach(r => {
            const w = Math.max(4, Math.round((Math.max(r.growthPct, 0) / maxGrowth) * 100));
            if(r.growthPct > 0) {
            html += `<tr>
              <td>${r.title}</td>
              <td>${formatInt(r.jobs2023)}</td>
              <td>${r.jobs2033 != null ? formatInt(r.jobs2033) : "–"}</td>
              <td>${formatPct(r.growthPct)}</td>
              <td class="bar-cell">
                <div class="bar-wrap">
                  <div class="bar" style="width: ${w}%;"></div>
                </div>
              </td>
            </tr>`;
            }
          });
          body.innerHTML = html;
        }

        const label = LIGHTCAST_DEGREE_CONFIGS[degree] ? LIGHTCAST_DEGREE_CONFIGS[degree].label : "Program";
        if (status) status.textContent = "Showing latest national projections for " + label + ".";
      })
      .catch(err => {
        if (status) status.textContent = "Could not load projections. Please try again.";
      });
  }

  // ═══ GOOGLE APPS SCRIPT API ═══
  const JOB_SEARCH_API_URL = "https://script.google.com/macros/s/AKfycbxhPUHkE0KwRhQgokgZt2nn7fN9-w5VZ1syj8aeMgN8LntrDKfk4m7wpcrxn920Lvo/exec";
  const JOB_SEARCH_API_KEY = "";
  const JOB_SEARCH_JSONP_MAX_URL = 7500;
  const JOB_SEARCH_JSONP_TIMEOUT_MS = 40000;

  function jobSearchEscapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function randomJsonpCallbackName() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    let s = "cb_";
    for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, "0");
    return s;
  }

  function jobSearchJsonp(baseUrl, params) {
    return new Promise((resolve, reject) => {
      const cbName = randomJsonpCallbackName();
      let u;
      try { u = new URL(baseUrl); } catch { reject(new Error("Invalid API URL")); return; }
      if (u.protocol !== "https:") { reject(new Error("Invalid API URL")); return; }
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null || v === "") continue;
        qs.set(k, String(v));
      }
      qs.set("callback", cbName);
      u.search = "?" + qs.toString();
      if (u.href.length > JOB_SEARCH_JSONP_MAX_URL) { reject(new Error("Request too large")); return; }

      const script = document.createElement("script");
      let done = false;
      const cleanup = () => {
        if (script.parentNode) script.parentNode.removeChild(script);
        try { delete window[cbName]; } catch (_) { }
      };
      const finish = (fn) => {
        if (done) return;
        done = true;
        clearTimeout(tid);
        cleanup();
        fn();
      };
      window[cbName] = (data) => finish(() => resolve(data));
      script.onerror = () => finish(() => reject(new Error("Load failed")));
      const tid = setTimeout(() => finish(() => reject(new Error("Timeout"))), JOB_SEARCH_JSONP_TIMEOUT_MS);
      script.src = u.href;
      document.head.appendChild(script);
    });
  }

  async function runJobMatch() {
    return runMatchSearch({
      fieldPrefix: 'jm',
      btnId: 'jm-btn',
      loadingId: 'jm-loading',
      resultsId: 'jm-results',
      headingText: 'Your personalized job matches',
      forceInternshipSearch: false
    });
  }

  async function runInternshipMatch() {
    return runMatchSearch({
      fieldPrefix: 'ji',
      btnId: 'ji-btn',
      loadingId: 'ji-loading',
      resultsId: 'ji-results',
      headingText: 'Your personalized internship matches',
      forceInternshipSearch: true
    });
  }

  async function runMatchSearch(config) {
    const val = (id) => {
      const el = document.getElementById(id);
      return el ? el.value : '';
    };

    const program = val(config.fieldPrefix + '-program');
    const grad = val(config.fieldPrefix + '-grad');
    const skills = val(config.fieldPrefix + '-skills');
    const location = val(config.fieldPrefix + '-location');
    const auth = val(config.fieldPrefix + '-auth');

    if (!program || !grad) {
      alert('Please select your degree program and graduation timeline.');
      return;
    }

    const btn = document.getElementById(config.btnId);
    const results = document.getElementById(config.resultsId);

    if (btn) btn.disabled = true;
    setLoadingState(config.loadingId, true);

    if (results) results.innerHTML = '';

    const loadErrorHtml =
      '<div style="font-size:0.9rem;opacity:0.7;padding:0.5rem 0;">Could not load matches — please try again or visit career services.</div>';

    try {
      if (!JOB_SEARCH_API_URL) {
        throw new Error('JOB_SEARCH_API_URL is not configured.');
      }

      /*
       * Important:
       * - forceInternshipSearch: true  => internships only
       * - forceInternshipSearch: false => jobs only
       *
       * employment_type remains the graduation timeline.
       */
      const searchType = config.forceInternshipSearch ? 'internship' : 'job';

      const isRemote = location === 'Remote';

      const params = {
        action: 'job-search',
        query_text: [program, (skills || '').trim()]
          .filter(Boolean)
          .join(' ')
          .trim(),
        location_text: isRemote ? 'United States' : (location || 'Florida'),
        employment_type: grad,
        search_type: searchType,
        limit_per_provider: '20',
        authorization: auth || undefined,
        remote_mode: isRemote ? 'remote' : undefined
      };

      if (JOB_SEARCH_API_KEY) {
        params.api_key = JOB_SEARCH_API_KEY;
      }

      const data = await jobSearchJsonp(JOB_SEARCH_API_URL, params);

      if (data == null || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Invalid response');
      }

      if (data.error) {
        if (data.error === 'Unauthorized') {
          results.innerHTML =
            '<div style="font-size:0.9rem;opacity:0.7;padding:0.5rem 0;">The jobs API requires a matching key. Set <code>JOB_SEARCH_API_KEY</code> in this asset to match <code>WEBAPP_API_KEY</code> in Apps Script properties.</div>';
          return;
        }

        if (data.error === 'Rate limit exceeded') {
          results.innerHTML =
            '<div style="font-size:0.9rem;opacity:0.7;padding:0.5rem 0;">Too many searches right now. Please try again in a little while.</div>';
          return;
        }

        results.innerHTML = loadErrorHtml;
        return;
      }

      const jobs = Array.isArray(data.results) ? data.results : [];
      renderResults(jobs, config.resultsId, config.headingText);
    } catch (e) {
      if (results) results.innerHTML = loadErrorHtml;
    } finally {
      if (btn) btn.disabled = false;
      setLoadingState(config.loadingId, false);
    }
  }

  function renderResults(jobs, resultsId, headingText) {
    const el = document.getElementById(resultsId);
    if (!jobs || !jobs.length) {
      el.innerHTML = '<div style="font-size:0.9rem;opacity:0.7;">No results. Refine your profile and try again.</div>';
      return;
    }
    let html = '<h3 style="margin-bottom:0.75rem;">' + jobSearchEscapeHtml(headingText) + '</h3>';
    jobs.forEach(j => {
      const score = Math.round(+(j.match_score || j.score)) || 85;
      const title = jobSearchEscapeHtml(j.title || '');
      const meta = [j.location || '', j.pay || j.salary || '', j.source || '', j.provider ? 'Provider: ' + j.provider : '']
        .filter(Boolean).map(jobSearchEscapeHtml).join(' • ');
      const why = jobSearchEscapeHtml(j.why || 'Based on your selected program, skills, and location.');
      const applyLink = j.apply_url ? `<a tabindex="0"  href="${jobSearchEscapeHtml(j.apply_url)}" target="_blank" rel="noopener">Apply now →</a>` : '';
      const linkedinLink = j.linkedin ? `<a tabindex="0"  href="${jobSearchEscapeHtml(j.linkedin)}" target="_blank" rel="noopener">LinkedIn →</a>` : '';
      const indeedLink = j.indeed ? `<a tabindex="0"  href="${jobSearchEscapeHtml(j.indeed)}" target="_blank" rel="noopener">Indeed →</a>` : '';
      html += `<div class="jobs-result-item">
        <h4>${title} <span style="float:right;font-size:0.85rem;opacity:0.7;">${score}% match</span></h4>
        <p style="font-size:0.9rem;opacity:0.8;">${meta}</p>
        <p>${why}</p>
        <p style="display:flex;gap:1rem;flex-wrap:wrap;font-size:0.9rem;">${applyLink} ${linkedinLink} ${indeedLink}</p>
      </div>`;
    });
    html += '<div style="font-size:0.8rem;opacity:0.6;margin-top:0.75rem;">Live search uses federal listings (USAJOBS) — confirm details on the agency posting.</div>';
    el.innerHTML = html;
  }

  const RECRUITMENT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw7GNyKmBm1y1ImFrSZuJ3gd9C5c7A0a21ciCrHwL7W6A_Y5oqXkWlso57mMTYHQShH/exec';

  const recruitmentFormLoadedAt = Date.now();

  function cleanClientValue(value, maxLength) {
    return String(value || '')
      .replace(/[\u0000-\u001F\u007F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLength);
  }

  function getRecruitmentPayload() {
    return {
      company: cleanClientValue(document.getElementById('recruit-company').value, 150),
      contactName: cleanClientValue(document.getElementById('recruit-name').value, 150),
      email: cleanClientValue(document.getElementById('recruit-email').value, 254),
      message: cleanClientValue(document.getElementById('recruit-positions').value, 2000),
      website: cleanClientValue(document.getElementById('recruit-website').value, 200),
      pageUrl: window.location.href,
      formElapsedMs: Date.now() - recruitmentFormLoadedAt
    };
  }

  function validateRecruitmentPayload(payload) {
    if (!payload.company) return 'Please enter the company name.';
    if (!payload.contactName) return 'Please enter the contact name.';
    if (!payload.email) return 'Please enter the contact email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return 'Please enter a valid email address.';
    if (!payload.message) return 'Please enter the open positions.';

    return '';
  }

  async function submitRecruitment(event) {
    event.preventDefault();

    const form = document.getElementById('recruit-form');
    const submitButton = form.querySelector('button[type="submit"]');
    const payload = getRecruitmentPayload();
    const validationError = validateRecruitmentPayload(payload);

    if (validationError) {
      alert(validationError);
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
      const response = await fetch(RECRUITMENT_WEB_APP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Submission failed.');
      }

      alert(`Thank you! We've received your recruitment interest for ${payload.company}. We'll be in touch soon.`);
      form.reset();
    } catch (error) {
      console.error(error);
      alert('Something went wrong while submitting the form. Please try again.');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Your Interest';
    }
  }


  function normalizeAppsScriptExecUrl(url) {
    var value = String(url || "").trim();
    if (!value) return "";
    var marker = "/exec";
    var firstExecIdx = value.indexOf(marker);
    if (firstExecIdx === -1) return value;
    var secondSchemeIdx = value.indexOf("https://", firstExecIdx + marker.length);
    if (secondSchemeIdx !== -1) {
      return value.slice(secondSchemeIdx);
    }
    return value;
  }

  function evMdParts(iso) {
    const d = new Date(iso);
    const month = d.toLocaleString("en-US", { month: "short", timeZone: "America/New_York" });
    const day = d.toLocaleString("en-US", { day: "numeric", timeZone: "America/New_York" });
    return { month, day };
  }

  function googleCalendarTemplateUrl(ev) {
    const q = new URLSearchParams();
    q.set("action", "TEMPLATE");
    q.set("text", ev.title || "");
    q.set("details", ev.meta_line || "");
    q.set("dates", (ev.start_iso || "").replace(/-|:/g, "") + "/" + (ev.end_iso || "").replace(/-|:/g, ""));
    return "https://calendar.google.com/calendar/render?" + q.toString();
  }

  function setLoadingState(loadingId, isLoading) {
    const loading = document.getElementById(loadingId);
    if (!loading) return;

    if (isLoading) {
      loading.classList.add('active');
      loading.setAttribute('aria-busy', 'true');
    } else {
      loading.classList.remove('active');
      loading.setAttribute('aria-busy', 'false');
    }
  }

  async function loadCareerEvents() {

    const el = document.getElementById("events-list");
    if (!el) return;
    setLoadingState('events-loading', true);
    el.innerHTML = '';
    const base = normalizeAppsScriptExecUrl(EVENTS_FEED_URL);
    if (!base) {
      el.innerHTML = '<div style="color:#666;padding:1rem;">Calendar feed URL is not configured.</div>';
Searched
c-calloutText--gray|c-calloutText_heading|c-calloutText_text|all-sources
pattern: c-calloutText--gray|c-calloutText_heading|c-calloutText_text|all-sources
path: tcap/omnicms-snippets/jobs.html
output_mode: content
-n: true
435:  .spotlight-grid .c-calloutText_heading {
439:  .spotlight-grid .c-calloutText_text p {
471:  .career-grid > .c-calloutText .c-calloutText_text {
479:  .career-grid > .c-calloutText .c-calloutText_text p {
516:  .all-sources {
523:  .all-sources-heading {
530:  .all-sources-list {
535:  .all-sources-list li {
539:  .all-sources-list a {
544:  .all-sources-list a:hover,
545:  .all-sources-list a:focus {
550:  .all-sources-list a:focus-visible {
555:  .all-sources-list a[href$=".pdf"],
556:  .all-sources-list a[href$=".pdf"]:visited {
560:  .all-sources-text {
569:  .all-sources-text a,
570:  .all-sources-text a:visited {
575:  .all-sources-text a:hover,
576:  .all-sources-text a:focus {
581:  .all-sources-text a:focus-visible {
586:  .all-sources-text a[href$=".pdf"],
587:  .all-sources-text a[href$=".pdf"]:visited {
819:  .employer-card .c-calloutText_heading {
824:  .employer-card .c-calloutText_text p {
845:  .recruiting-card .c-calloutText_heading {
850:  .recruiting-card .c-calloutText_text {
856:  .recruiting-card .c-calloutText_text p {
891:<div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
892:<h3 class="c-calloutText_heading">+17.9%</h3>
893:<div class="c-calloutText_text">Software developer growth 2023&ndash;2033
894:<section class="all-sources" aria-labelledby="stat-sources-heading">
895:<p class="all-sources-text">Software developer growth 2023&ndash;2033: <span>BLS / MLR 2025.</span></p>
899:<div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
900:<h3 class="c-calloutText_heading">546K</h3>
901:<div class="c-calloutText_text">Tech workers in Florida (No. 4 nationally)
902:<section class="all-sources" aria-labelledby="stat-sources-heading">
903:<p class="all-sources-text">Florida tech workforce count: <span>CompTIA 2025.</span></p>
907:<div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
908:<h3 class="c-calloutText_heading">$102,908</h3>
909:<div class="c-calloutText_text">Florida tech wage &mdash; 122% above state median
910:<section class="all-sources" aria-labelledby="stat-sources-heading">
911:<p class="all-sources-text">Median Florida tech wage: <span>CompTIA / Lightcast 2024.</span></p>
915:<div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
916:<h3 class="c-calloutText_heading">12,735</h3>
917:<div class="c-calloutText_text">Active Florida job postings requiring AI skills
918:<section class="all-sources" aria-labelledby="stat-sources-heading">
919:<p class="all-sources-text">Florida AI-skill job postings: <span>CompTIA 2024.</span></p>
1007:<h3 class="c-calloutText_heading">107,404</h3>
1008:<div class="c-calloutText_text">
1013:<h3 class="c-calloutText_heading">16,973</h3>
1014:<div class="c-calloutText_text">
1019:<h3 class="c-calloutText_heading">No. 3</h3>
1020:<div class="c-calloutText_text">
1028:<h3 class="c-calloutText_heading">Productivity Creates Demand</h3>
1029:<div class="c-calloutText_text">
1034:<h3 class="c-calloutText_heading">Data &amp; AI: Fastest-Growing Segment</h3>
1035:<div class="c-calloutText_text">
1040:<section class="all-sources" aria-labelledby="ai-careers-sources-heading">
1041:<h4 id="ai-careers-sources-heading" class="all-sources-heading">Sources</h4>
1042:<ol class="all-sources-list">
1048:<p class="all-sources-text">Updated quarterly.</p>
1049:<p class="all-sources-text">Wage and workforce figures are aggregate regional estimates. Individual earnings vary by role, employer, experience, and location. Employment projections are national estimates from the U.S. Bureau of Labor Statistics and Lightcast, based on historical trends and modeling. They are not guarantees of job availability, salary, or outcomes for any individual or program.</p>
1057:<div class="c-calloutText_text"><img class="career-dev-img" src="https://www.usf.edu/ai-cybersecurity-computing/images/00-icons/reliaquest-labs.png" alt="USF Logo" />
1058:<h4 class="c-calloutText_heading"><a tabindex="0" href="https://www.usf.edu/ai-cybersecurity-computing/academics/student-opportunities/reliaquest-labs.aspx"> ReliaQuest Labs</a></h4>
1062:<div class="c-calloutText_text"><img class="career-dev-img" src="https://www.usf.edu/ai-cybersecurity-computing/images/00-icons/internships.png" alt="USF Logo" />
1063:<h4 class="c-calloutText_heading"><a tabindex="0" href="https://www.usf.edu/ai-cybersecurity-computing/academics/student-opportunities/internships.aspx"> Internships</a></h4>
1067:<div class="c-calloutText_text"><img class="career-dev-img" src="https://www.usf.edu/ai-cybersecurity-computing/images/00-icons/assistantships.png" alt="USF Logo" />
1068:<h4 class="c-calloutText_heading"><a tabindex="0" href="https://www.usf.edu/ai-cybersecurity-computing/academics/student-opportunities/assistantships.aspx"> Assistantships</a></h4>
1072:<div class="c-calloutText_text"><img class="career-dev-img" src="https://www.usf.edu/ai-cybersecurity-computing/images/00-icons/career-services.png" alt="USF Logo" />
1073:<h4 class="c-calloutText_heading"><a tabindex="0" href="https://www.usf.edu/career-services/"> Career Services </a></h4>
1077:<div class="c-calloutText_text"><img class="career-dev-img" src="https://www.usf.edu/ai-cybersecurity-computing/images/00-icons/international-study.png" alt="USF Logo" />
1078:<h4 class="c-calloutText_heading"><a tabindex="0" href="https://educationabroad.global.usf.edu/_portal/program-discovery?search=%5B%7B%22filterType%22:%22programDiscoveryKeyword%22,%22filterValues%22:%5B%7B%22value%22:%22cyber%22%7D%5D%7D%5D"> International Study</a></h4>
1082:<div class="c-calloutText_text"><img class="career-dev-img" src="https://www.usf.edu/ai-cybersecurity-computing/images/00-icons/student-orgs.png" alt="USF Logo" />
1083:<h4 class="c-calloutText_heading"><a tabindex="0" href="https://www.usf.edu/ai-cybersecurity-computing/academics/student-opportunities/student-organizations.aspx"> Student Organizations</a></h4>
1087:<div class="c-calloutText_text"><img class="career-dev-img" src="https://www.usf.edu/ai-cybersecurity-computing/images/00-icons/scholarships.png" alt="USF Logo" />
1088:<h4 class="c-calloutText_heading"><a tabindex="0" href="https://www.usf.edu/financial-aid/scholarships/index.aspx"> Scholarships</a></h4>
1092:<div class="c-calloutText_text"><img class="career-dev-img" src="https://www.usf.edu/ai-cybersecurity-computing/images/00-icons/peer-tutoring.png" alt="USF Logo" />
1093:<h4 class="c-calloutText_heading"><a tabindex="0" href="https://www.usf.edu/ai-cybersecurity-computing/academics/student-opportunities/peer_tut.aspx"> Peer Tutoring</a></h4>
1097:<div class="c-calloutText_text"><img class="career-dev-img" src="https://www.usf.edu/ai-cybersecurity-computing/images/00-icons/cyberherd.png" alt="USF Logo" />
1098:<h4 class="c-calloutText_heading"><a tabindex="0" href="https://www.usf.edu/ai-cybersecurity-computing/academics/student-opportunities/cyberherd.aspx"> Cyberherd</a></h4>
1105:<h3 class="c-calloutText_heading"><a tabindex="0" href="https://tampabayedc.com/why-tampa-bay/work-tampa/">Tampa Bay</a></h3>
1106:<div class="c-calloutText_text">
1111:<h3 class="c-calloutText_heading"><a tabindex="0" href="https://becomestpete.com/industries-and-businesses/data-analytics-and-technology/">St. Petersburg</a></h3>
1112:<div class="c-calloutText_text">
1117:<h3 class="c-calloutText_heading"><a tabindex="0" href="https://business.orlando.org/l/technology/">Orlando</a></h3>
1118:<div class="c-calloutText_text">
1123:<h3 class="c-calloutText_heading"><a tabindex="0" href="https://www.beaconcouncil.com/technology/">Miami</a></h3>
1124:<div class="c-calloutText_text">
1129:<h3 class="c-calloutText_heading"><a tabindex="0" href="https://jaxusa.org/industry/technology-services/">Jacksonville</a></h3>
1130:<div class="c-calloutText_text">
1135:<section class="all-sources" aria-labelledby="all-sources-heading">
1136:<h4 id="all-sources-heading" class="all-sources-heading">Sources</h4>
1137:<ol class="all-sources-list">
1166:<div class="all-sources">
1167:<p class="all-sources-text">Listings are aggregated from third-party sources (including USAJOBS) and are not verified or endorsed by the University of South Florida. Match scores are automated estimates and do not guarantee eligibility, fit, or employment. Results may be incomplete or inaccurate and should not be your only source for career decisions. Confirm all details on the original posting before applying.</p>
1192:<p class="all-sources-text">Listings are aggregated from third-party sources (including USAJOBS) and are not verified or endorsed by the University of South Florida. Match scores are automated estimates and do not guarantee eligibility, fit, or employment. Results may be incomplete or inaccurate and should not be your only source for career decisions. Confirm all details on the original posting before applying.</p>
1206:<h3 class="c-calloutText_heading">Programs aligned to market demand</h3>
1207:<div class="c-calloutText_text">
1212:<h3 class="c-calloutText_heading">Curriculum built for the AI era</h3>
1213:<div class="c-calloutText_text">
1218:<h3 class="c-calloutText_heading">One of Florida&rsquo;s largest computing colleges</h3>
1219:<div class="c-calloutText_text">
1224:<h3 class="c-calloutText_heading">Tampa Bay &mdash; a rising tech market</h3>
1225:<div class="c-calloutText_text">
1233:<h3 class="c-calloutText_heading">On-campus recruiting</h3>
1234:<div class="c-calloutText_text">
1239:<h3 class="c-calloutText_heading">Internship partnerships</h3>
1240:<div class="c-calloutText_text">
1245:<h3 class="c-calloutText_heading">Capstone sponsorship</h3>
1246:<div class="c-calloutText_text">
1259:<p class="all-sources-text">Information submitted through this form is used only to respond to your recruiting interest. Submitting it does not create a hiring agreement or partnership with USF.</p>
Searched
stat-bar|c-calloutText
pattern: stat-bar|c-calloutText
path: tcap/omnicms-snippets/overview.snippet.html
output_mode: content
-n: true
-C: 2
36-  }
37-
38:  /* Stat bar — exact copy of jobs.html's `.jobs-stat-bar` grid plus its real
39:     `c-calloutText`/`c-calloutText_heading`/`c-calloutText_text` component
40-     and `.all-sources`/`.all-sources-text` citation styling, so these cards
41-     render identically to the live jobs page. */
42:  #tcap-omni-overview-root .stat-bar {
43-    display: grid;
44-    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
--
48-  }
49-
50:  #tcap-omni-overview-root .stat-bar > * {
51-    align-self: start;
52-    margin: 2px 0 0 0;
--
114-  }
115-
116:  /* Intro cards — c-calloutText */
117-  #tcap-omni-overview-root .intro-grid {
118-    display: grid;
--
170-  }
171-
172:  /* Pillars — c-calloutText cards */
173-  #tcap-omni-overview-root .pillars-grid {
174-    display: grid;
--
304-  @media (max-width: 700px) {
305-
306:    #tcap-omni-overview-root .stat-bar {
307-      grid-template-columns: 1fr;
308-      gap: 1rem;
--
333-  <div class="wf" data-screen-label="Overview">
334-
335:    <div class="stat-bar">
336:      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
337:        <h3 class="c-calloutText_heading">+17.9%</h3>
338:        <div class="c-calloutText_text">Software developer growth 2023&ndash;2033
339-          <section class="all-sources" aria-labelledby="stat-sources-heading">
340-            <p class="all-sources-text">Software developer growth 2023&ndash;2033: <span>BLS / MLR 2025.</span></p>
--
342-        </div>
343-      </div>
344:      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
345:        <h3 class="c-calloutText_heading">546K</h3>
346:        <div class="c-calloutText_text">Tech workers in Florida (No. 4 nationally)
347-          <section class="all-sources" aria-labelledby="stat-sources-heading">
348-            <p class="all-sources-text">Florida tech workforce count: <span>CompTIA 2025.</span></p>
--
350-        </div>
351-      </div>
352:      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
353:        <h3 class="c-calloutText_heading">$102,908</h3>
354:        <div class="c-calloutText_text">Florida tech wage &mdash; 122% above state median
355-          <section class="all-sources" aria-labelledby="stat-sources-heading">
356-            <p class="all-sources-text">Median Florida tech wage: <span>CompTIA / Lightcast 2024.</span></p>
--
358-        </div>
359-      </div>
360:      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
361:        <h3 class="c-calloutText_heading">12,735</h3>
362:        <div class="c-calloutText_text">Active Florida job postings requiring AI skills
363-          <section class="all-sources" aria-labelledby="stat-sources-heading">
364-            <p class="all-sources-text">Florida AI-skill job postings: <span>CompTIA 2024.</span></p>
This file already looks like an attempt to mirror jobs.html's stat-bar. Let me check the git diff to see what's changed and look for issues, plus check the other snippet files and the deleted file.


Ran 3 commands, read a file
Showed changed files summary
git diff --stat
warning: in the working copy of 'tcap/omnicms-snippets/experiential-learning.snippet.html', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tcap/omnicms-snippets/faq.snippet.html', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tcap/omnicms-snippets/overview.snippet.html', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tcap/omnicms-snippets/stages.snippet.html', LF will be replaced by CRLF the next time Git touches it
 .../experiential-learning.snippet.html             | 131 +--
 tcap/omnicms-snippets/faq.snippet.html             | 125 +--
 tcap/omnicms-snippets/overview-source-context.html | 897 ---------------------
 tcap/omnicms-snippets/overview.snippet.html        | 141 ++--
 tcap/omnicms-snippets/stages.snippet.html          | 125 +--
 5 files changed, 319 insertions(+), 1100 deletions(-)
Showed diff for overview.snippet.html
git diff tcap/omnicms-snippets/overview.snippet.html
warning: in the working copy of 'tcap/omnicms-snippets/overview.snippet.html', LF will be replaced by CRLF the next time Git touches it
diff --git a/tcap/omnicms-snippets/overview.snippet.html b/tcap/omnicms-snippets/overview.snippet.html
index d9297ff..9260871 100644
--- a/tcap/omnicms-snippets/overview.snippet.html
+++ b/tcap/omnicms-snippets/overview.snippet.html
@@ -26,7 +26,6 @@
      spacing-bearing container's children so spacing is driven only by
      `gap`. */
   #tcap-omni-overview-root .wf>*,
-  #tcap-omni-overview-root .stat-bar>*,
   #tcap-omni-overview-root .intro-grid>*,
   #tcap-omni-overview-root .pillars-grid>*,
   #tcap-omni-overview-root .journey-grid>*,
@@ -36,53 +35,63 @@
     margin-top: 0;
   }
 
-  /* Stat bar — matches the real jobs.html .c-calloutText--gray stat cards,
-     including the small source-citation line under the description. */
+  /* Stat bar — exact copy of jobs.html's `.jobs-stat-bar` grid plus its real
+     `c-calloutText`/`c-calloutText_heading`/`c-calloutText_text` component
+     and `.all-sources`/`.all-sources-text` citation styling, so these cards
+     render identically to the live jobs page. */
   #tcap-omni-overview-root .stat-bar {
     display: grid;
-    grid-template-columns: repeat(4, minmax(0, 1fr));
-    gap: 16px;
-  }
-
-  #tcap-omni-overview-root .stat-box {
-    background: #efeff0;
-    border: 1px solid #b2b2b2;
-    padding: 24px;
-    min-height: 175px;
+    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
+    gap: 2rem;
+    margin: 2rem 0;
+    align-items: start;
   }
 
-  #tcap-omni-overview-root .stat-num {
-    font-family: "Barlow Condensed", sans-serif;
-    font-weight: 700;
-    font-size: 32px;
-    color: #006747;
-    line-height: 1.1;
-    margin: 0;
+  #tcap-omni-overview-root .stat-bar > * {
+    align-self: start;
+    margin: 2px 0 0 0;
+    padding: 0;
   }
 
-  #tcap-omni-overview-root .stat-desc {
-    font-size: 13px;
-    line-height: 1.4;
-    color: #466069;
-    margin: 10px 0 0;
+  #tcap-omni-overview-root .all-sources {
+    margin-top: 1rem;
+    font-size: 8pt;
+    line-height: 1.35;
+    color: #333333;
   }
 
-  #tcap-omni-overview-root .stat-source {
-    font-size: 11px;
+  #tcap-omni-overview-root .all-sources-text {
+    margin: 0;
+    padding: 0;
+    font-size: 8pt;
     line-height: 1.35;
-    color: #6b6b6b;
-    margin: 12px 0 0;
+    font-weight: 400;
+    color: #333333;
   }
 
-  /* CTA band + real snippetButton */
-  #tcap-omni-overview-root .cta-band {
+  /* CTA band is extracted outside #tcap-omni-overview-root (same reason as
+     the stylized headers) so its background can bleed edge-to-edge instead
+     of being capped at the root's 900px max-width. Rules below are
+     unprefixed on purpose. `.cta-band-inner` keeps the button centered at a
+     normal readable width inside the full-bleed background. */
+  .cta-band {
     background: #EFEFF0;
     padding: 24px;
     text-align: center;
   }
 
-  #tcap-omni-overview-root .snippetButton {
-    display: inline-block;
+  .cta-band-inner {
+    max-width: 900px;
+    margin: 0 auto;
+  }
+
+  /* `!important` on display/max-width: the real site's global CSS has
+     `a.snippetButton { display: block; max-width: 200px; }`. `display: block`
+     ignores the ancestor's `text-align: center`, which is what left-aligns
+     the button once this rule loses the specificity fight. */
+  .cta-band .snippetButton {
+    display: inline-block !important;
+    max-width: none !important;
     background: #006747;
     color: #fff;
     border: 2px solid #006747;
@@ -97,8 +106,8 @@
     cursor: pointer;
   }
 
-  #tcap-omni-overview-root .snippetButton:hover,
-  #tcap-omni-overview-root .snippetButton:focus {
+  .cta-band .snippetButton:hover,
+  .cta-band .snippetButton:focus {
     background: #004c35;
     border-color: #004c35;
     color: #fff;
@@ -294,7 +303,11 @@
 
   @media (max-width: 700px) {
 
-    #tcap-omni-overview-root .stat-bar,
+    #tcap-omni-overview-root .stat-bar {
+      grid-template-columns: 1fr;
+      gap: 1rem;
+    }
+
     #tcap-omni-overview-root .intro-grid,
     #tcap-omni-overview-root .pillars-grid {
       grid-template-columns: 1fr;
@@ -320,31 +333,51 @@
   <div class="wf" data-screen-label="Overview">
 
     <div class="stat-bar">
-      <div class="stat-box">
-        <p class="stat-num">+17.9%</p>
-        <p class="stat-desc">Software developer growth 2023&ndash;2033</p>
-        <p class="stat-source">Software developer growth 2023&ndash;2033: <span>BLS / MLR 2025.</span></p>
+      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
+        <h3 class="c-calloutText_heading">+17.9%</h3>
+        <div class="c-calloutText_text">Software developer growth 2023&ndash;2033
+          <section class="all-sources" aria-labelledby="stat-sources-heading">
+            <p class="all-sources-text">Software developer growth 2023&ndash;2033: <span>BLS / MLR 2025.</span></p>
+          </section>
+        </div>
       </div>
-      <div class="stat-box">
-        <p class="stat-num">546K</p>
-        <p class="stat-desc">Tech workers in Florida (No. 4 nationally)</p>
-        <p class="stat-source">Florida tech workforce count: <span>CompTIA 2025.</span></p>
+      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
+        <h3 class="c-calloutText_heading">546K</h3>
+        <div class="c-calloutText_text">Tech workers in Florida (No. 4 nationally)
+          <section class="all-sources" aria-labelledby="stat-sources-heading">
+            <p class="all-sources-text">Florida tech workforce count: <span>CompTIA 2025.</span></p>
+          </section>
+        </div>
       </div>
-      <div class="stat-box">
-        <p class="stat-num">$102,908</p>
-        <p class="stat-desc">Florida tech wage &mdash; 122% above state median</p>
-        <p class="stat-source">Median Florida tech wage: <span>CompTIA / Lightcast 2024.</span></p>
+      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
+        <h3 class="c-calloutText_heading">$102,908</h3>
+        <div class="c-calloutText_text">Florida tech wage &mdash; 122% above state median
+          <section class="all-sources" aria-labelledby="stat-sources-heading">
+            <p class="all-sources-text">Median Florida tech wage: <span>CompTIA / Lightcast 2024.</span></p>
+          </section>
+        </div>
       </div>
-      <div class="stat-box">
-        <p class="stat-num">12,735</p>
-        <p class="stat-desc">Active Florida job postings requiring AI skills</p>
-        <p class="stat-source">Florida AI-skill job postings: <span>CompTIA 2024.</span></p>
+      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
+        <h3 class="c-calloutText_heading">12,735</h3>
+        <div class="c-calloutText_text">Active Florida job postings requiring AI skills
+          <section class="all-sources" aria-labelledby="stat-sources-heading">
+            <p class="all-sources-text">Florida AI-skill job postings: <span>CompTIA 2024.</span></p>
+          </section>
+        </div>
       </div>
     </div>
 
-    <div class="cta-band">
-      <a class="snippetButton" href="#">Talk to an advisor</a>
-    </div>
+  </div>
+</div>
+
+<div class="cta-band">
+  <div class="cta-band-inner">
+    <a class="snippetButton" href="#">Talk to an advisor</a>
+  </div>
+</div>
+
+<div id="tcap-omni-overview-root">
+  <div class="wf" data-screen-label="Overview">
 
     <div class="intro-grid">
       <div class="callout">
Read
overview.snippet.html
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\overview.snippet.html
<style>
  /* OmniCMS snippet root + isolation */
  #tcap-omni-overview-root,
  #tcap-omni-overview-root * {
    box-sizing: border-box !important;
  }

  #tcap-omni-overview-root {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px;
    font-family: inherit;
    color: inherit;
  }

  #tcap-omni-overview-root .wf {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  /* Neutralize USF site's owl rule `.content * + * { margin-top: 1.5em }`.
     It adds ~24px above every non-first child, which misaligns items in a
     grid/flex row (the first item looks shifted up relative to the rest)
     and stacks on top of each container's own `gap`. Zero it out on every
     spacing-bearing container's children so spacing is driven only by
     `gap`. */
  #tcap-omni-overview-root .wf>*,
  #tcap-omni-overview-root .intro-grid>*,
  #tcap-omni-overview-root .pillars-grid>*,
  #tcap-omni-overview-root .journey-grid>*,
  #tcap-omni-overview-root .pathway-grid>*,
  #tcap-omni-overview-root .pathway-card>*,
  #tcap-omni-overview-root .wf-nav>* {
    margin-top: 0;
  }

  /* Stat bar — exact copy of jobs.html's `.jobs-stat-bar` grid plus its real
     `c-calloutText`/`c-calloutText_heading`/`c-calloutText_text` component
     and `.all-sources`/`.all-sources-text` citation styling, so these cards
     render identically to the live jobs page. */
  #tcap-omni-overview-root .stat-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
    align-items: start;
  }

  #tcap-omni-overview-root .stat-bar > * {
    align-self: start;
    margin: 2px 0 0 0;
    padding: 0;
  }

  #tcap-omni-overview-root .all-sources {
    margin-top: 1rem;
    font-size: 8pt;
    line-height: 1.35;
    color: #333333;
  }

  #tcap-omni-overview-root .all-sources-text {
    margin: 0;
    padding: 0;
    font-size: 8pt;
    line-height: 1.35;
    font-weight: 400;
    color: #333333;
  }

  /* CTA band is extracted outside #tcap-omni-overview-root (same reason as
     the stylized headers) so its background can bleed edge-to-edge instead
     of being capped at the root's 900px max-width. Rules below are
     unprefixed on purpose. `.cta-band-inner` keeps the button centered at a
     normal readable width inside the full-bleed background. */
  .cta-band {
    background: #EFEFF0;
    padding: 24px;
    text-align: center;
  }

  .cta-band-inner {
    max-width: 900px;
    margin: 0 auto;
  }

  /* `!important` on display/max-width: the real site's global CSS has
     `a.snippetButton { display: block; max-width: 200px; }`. `display: block`
     ignores the ancestor's `text-align: center`, which is what left-aligns
     the button once this rule loses the specificity fight. */
  .cta-band .snippetButton {
    display: inline-block !important;
    max-width: none !important;
    background: #006747;
    color: #fff;
    border: 2px solid #006747;
    border-radius: 0;
    font-family: inherit;
    font-size: 16px;
    font-weight: 700;
    padding: 0.85em 1.6em;
    line-height: 1.2;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
  }

  .cta-band .snippetButton:hover,
  .cta-band .snippetButton:focus {
    background: #004c35;
    border-color: #004c35;
    color: #fff;
  }

  /* Intro cards — c-calloutText */
  #tcap-omni-overview-root .intro-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  #tcap-omni-overview-root .callout {
    background: #efeff0;
    border: 1px solid #b2b2b2;
    padding: 24px;
  }

  #tcap-omni-overview-root .callout h3 {
    margin: 0 0 8px;
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 600;
    font-size: 28px;
    line-height: 1.2;
    color: #006747;
  }

  #tcap-omni-overview-root .callout p {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: #3f3f3f;
  }

  /* The small skewed label above each h2 uses the real USF site's own
     `.stylized-header-container--centered` / `.stylized-header` classes
     directly (see tmp-usf-v3-secondary.css) instead of a local reimplementation
     — those classes are already loaded globally on every USF page, so no
     CSS is needed here at all. */
  #tcap-omni-overview-root .section-header {
    text-align: center;
  }

  #tcap-omni-overview-root .section-header h2 {
    margin: 10px 0 8px;
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 600;
    font-size: 36px;
    color: #3f565e;
    text-transform: uppercase;
    line-height: 1.15;
  }

  #tcap-omni-overview-root .section-header p {
    margin: 0 auto;
    max-width: 640px;
    font-size: 15px;
    line-height: 1.4;
    color: #3f3f3f;
  }

  /* Pillars — c-calloutText cards */
  #tcap-omni-overview-root .pillars-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }

  #tcap-omni-overview-root .pillar-card {
    background: #efeff0;
    border: 1px solid #b2b2b2;
    padding: 24px;
    text-align: center;
    text-decoration: none;
  }

  #tcap-omni-overview-root .pillar-card .pillar-title {
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 700;
    font-size: 22px;
    color: #006747;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin: 0 0 10px;
  }

  #tcap-omni-overview-root .pillar-card p {
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
    color: #3f3f3f;
  }

  /* Student journey — 4-up green strip */
  #tcap-omni-overview-root .journey-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1px;
    background: #006747;
  }

  #tcap-omni-overview-root .journey-step {
    background: #006747;
    color: #fff;
    padding: 20px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    text-align: center;
    text-decoration: none;
  }

  #tcap-omni-overview-root .journey-step .journey-num {
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 700;
    font-size: 22px;
  }

  #tcap-omni-overview-root .journey-step .journey-title {
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 600;
    font-size: 15px;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    margin: 0;
  }

  /* Experiential learning teaser + pathway grid */
  #tcap-omni-overview-root .pathway-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  #tcap-omni-overview-root .pathway-card {
    background: #efeff0;
    border: 1px solid #b2b2b2;
    padding: 18px;
    text-align: center;
    text-decoration: none;
  }

  #tcap-omni-overview-root .pathway-badge {
    width: 44px;
    height: 44px;
    margin: 0 auto 10px;
    border-radius: 50%;
    background: #006747;
    color: #fff;
    display: grid;
    place-items: center;
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 700;
    font-size: 15px;
  }

  #tcap-omni-overview-root .pathway-label {
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 600;
    font-size: 15px;
    color: #006747;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  /* Bottom nav */
  #tcap-omni-overview-root .wf-nav {
    display: flex;
    gap: 8px;
    font-size: 13px;
    text-align: center;
    border-top: 1px solid #d8d6cd;
    padding-top: 20px;
  }

  #tcap-omni-overview-root .wf-nav a,
  #tcap-omni-overview-root .wf-nav div {
    flex: 1;
    display: block;
    background: #fff;
    color: #006747;
    border: 1.5px solid #006747;
    border-radius: 3px;
    padding: 10px 12px;
    text-decoration: none;
  }

  #tcap-omni-overview-root .wf-nav .is-active {
    background: #006747;
    color: #fff;
  }

  @media (max-width: 700px) {

    #tcap-omni-overview-root .stat-bar {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    #tcap-omni-overview-root .intro-grid,
    #tcap-omni-overview-root .pillars-grid {
      grid-template-columns: 1fr;
    }

    #tcap-omni-overview-root .journey-grid,
    #tcap-omni-overview-root .pathway-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    #tcap-omni-overview-root .wf-nav {
      flex-wrap: wrap;
    }

    #tcap-omni-overview-root .wf-nav a,
    #tcap-omni-overview-root .wf-nav div {
      flex: 1 1 45%;
    }
  }
</style>

<div id="tcap-omni-overview-root">
  <div class="wf" data-screen-label="Overview">

    <div class="stat-bar">
      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
        <h3 class="c-calloutText_heading">+17.9%</h3>
        <div class="c-calloutText_text">Software developer growth 2023&ndash;2033
          <section class="all-sources" aria-labelledby="stat-sources-heading">
            <p class="all-sources-text">Software developer growth 2023&ndash;2033: <span>BLS / MLR 2025.</span></p>
          </section>
        </div>
      </div>
      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
        <h3 class="c-calloutText_heading">546K</h3>
        <div class="c-calloutText_text">Tech workers in Florida (No. 4 nationally)
          <section class="all-sources" aria-labelledby="stat-sources-heading">
            <p class="all-sources-text">Florida tech workforce count: <span>CompTIA 2025.</span></p>
          </section>
        </div>
      </div>
      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
        <h3 class="c-calloutText_heading">$102,908</h3>
        <div class="c-calloutText_text">Florida tech wage &mdash; 122% above state median
          <section class="all-sources" aria-labelledby="stat-sources-heading">
            <p class="all-sources-text">Median Florida tech wage: <span>CompTIA / Lightcast 2024.</span></p>
          </section>
        </div>
      </div>
      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
        <h3 class="c-calloutText_heading">12,735</h3>
        <div class="c-calloutText_text">Active Florida job postings requiring AI skills
          <section class="all-sources" aria-labelledby="stat-sources-heading">
            <p class="all-sources-text">Florida AI-skill job postings: <span>CompTIA 2024.</span></p>
          </section>
        </div>
      </div>
    </div>

  </div>
</div>

<div class="cta-band">
  <div class="cta-band-inner">
    <a class="snippetButton" href="#">Talk to an advisor</a>
  </div>
</div>

<div id="tcap-omni-overview-root">
  <div class="wf" data-screen-label="Overview">

    <div class="intro-grid">
      <div class="callout">
        <h3>What is tCAP?</h3>
        <p>tCAP is a structured, multiyear career development program designed exclusively for Bellini College students.
          Instead of waiting until their final year to focus on internships and career preparation, tCAP helps students
          steadily build experience, skills and professional connections throughout their academic journey.</p>
      </div>
      <div class="callout">
        <h3>Why tCAP matters</h3>
        <p>Employers increasingly seek graduates who can communicate effectively, collaborate on teams, solve applied
          problems and contribute immediately in professional environments. tCAP combines career readiness, experiential
          learning and employer engagement to help develop those capabilities before graduation.</p>
      </div>
    </div>

  </div>
</div>

<div class="stylized-header-container--centered">
  <h2 class="stylized-header"><span>The tCAP Model</span></h2>
</div>

<div id="tcap-omni-overview-root">
  <div class="wf" data-screen-label="The tCAP Model">

    <div class="section-header">
      <h2>Three Pillars. Endless Possibilities.</h2>
      <p>The tCAP experience is built on three pillars that work together to develop your career readiness, applied
        skills and professional network.</p>
    </div>

    <div class="pillars-grid">
      <a class="pillar-card" href="stages.html">
        <p class="pillar-title">Readiness</p>
        <p>Build the foundation with self-awareness, goal setting and essential professional skills to launch your
          career with confidence.</p>
      </a>
      <a class="pillar-card" href="experiential-learning.html">
        <p class="pillar-title">Experience</p>
        <p>Learn by doing. Apply what you know through projects, internships, externships, research and
          performance-based learning.</p>
      </a>
      <a class="pillar-card" href="https://testsite.usf.edu/ai-cybersecurity-computing/industry/jobs-page.aspx"
        target="_blank" rel="noopener noreferrer">
        <p class="pillar-title">Connection</p>
        <p>Grow your network and collaborate with peers, mentors and employers who open doors to opportunities and
          long-term success.</p>
      </a>
    </div>

  </div>
</div>

<div class="stylized-header-container--centered">
  <h2 class="stylized-header"><span>Student Journey</span></h2>
</div>

<div id="tcap-omni-overview-root">
  <div class="wf" data-screen-label="Student Journey">

    <div class="section-header">
      <h2>A Four-Stage Path to Career Readiness</h2>
      <p>Each stage builds on the last, so students keep developing career readiness, technical confidence and
        professional experience all the way to graduation.</p>
    </div>

    <div class="journey-grid">
      <a class="journey-step" href="stages.html#foundations">
        <span class="journey-num">01</span>
        <span class="journey-title">Targeting<br>Fundamentals</span>
      </a>
      <a class="journey-step" href="stages.html#power-skills">
        <span class="journey-num">02</span>
        <span class="journey-title">Core<br>Application</span>
      </a>
      <a class="journey-step" href="stages.html#connectivity">
        <span class="journey-num">03</span>
        <span class="journey-title">Advanced<br>Practice</span>
      </a>
      <a class="journey-step" href="stages.html#mastery">
        <span class="journey-num">04</span>
        <span class="journey-title">Professional<br>Mastery</span>
      </a>
    </div>
  </div>
</div>

<div class="stylized-header-container--centered">
  <h2 class="stylized-header"><span>Experiential Learning</span></h2>
</div>


<div id="tcap-omni-overview-root">
  <div class="wf" data-screen-label="Experiential Learning">
    <div class="section-header">
      <h2>Learn by Doing, on Real Deliverables</h2>
      <p>Every tCAP student completes applied experiential learning through internships, research, capstones,
        hackathons, entrepreneurship or other approved opportunities.</p>
    </div>

    <div class="pathway-grid">
      <a class="pathway-card" href="experiential-learning.html">
        <span class="pathway-badge">IN</span>
        <div class="pathway-label">Internships</div>
      </a>
      <a class="pathway-card" href="experiential-learning.html">
        <span class="pathway-badge">UR</span>
        <div class="pathway-label">Undergrad Research</div>
      </a>
      <a class="pathway-card" href="experiential-learning.html">
        <span class="pathway-badge">CP</span>
        <div class="pathway-label">Capstone Projects</div>
      </a>
      <a class="pathway-card" href="experiential-learning.html">
        <span class="pathway-badge">CS</span>
        <div class="pathway-label">Cyber Support</div>
      </a>
      <a class="pathway-card" href="experiential-learning.html">
        <span class="pathway-badge">EN</span>
        <div class="pathway-label">Entrepreneurship</div>
      </a>
      <a class="pathway-card" href="experiential-learning.html">
        <span class="pathway-badge">CO</span>
        <div class="pathway-label">Competitions</div>
      </a>
      <a class="pathway-card" href="experiential-learning.html">
        <span class="pathway-badge">HA</span>
        <div class="pathway-label">Hackathons</div>
      </a>
      <a class="pathway-card" href="experiential-learning.html">
        <span class="pathway-badge">SA</span>
        <div class="pathway-label">Study Abroad</div>
      </a>
    </div>

    <div class="wf-nav">
      <div class="is-active">Overview</div>
      <a
        href="https://testsite.usf.edu/ai-cybersecurity-computing/tech-career-accelerator-program/stages.aspx">Layers</a>
      <a
        href="https://testsite.usf.edu/ai-cybersecurity-computing/tech-career-accelerator-program/experiential-learning.aspx">Exp.
        Learning</a>
      <a href="https://testsite.usf.edu/ai-cybersecurity-computing/tech-career-accelerator-program/faq.aspx">FAQ</a>
      <a href="https://testsite.usf.edu/ai-cybersecurity-computing/industry/jobs-page.aspx" target="_blank"
        rel="noopener noreferrer">Jobs Page</a>
    </div>

  </div>
</div>
Showed diff for remaining snippet files
git diff tcap/omnicms-snippets/faq.snippet.html tcap/omnicms-snippets/stages.snippet.html tcap/omnicms-snippets/experiential-learning.snippet.html
warning: in the working copy of 'tcap/omnicms-snippets/experiential-learning.snippet.html', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tcap/omnicms-snippets/faq.snippet.html', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tcap/omnicms-snippets/stages.snippet.html', LF will be replaced by CRLF the next time Git touches it
diff --git a/tcap/omnicms-snippets/experiential-learning.snippet.html b/tcap/omnicms-snippets/experiential-learning.snippet.html
index fde036e..0e81191 100644
--- a/tcap/omnicms-snippets/experiential-learning.snippet.html
+++ b/tcap/omnicms-snippets/experiential-learning.snippet.html
@@ -25,7 +25,6 @@
      spacing-bearing container's children so spacing is driven only by
      `gap`. */
   #tcap-omni-expl-root .wf > *,
-  #tcap-omni-expl-root .stat-bar > *,
   #tcap-omni-expl-root .timeline-grid > *,
   #tcap-omni-expl-root .pathway-grid > *,
   #tcap-omni-expl-root .pathway-card > *,
@@ -33,45 +32,58 @@
     margin-top: 0;
   }
 
+  /* Stat bar — exact copy of jobs.html's `.jobs-stat-bar` grid plus its real
+     `c-calloutText`/`c-calloutText_heading`/`c-calloutText_text` component
+     and `.all-sources`/`.all-sources-text` citation styling, so these cards
+     render identically to the live jobs page. */
   #tcap-omni-expl-root .stat-bar {
     display: grid;
-    grid-template-columns: repeat(4, minmax(0, 1fr));
-    gap: 16px;
-  }
-  #tcap-omni-expl-root .stat-box {
-    background: #efeff0;
-    border: 1px solid #b2b2b2;
-    padding: 24px;
-    min-height: 175px;
+    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
+    gap: 2rem;
+    margin: 2rem 0;
+    align-items: start;
+  }
+  #tcap-omni-expl-root .stat-bar > * {
+    align-self: start;
+    margin: 2px 0 0 0;
+    padding: 0;
+  }
+  #tcap-omni-expl-root .all-sources {
+    margin-top: 1rem;
+    font-size: 8pt;
+    line-height: 1.35;
+    color: #333333;
   }
-  #tcap-omni-expl-root .stat-num {
-    font-family: "Barlow Condensed", sans-serif;
-    font-weight: 700;
-    font-size: 32px;
-    color: #006747;
-    line-height: 1.1;
+  #tcap-omni-expl-root .all-sources-text {
     margin: 0;
-  }
-  #tcap-omni-expl-root .stat-desc {
-    font-size: 13px;
-    line-height: 1.4;
-    color: #466069;
-    margin: 10px 0 0;
-  }
-  #tcap-omni-expl-root .stat-source {
-    font-size: 11px;
+    padding: 0;
+    font-size: 8pt;
     line-height: 1.35;
-    color: #6b6b6b;
-    margin: 12px 0 0;
+    font-weight: 400;
+    color: #333333;
   }
 
-  #tcap-omni-expl-root .cta-band {
+  /* CTA band is extracted outside #tcap-omni-expl-root (same reason as
+     the stylized headers) so its background can bleed edge-to-edge instead
+     of being capped at the root's 900px max-width. Rules below are
+     unprefixed on purpose. `.cta-band-inner` keeps the button centered at a
+     normal readable width inside the full-bleed background. */
+  .cta-band {
     background: #EFEFF0;
     padding: 24px;
     text-align: center;
   }
-  #tcap-omni-expl-root .snippetButton {
-    display: inline-block;
+  .cta-band-inner {
+    max-width: 900px;
+    margin: 0 auto;
+  }
+  /* `!important` on display/max-width: the real site's global CSS has
+     `a.snippetButton { display: block; max-width: 200px; }`. `display: block`
+     ignores the ancestor's `text-align: center`, which is what left-aligns
+     the button once this rule loses the specificity fight. */
+  .cta-band .snippetButton {
+    display: inline-block !important;
+    max-width: none !important;
     background: #006747;
     color: #fff;
     border: 2px solid #006747;
@@ -84,8 +96,8 @@
     text-decoration: none;
     cursor: pointer;
   }
-  #tcap-omni-expl-root .snippetButton:hover,
-  #tcap-omni-expl-root .snippetButton:focus {
+  .cta-band .snippetButton:hover,
+  .cta-band .snippetButton:focus {
     background: #004c35;
     border-color: #004c35;
   }
@@ -272,7 +284,10 @@
   }
 
   @media (max-width: 700px) {
-    #tcap-omni-expl-root .stat-bar,
+    #tcap-omni-expl-root .stat-bar {
+      grid-template-columns: 1fr;
+      gap: 1rem;
+    }
     #tcap-omni-expl-root .timeline-grid {
       grid-template-columns: 1fr;
     }
@@ -303,32 +318,46 @@
   <div class="wf" data-screen-label="Experiential Learning">
 
     <div class="stat-bar">
-      <div class="stat-box">
-        <p class="stat-num">+17.9%</p>
-        <p class="stat-desc">Software developer growth 2023&ndash;2033</p>
-        <p class="stat-source">Software developer growth 2023&ndash;2033: <span>BLS / MLR 2025.</span></p>
+      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
+        <h3 class="c-calloutText_heading">+17.9%</h3>
+        <div class="c-calloutText_text">Software developer growth 2023&ndash;2033
+          <section class="all-sources" aria-labelledby="stat-sources-heading">
+            <p class="all-sources-text">Software developer growth 2023&ndash;2033: <span>BLS / MLR 2025.</span></p>
+          </section>
+        </div>
       </div>
-      <div class="stat-box">
-        <p class="stat-num">546K</p>
-        <p class="stat-desc">Tech workers in Florida (No. 4 nationally)</p>
-        <p class="stat-source">Florida tech workforce count: <span>CompTIA 2025.</span></p>
+      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
+        <h3 class="c-calloutText_heading">546K</h3>
+        <div class="c-calloutText_text">Tech workers in Florida (No. 4 nationally)
+          <section class="all-sources" aria-labelledby="stat-sources-heading">
+            <p class="all-sources-text">Florida tech workforce count: <span>CompTIA 2025.</span></p>
+          </section>
+        </div>
       </div>
-      <div class="stat-box">
-        <p class="stat-num">$102,908</p>
-        <p class="stat-desc">Florida tech wage &mdash; 122% above state median</p>
-        <p class="stat-source">Median Florida tech wage: <span>CompTIA / Lightcast 2024.</span></p>
+      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
+        <h3 class="c-calloutText_heading">$102,908</h3>
+        <div class="c-calloutText_text">Florida tech wage &mdash; 122% above state median
+          <section class="all-sources" aria-labelledby="stat-sources-heading">
+            <p class="all-sources-text">Median Florida tech wage: <span>CompTIA / Lightcast 2024.</span></p>
+          </section>
+        </div>
       </div>
-      <div class="stat-box">
-        <p class="stat-num">12,735</p>
-        <p class="stat-desc">Active Florida job postings requiring AI skills</p>
-        <p class="stat-source">Florida AI-skill job postings: <span>CompTIA 2024.</span></p>
+      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
+        <h3 class="c-calloutText_heading">12,735</h3>
+        <div class="c-calloutText_text">Active Florida job postings requiring AI skills
+          <section class="all-sources" aria-labelledby="stat-sources-heading">
+            <p class="all-sources-text">Florida AI-skill job postings: <span>CompTIA 2024.</span></p>
+          </section>
+        </div>
       </div>
     </div>
 
-    <div class="cta-band">
-      <a class="snippetButton" href="#">Talk to an advisor</a>
-    </div>
+  </div>
+</div>
 
+<div class="cta-band">
+  <div class="cta-band-inner">
+    <a class="snippetButton" href="#">Talk to an advisor</a>
   </div>
 </div>
 
diff --git a/tcap/omnicms-snippets/faq.snippet.html b/tcap/omnicms-snippets/faq.snippet.html
index d719d5c..19be712 100644
--- a/tcap/omnicms-snippets/faq.snippet.html
+++ b/tcap/omnicms-snippets/faq.snippet.html
@@ -25,51 +25,63 @@
      spacing-bearing container's children so spacing is driven only by
      `gap`. */
   #tcap-omni-faq-root .wf > *,
-  #tcap-omni-faq-root .stat-bar > *,
   #tcap-omni-faq-root .faq-list > *,
   #tcap-omni-faq-root .wf-nav > * {
     margin-top: 0;
   }
 
+  /* Stat bar — exact copy of jobs.html's `.jobs-stat-bar` grid plus its real
+     `c-calloutText`/`c-calloutText_heading`/`c-calloutText_text` component
+     and `.all-sources`/`.all-sources-text` citation styling, so these cards
+     render identically to the live jobs page. */
   #tcap-omni-faq-root .stat-bar {
     display: grid;
-    grid-template-columns: repeat(4, minmax(0, 1fr));
-    gap: 16px;
+    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
+    gap: 2rem;
+    margin: 2rem 0;
+    align-items: start;
   }
-  #tcap-omni-faq-root .stat-box {
-    background: #efeff0;
-    border: 1px solid #b2b2b2;
-    padding: 24px;
-    min-height: 175px;
+  #tcap-omni-faq-root .stat-bar > * {
+    align-self: start;
+    margin: 2px 0 0 0;
+    padding: 0;
   }
-  #tcap-omni-faq-root .stat-num {
-    font-family: "Barlow Condensed", sans-serif;
-    font-weight: 700;
-    font-size: 32px;
-    color: #006747;
-    line-height: 1.1;
-    margin: 0;
-  }
-  #tcap-omni-faq-root .stat-desc {
-    font-size: 13px;
-    line-height: 1.4;
-    color: #466069;
-    margin: 10px 0 0;
+  #tcap-omni-faq-root .all-sources {
+    margin-top: 1rem;
+    font-size: 8pt;
+    line-height: 1.35;
+    color: #333333;
   }
-  #tcap-omni-faq-root .stat-source {
-    font-size: 11px;
+  #tcap-omni-faq-root .all-sources-text {
+    margin: 0;
+    padding: 0;
+    font-size: 8pt;
     line-height: 1.35;
-    color: #6b6b6b;
-    margin: 12px 0 0;
+    font-weight: 400;
+    color: #333333;
   }
 
-  #tcap-omni-faq-root .cta-band {
+  /* CTA band is extracted outside #tcap-omni-faq-root (same reason as
+     the stylized headers) so its background can bleed edge-to-edge instead
+     of being capped at the root's 900px max-width. Rules below are
+     unprefixed on purpose. `.cta-band-inner` keeps the button centered at a
+     normal readable width inside the full-bleed background. */
+  .cta-band {
     background: #EFEFF0;
     padding: 24px;
     text-align: center;
   }
-  #tcap-omni-faq-root .snippetButton {
-    display: inline-block;
+  .cta-band-inner {
+    max-width: 900px;
+    margin: 0 auto;
+  }
+  /* `!important` on display/max-width: the real site's global CSS has
+     `a.snippetButton { display: block; max-width: 200px; }`. `display: block`
+     ignores the ancestor's `text-align: center`, which is what left-aligns
+     the button once this rule loses the specificity fight. */
+  .cta-band .snippetButton {
+    display: inline-block !important;
+    max-width: none !important;
     background: #006747;
     color: #fff;
     border: 2px solid #006747;
@@ -82,8 +94,8 @@
     text-decoration: none;
     cursor: pointer;
   }
-  #tcap-omni-faq-root .snippetButton:hover,
-  #tcap-omni-faq-root .snippetButton:focus {
+  .cta-band .snippetButton:hover,
+  .cta-band .snippetButton:focus {
     background: #004c35;
     border-color: #004c35;
   }
@@ -177,6 +189,7 @@
   @media (max-width: 700px) {
     #tcap-omni-faq-root .stat-bar {
       grid-template-columns: 1fr;
+      gap: 1rem;
     }
     #tcap-omni-faq-root .wf-nav {
       flex-wrap: wrap;
@@ -192,32 +205,46 @@
   <div class="wf" data-screen-label="FAQ">
 
     <div class="stat-bar">
-      <div class="stat-box">
-        <p class="stat-num">+17.9%</p>
-        <p class="stat-desc">Software developer growth 2023&ndash;2033</p>
-        <p class="stat-source">Software developer growth 2023&ndash;2033: <span>BLS / MLR 2025.</span></p>
+      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
+        <h3 class="c-calloutText_heading">+17.9%</h3>
+        <div class="c-calloutText_text">Software developer growth 2023&ndash;2033
+          <section class="all-sources" aria-labelledby="stat-sources-heading">
+            <p class="all-sources-text">Software developer growth 2023&ndash;2033: <span>BLS / MLR 2025.</span></p>
+          </section>
+        </div>
       </div>
-      <div class="stat-box">
-        <p class="stat-num">546K</p>
-        <p class="stat-desc">Tech workers in Florida (No. 4 nationally)</p>
-        <p class="stat-source">Florida tech workforce count: <span>CompTIA 2025.</span></p>
+      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
+        <h3 class="c-calloutText_heading">546K</h3>
+        <div class="c-calloutText_text">Tech workers in Florida (No. 4 nationally)
+          <section class="all-sources" aria-labelledby="stat-sources-heading">
+            <p class="all-sources-text">Florida tech workforce count: <span>CompTIA 2025.</span></p>
+          </section>
+        </div>
       </div>
-      <div class="stat-box">
-        <p class="stat-num">$102,908</p>
-        <p class="stat-desc">Florida tech wage &mdash; 122% above state median</p>
-        <p class="stat-source">Median Florida tech wage: <span>CompTIA / Lightcast 2024.</span></p>
+      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
+        <h3 class="c-calloutText_heading">$102,908</h3>
+        <div class="c-calloutText_text">Florida tech wage &mdash; 122% above state median
+          <section class="all-sources" aria-labelledby="stat-sources-heading">
+            <p class="all-sources-text">Median Florida tech wage: <span>CompTIA / Lightcast 2024.</span></p>
+          </section>
+        </div>
       </div>
-      <div class="stat-box">
-        <p class="stat-num">12,735</p>
-        <p class="stat-desc">Active Florida job postings requiring AI skills</p>
-        <p class="stat-source">Florida AI-skill job postings: <span>CompTIA 2024.</span></p>
+      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
+        <h3 class="c-calloutText_heading">12,735</h3>
+        <div class="c-calloutText_text">Active Florida job postings requiring AI skills
+          <section class="all-sources" aria-labelledby="stat-sources-heading">
+            <p class="all-sources-text">Florida AI-skill job postings: <span>CompTIA 2024.</span></p>
+          </section>
+        </div>
       </div>
     </div>
 
-    <div class="cta-band">
-      <a class="snippetButton" href="#">Talk to an advisor</a>
-    </div>
+  </div>
+</div>
 
+<div class="cta-band">
+  <div class="cta-band-inner">
+    <a class="snippetButton" href="#">Talk to an advisor</a>
   </div>
 </div>
 
diff --git a/tcap/omnicms-snippets/stages.snippet.html b/tcap/omnicms-snippets/stages.snippet.html
index f4717aa..c6f0fae 100644
--- a/tcap/omnicms-snippets/stages.snippet.html
+++ b/tcap/omnicms-snippets/stages.snippet.html
@@ -25,52 +25,64 @@
      spacing-bearing container's children so spacing is driven only by
      `gap`. */
   #tcap-omni-stages-root .wf > *,
-  #tcap-omni-stages-root .stat-bar > *,
   #tcap-omni-stages-root .stage-list > *,
   #tcap-omni-stages-root .stage-card > *,
   #tcap-omni-stages-root .wf-nav > * {
     margin-top: 0;
   }
 
+  /* Stat bar — exact copy of jobs.html's `.jobs-stat-bar` grid plus its real
+     `c-calloutText`/`c-calloutText_heading`/`c-calloutText_text` component
+     and `.all-sources`/`.all-sources-text` citation styling, so these cards
+     render identically to the live jobs page. */
   #tcap-omni-stages-root .stat-bar {
     display: grid;
-    grid-template-columns: repeat(4, minmax(0, 1fr));
-    gap: 16px;
-  }
-  #tcap-omni-stages-root .stat-box {
-    background: #efeff0;
-    border: 1px solid #b2b2b2;
-    padding: 24px;
-    min-height: 175px;
+    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
+    gap: 2rem;
+    margin: 2rem 0;
+    align-items: start;
   }
-  #tcap-omni-stages-root .stat-num {
-    font-family: "Barlow Condensed", sans-serif;
-    font-weight: 700;
-    font-size: 32px;
-    color: #006747;
-    line-height: 1.1;
-    margin: 0;
+  #tcap-omni-stages-root .stat-bar > * {
+    align-self: start;
+    margin: 2px 0 0 0;
+    padding: 0;
   }
-  #tcap-omni-stages-root .stat-desc {
-    font-size: 13px;
-    line-height: 1.4;
-    color: #466069;
-    margin: 10px 0 0;
+  #tcap-omni-stages-root .all-sources {
+    margin-top: 1rem;
+    font-size: 8pt;
+    line-height: 1.35;
+    color: #333333;
   }
-  #tcap-omni-stages-root .stat-source {
-    font-size: 11px;
+  #tcap-omni-stages-root .all-sources-text {
+    margin: 0;
+    padding: 0;
+    font-size: 8pt;
     line-height: 1.35;
-    color: #6b6b6b;
-    margin: 12px 0 0;
+    font-weight: 400;
+    color: #333333;
   }
 
-  #tcap-omni-stages-root .cta-band {
+  /* CTA band is extracted outside #tcap-omni-stages-root (same reason as
+     the stylized headers) so its background can bleed edge-to-edge instead
+     of being capped at the root's 900px max-width. Rules below are
+     unprefixed on purpose. `.cta-band-inner` keeps the button centered at a
+     normal readable width inside the full-bleed background. */
+  .cta-band {
     background: #EFEFF0;
     padding: 24px;
     text-align: center;
   }
-  #tcap-omni-stages-root .snippetButton {
-    display: inline-block;
+  .cta-band-inner {
+    max-width: 900px;
+    margin: 0 auto;
+  }
+  /* `!important` on display/max-width: the real site's global CSS has
+     `a.snippetButton { display: block; max-width: 200px; }`. `display: block`
+     ignores the ancestor's `text-align: center`, which is what left-aligns
+     the button once this rule loses the specificity fight. */
+  .cta-band .snippetButton {
+    display: inline-block !important;
+    max-width: none !important;
     background: #006747;
     color: #fff;
     border: 2px solid #006747;
@@ -83,8 +95,8 @@
     text-decoration: none;
     cursor: pointer;
   }
-  #tcap-omni-stages-root .snippetButton:hover,
-  #tcap-omni-stages-root .snippetButton:focus {
+  .cta-band .snippetButton:hover,
+  .cta-band .snippetButton:focus {
     background: #004c35;
     border-color: #004c35;
   }
@@ -188,6 +200,7 @@
   @media (max-width: 700px) {
     #tcap-omni-stages-root .stat-bar {
       grid-template-columns: 1fr;
+      gap: 1rem;
     }
     #tcap-omni-stages-root .wf-nav {
       flex-wrap: wrap;
@@ -203,32 +216,46 @@
   <div class="wf" data-screen-label="Layers">
 
     <div class="stat-bar">
-      <div class="stat-box">
-        <p class="stat-num">+17.9%</p>
-        <p class="stat-desc">Software developer growth 2023&ndash;2033</p>
-        <p class="stat-source">Software developer growth 2023&ndash;2033: <span>BLS / MLR 2025.</span></p>
+      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
+        <h3 class="c-calloutText_heading">+17.9%</h3>
+        <div class="c-calloutText_text">Software developer growth 2023&ndash;2033
+          <section class="all-sources" aria-labelledby="stat-sources-heading">
+            <p class="all-sources-text">Software developer growth 2023&ndash;2033: <span>BLS / MLR 2025.</span></p>
+          </section>
+        </div>
       </div>
-      <div class="stat-box">
-        <p class="stat-num">546K</p>
-        <p class="stat-desc">Tech workers in Florida (No. 4 nationally)</p>
-        <p class="stat-source">Florida tech workforce count: <span>CompTIA 2025.</span></p>
+      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
+        <h3 class="c-calloutText_heading">546K</h3>
+        <div class="c-calloutText_text">Tech workers in Florida (No. 4 nationally)
+          <section class="all-sources" aria-labelledby="stat-sources-heading">
+            <p class="all-sources-text">Florida tech workforce count: <span>CompTIA 2025.</span></p>
+          </section>
+        </div>
       </div>
-      <div class="stat-box">
-        <p class="stat-num">$102,908</p>
-        <p class="stat-desc">Florida tech wage &mdash; 122% above state median</p>
-        <p class="stat-source">Median Florida tech wage: <span>CompTIA / Lightcast 2024.</span></p>
+      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
+        <h3 class="c-calloutText_heading">$102,908</h3>
+        <div class="c-calloutText_text">Florida tech wage &mdash; 122% above state median
+          <section class="all-sources" aria-labelledby="stat-sources-heading">
+            <p class="all-sources-text">Median Florida tech wage: <span>CompTIA / Lightcast 2024.</span></p>
+          </section>
+        </div>
       </div>
-      <div class="stat-box">
-        <p class="stat-num">12,735</p>
-        <p class="stat-desc">Active Florida job postings requiring AI skills</p>
-        <p class="stat-source">Florida AI-skill job postings: <span>CompTIA 2024.</span></p>
+      <div class="c-calloutText c-calloutText--gray" style="height: 175px !important;">
+        <h3 class="c-calloutText_heading">12,735</h3>
+        <div class="c-calloutText_text">Active Florida job postings requiring AI skills
+          <section class="all-sources" aria-labelledby="stat-sources-heading">
+            <p class="all-sources-text">Florida AI-skill job postings: <span>CompTIA 2024.</span></p>
+          </section>
+        </div>
       </div>
     </div>
 
-    <div class="cta-band">
-      <a class="snippetButton" href="#">Talk to an advisor</a>
-    </div>
+  </div>
+</div>
 
+<div class="cta-band">
+  <div class="cta-band-inner">
+    <a class="snippetButton" href="#">Talk to an advisor</a>
   </div>
 </div>
All four snippet files were already updated consistently to use the same .c-calloutText/c-calloutText--gray markup and .jobs-stat-bar-style grid CSS as jobs.html. This looks like a prior session's work-in-progress. What specific problems are you running into — is it a visual/layout issue when previewing on the live site, missing styling (cards not looking gray/boxed), broken spacing, or something else?

What's actually going wrong with the stat-bar right now?

Something else, Layout/spacing broken

Asked
Details
questions: [{"question":"Can you describe what's visually wrong with the layout/spacing, and what the 'something else' issue is?","header":"Details","multiSelect":false,"options":[{"label":"I'll type it out","description":"Let me describe the specific symptoms in my own words."}]}]
InputValidationError: [
  {
    "origin": "array",
    "code": "too_small",
    "minimum": 2,
    "inclusive": true,
    "path": [
      "questions",
      0,
      "options"
    ],
    "message": "Too small: expected array to have >=2 items"
  }
]
I'll just ask directly instead — could you describe what's visually wrong (spacing/layout) and what the other "something else" issue is? Screenshots or specifics on which page(s) would help too.

the cards aren't using the right margins in the first picture, the second picture is from the jobs page [the correct version]


Searched code
Searched
\.c-calloutText\b|\.c-calloutText_heading|\.c-calloutText_text|\.c-calloutText--gray
pattern: \.c-calloutText\b|\.c-calloutText_heading|\.c-calloutText_text|\.c-calloutText--gray
path: reference
output_mode: files_with_matches
Found 2 files
reference\usf-cms\tmp-usf-v3-secondary.css
reference\usf-cms\tmp-usf-legacy-secondary.css
Searched
\.c-calloutText
pattern: \.c-calloutText
path: reference\usf-cms\tmp-usf-v3-secondary.css
output_mode: content
-n: true
-A: 8
813:.c-calloutText {
814-	background-color: #efeff0;
815-	border: 1px solid #b2b2b2;
816-	padding: 1.5em;
817-}	
818:.c-calloutText--green {
819-	background-color: #d9e8e4;
820-	border-color: #006747;
821-}
822:.c-calloutText--red {
823-	background-color: #f4d9da;
824-	border-color: #65040d;
825-}
826-
827:.fullContent .c-calloutText h2 {
828-	color: #006747;
829-    font-size: 1.75em;
830-    font-weight: 600;
831-    line-height: 1.25em;
832-}
833-
834:.fullContent .c-calloutText--red h2,
835:.c-calloutText--red h3,
836:.c-calloutText--red a, 
837:.c-calloutText--red a:visited { color: #65040d; }
838-
839:.c-calloutText--red h4 { color: #5e3f43; }
840-
841:.c-calloutText--red a.snippetButton, 
842:.c-calloutText--red a.snippetButton:visited,
843:.c-calloutText--red a.c-button-single,
844:.c-calloutText--red a.c-button-single:visited {
845-	background-color: #65040d;
846-	color: #fff;
847-}
848:.c-calloutText--red a.snippetButton:hover, 
849:.c-calloutText--red a.snippetButton:active, 
850:.c-calloutText--red a.snippetButton:focus,
851:.c-calloutText--red a.c-button-single:hover, 
852:.c-calloutText--red a.c-button-single:active, 
853:.c-calloutText--red a.c-button-single:focus{
854-	background-color: #5e3f43;
855-}
856-
857-
858-/*  ==========================================================================
859-Component - Social Directory
860-==========================================================================  */
861-.c-social th { padding: 0.75em 0 0 0; }
Searched
c-calloutText--gray|c-calloutText_heading|c-calloutText_text
pattern: c-calloutText--gray|c-calloutText_heading|c-calloutText_text
path: reference\usf-cms\tmp-usf-v3-secondary.css
output_mode: content
-n: true
No matches found
Searched
c-calloutText
pattern: c-calloutText
path: reference\usf-cms\tmp-usf-legacy-secondary.css
output_mode: content
-n: true
-A: 6
852:.content .c-calloutText {
853-	background-color: #efeff0;
854-	border: 1px solid #b2b2b2;
855-	padding: 1.5em;
856-}	
857:.content .c-calloutText--green {
858-	background-color: #d9e8e4;
859-	border-color: #006747;
860-}
861:.content .c-calloutText--red {
862-	background-color: #f4d9da;
863-	border-color: #65040d;
864-}
865-
866:.content .fullContent .c-calloutText h2 {
867-	color: #006747;
868-    font-size: 1.75em;
869-    font-weight: 600;
870-    line-height: 1.25em;
871-}
872-
873:.content .fullContent .c-calloutText--red h2,
874:.content .c-calloutText--red h3,
875:.content .c-calloutText--red a, 
876:.content .c-calloutText--red a:visited { color: #65040d; }
877-
878:.content .c-calloutText--red h4 { color: #5e3f43; }
879-
880:.content .c-calloutText--red a.snippetButton, 
881:.content .c-calloutText--red a.snippetButton:visited,
882:.content .c-calloutText--red a.c-button-single,
883:.content .c-calloutText--red a.c-button-single:visited {
884-	background-color: #65040d;
885-	color: #fff;
886-}
887:.content .c-calloutText--red a.snippetButton:hover, 
888:.content .c-calloutText--red a.snippetButton:active, 
889:.content .c-calloutText--red a.snippetButton:focus,
890:.content .c-calloutText--red a.c-button-single:hover, 
891:.content .c-calloutText--red a.c-button-single:active, 
892:.content .c-calloutText--red a.c-button-single:focus{
893-	background-color: #5e3f43;
894-}
895-
896-
897-/*  ==========================================================================
898-Component - Social Directory
Searched
#jobs-asset-root \{|max-width
pattern: #jobs-asset-root \{|max-width
path: tcap/omnicms-snippets/jobs.html
output_mode: content
-n: true
2:  #jobs-asset-root {
150:    max-width: none !important;
176:    max-width: 100% !important;
415:    max-width: calc(100% - 1rem);
591:  @media (max-width: 768px) {
592:    #jobs-asset-root {
736:  @media (max-width: 480px) {
737:    #jobs-asset-root {
877:  @media (max-width: 768px) {
928:<div class="jobs-form-group"><label for="prospective-degree">Select Degree Program:</label><select id="prospective-degree" style="max-width: 400px;" onchange="updateProjections()">
Found the actual bug. Comparing to jobs.html's CSS and the site's global stylesheet (tmp-usf-v3-secondary.css:813-817):

The real .c-calloutText padding (1.5em ≈ 24px) comes from the site's global CSS, scoped as .content .c-calloutText (specificity 0,2,0). jobs.html copies a rule .jobs-stat-bar > * { padding: 0; } — but as a bare class selector (specificity 0,1,0) it's weaker than the global rule, so on jobs.html that padding: 0 never actually applies — it's a no-op, and cards keep their real 24px padding.

When this got copied into the snippet files, it was rewritten with the root ID prefix to match the file's scoping convention:

#tcap-omni-overview-root .stat-bar > * {
  margin: 2px 0 0 0;
  padding: 0;   /* now (1,1,0) specificity — beats the global (0,2,0) rule */
}
That ID bump makes padding: 0 win against the global .content .c-calloutText padding, stripping the cards' real padding — which is exactly the squished-margins look in your first screenshot. Let me fix all four snippet files by dropping that padding: 0.

Searched
-root \.stat-bar > \*
pattern: -root \.stat-bar > \*
path: tcap/omnicms-snippets
output_mode: content
-n: true
-A: 4
tcap\omnicms-snippets\stages.snippet.html:45:  #tcap-omni-stages-root .stat-bar > * {
tcap\omnicms-snippets\stages.snippet.html-46-    align-self: start;
tcap\omnicms-snippets\stages.snippet.html-47-    margin: 2px 0 0 0;
tcap\omnicms-snippets\stages.snippet.html-48-    padding: 0;
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\stages.snippet.html-49-  }
--
tcap\omnicms-snippets\faq.snippet.html:44:  #tcap-omni-faq-root .stat-bar > * {
tcap\omnicms-snippets\faq.snippet.html-45-    align-self: start;
tcap\omnicms-snippets\faq.snippet.html-46-    margin: 2px 0 0 0;
tcap\omnicms-snippets\faq.snippet.html-47-    padding: 0;
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\faq.snippet.html-48-  }
--
tcap\omnicms-snippets\overview.snippet.html:50:  #tcap-omni-overview-root .stat-bar > * {
tcap\omnicms-snippets\overview.snippet.html-51-    align-self: start;
tcap\omnicms-snippets\overview.snippet.html-52-    margin: 2px 0 0 0;
tcap\omnicms-snippets\overview.snippet.html-53-    padding: 0;
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\overview.snippet.html-54-  }
--
tcap\omnicms-snippets\experiential-learning.snippet.html:46:  #tcap-omni-expl-root .stat-bar > * {
tcap\omnicms-snippets\experiential-learning.snippet.html-47-    align-self: start;
tcap\omnicms-snippets\experiential-learning.snippet.html-48-    margin: 2px 0 0 0;
tcap\omnicms-snippets\experiential-learning.snippet.html-49-    padding: 0;
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\experiential-learning.snippet.html-50-  }
All four files have the identical pattern. Let's fix them.


Edited a file, read 4 files
Failed to edit
stages.snippet.html
replace_all: false
file_path: C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\stages.snippet.html
old_string:   #tcap-omni-stages-root .stat-bar > * {
    align-self: start;
    margin: 2px 0 0 0;
    padding: 0;
  }
new_string:   #tcap-omni-stages-root .stat-bar > * {
    align-self: start;
    margin: 2px 0 0 0;
  }
File has not been read yet. Read it first before writing to it.
Read
stages.snippet.html
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\stages.snippet.html
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
    align-items: start;
  }
  #tcap-omni-stages-root .stat-bar > * {
    align-self: start;
    margin: 2px 0 0 0;
    padding: 0;
  }
  #tcap-omni-stages-root .all-sources {
    margin-top: 1rem;
    font-size: 8pt;
    line-height: 1.35;
    color: #333333;
Read
faq.snippet.html
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\faq.snippet.html
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
    align-items: start;
  }
  #tcap-omni-faq-root .stat-bar > * {
    align-self: start;
    margin: 2px 0 0 0;
    padding: 0;
  }
Read
overview.snippet.html
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\overview.snippet.html
    gap: 2rem;
    margin: 2rem 0;
    align-items: start;
  }

  #tcap-omni-overview-root .stat-bar > * {
    align-self: start;
    margin: 2px 0 0 0;
    padding: 0;
  }
Read
experiential-learning.snippet.html
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\experiential-learning.snippet.html
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
    align-items: start;
  }
  #tcap-omni-expl-root .stat-bar > * {
    align-self: start;
    margin: 2px 0 0 0;
    padding: 0;
  }
  #tcap-omni-expl-root .all-sources {
Now applying the fix to all four files.


Edited 4 files
Edited
stages.snippet.html
+0
-1
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\stages.snippet.html
  #tcap-omni-stages-root .stat-bar > * {
    align-self: start;
    margin: 2px 0 0 0;
    padding: 0;
  }
  #tcap-omni-stages-root .all-sources {
    margin-top: 1rem;
Edited
faq.snippet.html
+0
-1
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\faq.snippet.html
  #tcap-omni-faq-root .stat-bar > * {
    align-self: start;
    margin: 2px 0 0 0;
    padding: 0;
  }
  #tcap-omni-faq-root .all-sources {
    margin-top: 1rem;
Edited
overview.snippet.html
+0
-1
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\overview.snippet.html
  #tcap-omni-overview-root .stat-bar > * {
    align-self: start;
    margin: 2px 0 0 0;
    padding: 0;
  }

  #tcap-omni-overview-root .all-sources {
Edited
experiential-learning.snippet.html
+0
-1
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\experiential-learning.snippet.html
  #tcap-omni-expl-root .stat-bar > * {
    align-self: start;
    margin: 2px 0 0 0;
    padding: 0;
  }
  #tcap-omni-expl-root .all-sources {
    margin-top: 1rem;
Let's verify visually in the preview panel.


Ran 6 commands, read a file, used a tool
Used Claude Preview: preview list
[]
Checked for launch config and listed snippet files
cat .claude/launch.json 2>/dev/null; echo "---"; ls tcap/omnicms-snippets | head -30
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "tcap-scratch",
      "runtimeExecutable": "python",
      "runtimeArgs": ["-m", "http.server", "8791", "--directory", "C:/Users/IKORAT~1.FOR/AppData/Local/Temp/claude/C--Users-ikoratsk-FOREST-Documents-GitHub-public-htmls/189bcb63-22b3-4b14-8265-e7b2be1e7784/scratchpad"],
      "port": 8791
    }
  ]
}
---
experiential-learning.snippet.html
faq.snippet.html
jobs-source-context.html
jobs.html
jobs.pcf
overview.pcf
overview.snippet.html
stages.snippet.html
Listed previous scratchpad preview harness directory
ls -la "C:/Users/IKORAT~1.FOR/AppData/Local/Temp/claude/C--Users-ikoratsk-FOREST-Documents-GitHub-public-htmls/189bcb63-22b3-4b14-8265-e7b2be1e7784/scratchpad" 2>&1 | head -50
total 572
drwxr-xr-x 1 FOREST+ikoratsk 4096      0 Jul  8 10:16 .
drwxr-xr-x 1 FOREST+ikoratsk 4096      0 Jul  8 09:54 ..
-rw-r--r-- 1 FOREST+ikoratsk 4096  64472 Jul  8 09:58 base-utilities.css
-rw-r--r-- 1 FOREST+ikoratsk 4096  43857 Jul  8 10:12 compare.html
-rw-r--r-- 1 FOREST+ikoratsk 4096 141516 Jul  8 10:04 jobs-live.html
-rw-r--r-- 1 FOREST+ikoratsk 4096  71286 Jul  8 09:58 legacy-global.css
-rw-r--r-- 1 FOREST+ikoratsk 4096  41808 Jul  8 09:58 legacy-secondary.css
-rw-r--r-- 1 FOREST+ikoratsk 4096  26152 Jul  8 10:37 overview-fixed.html
-rw-r--r-- 1 FOREST+ikoratsk 4096  74327 Jul  8 10:04 overview-live.html
-rw-r--r-- 1 FOREST+ikoratsk 4096  62849 Jul  8 09:58 styles.css
-rw-r--r-- 1 FOREST+ikoratsk 4096  12686 Jul  8 09:58 tokens.css
-rw-r--r-- 1 FOREST+ikoratsk 4096  18282 Jul  8 09:58 ui-components.css
Listed current session scratchpad directory
echo "Current session scratchpad:"; ls -la "C:/Users/IKORAT~1.FOR/AppData/Local/Temp/claude/C--Users-ikoratsk-FOREST-Documents-GitHub-public-htmls/ab77bc08-cc04-4da6-9471-25bfb69c0096/scratchpad" 2>&1
Current session scratchpad:
total 0
drwxr-xr-x 1 FOREST+ikoratsk 4096 0 Jul  9 16:51 .
drwxr-xr-x 1 FOREST+ikoratsk 4096 0 Jul  9 16:52 ..
Read
overview-fixed.html
C:\Users\IKORAT~1.FOR\AppData\Local\Temp\claude\C--Users-ikoratsk-FOREST-Documents-GitHub-public-htmls\189bcb63-22b3-4b14-8265-e7b2be1e7784\scratchpad\overview-fixed.html

<!DOCTYPE HTML><html class="no-js" lang="en">
   <head><base href="https://www.usf.edu/"><style>body{margin:0}</style><!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5P4W3C4');</script>
<!-- End Google Tag Manager --><!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WSWXRSNK');</script>
<!-- End Google Tag Manager -->
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet"><meta property="landing_page" content="true" />
<link type="text/css" rel="stylesheet" href="/_resources/css/v4/tokens.css" />
<link type="text/css" rel="stylesheet" href="/_resources/css/v4/base-utilities.css" />
<link type="text/css" rel="stylesheet" href="/_resources/css/v4/ui-components.css" />
<link type="text/css" rel="stylesheet" href="/_resources/css/v4/styles.css" />
<link type="text/css" rel="stylesheet" href="/_resources/css/v4/legacy/legacy-global.css" />
<link type="text/css" rel="stylesheet" href="/_resources/css/v4/legacy/legacy-secondary.css" />
<script src="//ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
<script src="/_resources/js/v4/functions.js"></script>
<script src="/_resources/js/v4/legacy/legacy-functions.js"></script>
      <title>Tech Career Accelerator Program (tCAP)</title>
      
      
      <meta name="Description" content="University of South Florida">
      
      <meta name="Keywords" content="University of South Florida">
      
      <meta name="Author" content="University of South Florida">
      
      
      <style>
				.brandHero--imageShim, .brandHero_heading {
				background: #000 url('/ai-cybersecurity-computing/images/00_promophotos/bs-in-cs-business-listing-490x328px.png') center center no-repeat;
				background-size: cover;
				}
				@media (min-width: 500px), print {
				.brandHero {
				background: #000 url('/ai-cybersecurity-computing/images/bs-in-cs-business.png') center center no-repeat;
				background-size: cover;
				}
				.brandHero_heading { background: none; }
				}
			</style>
   </head>
<body><div id="content" class="content" role="main"><div class="mainContent fullContent"><div class="u-wrapper">
<style>
  /* OmniCMS snippet root + isolation */
  #tcap-omni-overview-root,
  #tcap-omni-overview-root * {
    box-sizing: border-box !important;
  }
Counted lines in overview-fixed.html template
wc -l "C:/Users/IKORAT~1.FOR/AppData/Local/Temp/claude/C--Users-ikoratsk-FOREST-Documents-GitHub-public-htmls/189bcb63-22b3-4b14-8265-e7b2be1e7784/scratchpad/overview-fixed.html"
774 C:/Users/IKORAT~1.FOR/AppData/Local/Temp/claude/C--Users-ikoratsk-FOREST-Documents-GitHub-public-htmls/189bcb63-22b3-4b14-8265-e7b2be1e7784/scratchpad/overview-fixed.html
Read
overview-fixed.html
C:\Users\IKORAT~1.FOR\AppData\Local\Temp\claude\C--Users-ikoratsk-FOREST-Documents-GitHub-public-htmls\189bcb63-22b3-4b14-8265-e7b2be1e7784\scratchpad\overview-fixed.html
      if (active) active.classList.add('is-active');
    };

    steps.forEach((step) => {
      step.addEventListener('mouseenter', () => setActive(step));
      step.addEventListener('mouseleave', () => setActive(null));
      step.addEventListener('click', () => setActive(step)); // mobile
      step.addEventListener('touchstart', () => setActive(step), { passive: true }); // mobile
    });

  })();
  //]]>
</script>
Inspected head/tail boundary of the template file
tail -5 "C:/Users/IKORAT~1.FOR/AppData/Local/Temp/claude/C--Users-ikoratsk-FOREST-Documents-GitHub-public-htmls/189bcb63-22b3-4b14-8265-e7b2be1e7784/scratchpad/overview-fixed.html"; echo "---HEAD 54---"; sed -n '50,56p' "C:/Users/IKORAT~1.FOR/AppData/Local/Temp/claude/C--Users-ikoratsk-FOREST-Documents-GitHub-public-htmls/189bcb63-22b3-4b14-8265-e7b2be1e7784/scratchpad/overview-fixed.html"
  //]]>
</script>


</div></div></div></body></html>---HEAD 54---
				.brandHero_heading { background: none; }
				}
			</style>
   </head>
<body><div id="content" class="content" role="main"><div class="mainContent fullContent"><div class="u-wrapper">
<style>
  /* OmniCMS snippet root + isolation */
Built verification harness page with the fixed overview snippet embedded in the live site wrapper
SRC_DIR="C:/Users/IKORAT~1.FOR/AppData/Local/Temp/claude/C--Users-ikoratsk-FOREST-Documents-GitHub-public-htmls/189bcb63-22b3-4b14-8265-e7b2be1e7784/scratchpad"
DST_DIR="C:/Users/IKORAT~1.FOR/AppData/Local/Temp/claude/C--Users-ikoratsk-FOREST-Documents-GitHub-public-htmls/ab77bc08-cc04-4da6-9471-25bfb69c0096/scratchpad"
head -n 54 "$SRC_DIR/overview-fixed.html" > "$DST_DIR/overview-verify.html"
cat "tcap/omnicms-snippets/overview.snippet.html" >> "$DST_DIR/overview-verify.html"
tail -n 1 "$SRC_DIR/overview-fixed.html" >> "$DST_DIR/overview-verify.html"
wc -l "$DST_DIR/overview-verify.html"
582 C:/Users/IKORAT~1.FOR/AppData/Local/Temp/claude/C--Users-ikoratsk-FOREST-Documents-GitHub-public-htmls/ab77bc08-cc04-4da6-9471-25bfb69c0096/scratchpad/overview-verify.html
Now let's set up the launch config and preview it.


Ran a command, read a file, edited a file, used 3 tools
Checked existing launch.json
mkdir -p .claude 2>/dev/null; cat .claude/launch.json 2>/dev/null
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "tcap-scratch",
      "runtimeExecutable": "python",
      "runtimeArgs": ["-m", "http.server", "8791", "--directory", "C:/Users/IKORAT~1.FOR/AppData/Local/Temp/claude/C--Users-ikoratsk-FOREST-Documents-GitHub-public-htmls/189bcb63-22b3-4b14-8265-e7b2be1e7784/scratchpad"],
      "port": 8791
    }
  ]
}
Read
launch.json
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\.claude\launch.json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "tcap-scratch",
      "runtimeExecutable": "python",
      "runtimeArgs": ["-m", "http.server", "8791", "--directory", "C:/Users/IKORAT~1.FOR/AppData/Local/Temp/claude/C--Users-ikoratsk-FOREST-Documents-GitHub-public-htmls/189bcb63-22b3-4b14-8265-e7b2be1e7784/scratchpad"],
      "port": 8791
    }
  ]
}
Edited
launch.json
+2
-2
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\.claude\launch.json
    {
      "name": "tcap-scratch",
      "runtimeExecutable": "python",
      "runtimeArgs": ["-m", "http.server", "8791", "--directory", "C:/Users/IKORAT~1.FOR/AppData/Local/Temp/claude/C--Users-ikoratsk-FOREST-Documents-GitHub-public-htmls/189bcb63-22b3-4b14-8265-e7b2be1e7784/scratchpad"],
      "port": 8791
      "runtimeArgs": ["-m", "http.server", "8792", "--directory", "C:/Users/IKORAT~1.FOR/AppData/Local/Temp/claude/C--Users-ikoratsk-FOREST-Documents-GitHub-public-htmls/ab77bc08-cc04-4da6-9471-25bfb69c0096/scratchpad"],
      "port": 8792
    }
  ]
}
Used Claude Preview: preview start
name: tcap-scratch
{
  "serverId": "96d162e0-bbd4-4934-8304-726e13ca495f",
  "port": 8792,
  "name": "tcap-scratch",
  "reused": false,
  "previewId": "96d162e0-bbd4-4934-8304-726e13ca495f",
  "tabId": "seed"
}
Server started successfully on port 8792.
Used Claude Preview: preview eval
serverId: 96d162e0-bbd4-4934-8304-726e13ca495f
expression: window.location.href = 'http://localhost:8792/overview-verify.html'; 'navigating'
"navigating"
Used Claude Preview: preview screenshot
serverId: 96d162e0-bbd4-4934-8304-726e13ca495f

The padding fix took effect — cards now have proper breathing room matching the jobs.html reference. Let me confirm the computed padding value directly.


Used 2 tools
Used Claude Preview: preview inspect
serverId: 96d162e0-bbd4-4934-8304-726e13ca495f
selector: .stat-bar .c-calloutText
styles: ["padding","margin"]
{"tagName":"div","text":"+17.9%\nSoftware developer growth 2023–2033\n\nSoftware developer growth 2023–2033: BLS / MLR 2025.","className":"c-calloutText c-calloutText--gray","id":"","styles":{},"boundingBox":{"x":73,"y":131,"width":211.65625,"height":125}}
Used Claude Preview: preview eval
serverId: 96d162e0-bbd4-4934-8304-726e13ca495f
expression: (() => { const el = document.querySelector('.stat-bar .c-calloutText'); const cs = getComputedStyle(el); return { padding: cs.padding, margin: cs.margin }; })()
{
  "margin": "2px 0px 0px",
  "padding": "24px"
}
Confirmed: padding is now 24px (the correct 1.5em from the site's global .c-calloutText styling), matching jobs.html. The fix works.

Used Claude Preview: preview stop
serverId: 96d162e0-bbd4-4934-8304-726e13ca495f
Server 96d162e0-bbd4-4934-8304-726e13ca495f stopped
Fixed. The bug was a CSS specificity regression: when the .stat-bar > * rule was copied from jobs.html into the four snippet files, it got prefixed with the page's root ID (e.g. #tcap-omni-overview-root .stat-bar > *) to match that file's scoping convention. That extra ID bumped its specificity high enough to beat the site's global .content .c-calloutText { padding: 1.5em } rule, so the harmless padding: 0 (a no-op on jobs.html, where it's a bare class selector and loses to the global rule) started actually zeroing out the card padding — squishing the text against the card edges.

I removed padding: 0 from the .stat-bar > * rule in all four files:

overview.snippet.html
faq.snippet.html
stages.snippet.html
experiential-learning.snippet.html
Verified against a live-site harness (pulling the real USF CSS via <base href>) that the cards now render with the correct 24px padding, matching jobs.html.

One thing I didn't touch: on these snippet pages the stat-bar wraps to 3+1 cards instead of jobs.html's single row of 4, because these pages cap their container at max-width: 900px while jobs.html's container has no such cap. Let me know if that row-wrapping is also something you want matched, or if it's an intentional difference for these narrower pages.

also, all 4 should be on the same row

That's because the container is capped at 900px while using minmax(200px, 1fr) — 4 columns × 200px + 3 gaps × 32px = 896px, just barely more than the ~852px available inside the padded container, so it wraps. I'll force exactly 4 columns instead of letting auto-fit decide.


Read a file, edited a file
Read
overview.snippet.html
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\overview.snippet.html
  #tcap-omni-overview-root .stat-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
    align-items: start;
  }
Edited
overview.snippet.html
+1
-1
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\overview.snippet.html
     render identically to the live jobs page. */
  #tcap-omni-overview-root .stat-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 2rem;
    margin: 2rem 0;
    align-items: start;
Now the other three files.


Read 3 files, edited 3 files
Read
faq.snippet.html
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\faq.snippet.html
  #tcap-omni-faq-root .stat-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
    align-items: start;
  }
Edited
faq.snippet.html
+1
-1
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\faq.snippet.html
     render identically to the live jobs page. */
  #tcap-omni-faq-root .stat-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 2rem;
    margin: 2rem 0;
    align-items: start;
Read
stages.snippet.html
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\stages.snippet.html
  #tcap-omni-stages-root .stat-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
    align-items: start;
  }
Edited
stages.snippet.html
+1
-1
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\stages.snippet.html
     render identically to the live jobs page. */
  #tcap-omni-stages-root .stat-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 2rem;
    margin: 2rem 0;
    align-items: start;
Read
experiential-learning.snippet.html
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\experiential-learning.snippet.html
  #tcap-omni-expl-root .stat-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
    align-items: start;
  }
Edited
experiential-learning.snippet.html
+1
-1
C:\Users\ikoratsk.FOREST\Documents\GitHub\public-htmls\tcap\omnicms-snippets\experiential-learning.snippet.html
     render identically to the live jobs page. */
  #tcap-omni-expl-root .stat-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 2rem;
    margin: 2rem 0;
    align-items: start;
Now let's verify with the preview harness.


Ran a command, used 3 tools
Rebuilt verification harness with latest overview snippet
DST_DIR="C:/Users/IKORAT~1.FOR/AppData/Local/Temp/claude/C--Users-ikoratsk-FOREST-Documents-GitHub-public-htmls/ab77bc08-cc04-4da6-9471-25bfb69c0096/scratchpad"
SRC_DIR="C:/Users/IKORAT~1.FOR/AppData/Local/Temp/claude/C--Users-ikoratsk-FOREST-Documents-GitHub-public-htmls/189bcb63-22b3-4b14-8265-e7b2be1e7784/scratchpad"
head -n 54 "$SRC_DIR/overview-fixed.html" > "$DST_DIR/overview-verify.html"
cat "tcap/omnicms-snippets/overview.snippet.html" >> "$DST_DIR/overview-verify.html"
tail -n 1 "$SRC_DIR/overview-fixed.html" >> "$DST_DIR/overview-verify.html"
echo done
done
Used Claude Preview: preview start
name: tcap-scratch
{
  "serverId": "bd404ade-a2c4-4c0b-986e-757f10c9e89d",
  "port": 8792,
  "name": "tcap-scratch",
  "reused": false,
  "previewId": "bd404ade-a2c4-4c0b-986e-757f10c9e89d",
  "tabId": "seed"
}
Server started successfully on port 8792.
Used Claude Preview: preview eval
serverId: bd404ade-a2c4-4c0b-986e-757f10c9e89d
expression: window.location.href = 'http://localhost:8792/overview-verify.html'; 'navigating'
"navigating"
Used Claude Preview: preview screenshot
serverId: bd404ade-a2c4-4c0b-986e-757f10c9e89d

All 4 stat-bar cards now render in a single row, matching jobs.html. Let's also check the mobile breakpoint still stacks correctly, then clean up the preview server.


Used 2 tools
Used Claude Preview: preview resize
serverId: bd404ade-a2c4-4c0b-986e-757f10c9e89d
preset: mobile
Viewport set to 375x812 (mobile).
Used Claude Preview: preview screenshot
serverId: bd404ade-a2c4-4c0b-986e-757f10c9e89d

Mobile stacking still works correctly (the @media (max-width: 700px) rule overrides to a single column).

Used Claude Preview: preview stop
serverId: bd404ade-a2c4-4c0b-986e-757f10c9e89d
Server bd404ade-a2c4-4c0b-986e-757f10c9e89d stopped
Both fixes are applied to all four snippet files (overview, faq, stages, experiential-learning):

Removed the padding: 0 regression so cards get their correct 24px padding from the site's global .c-calloutText style.
Changed grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) to repeat(4, minmax(0, 1fr)) so all 4 cards stay on one row regardless of the narrower 900px container, matching jobs.html. Mobile stacking to a single column at ≤700px still works.
however, they clip below the lines, unlike the jobs page, which has correct bottom spacing, furthermore, there's far too much space between them and the highlight talk to an advisor band