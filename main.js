window.onload = async function() {
  try {
    
    const weightTable = {};
    const assignmentTypes = [];
    let weighted = true;
  
    // Fetch the Assignment Weights (if missing the program assumes weightless)
    let i = 0; 
    const rows = document.querySelectorAll('.summary tbody tr');
    if (rows.length != 0) {
      rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        const assignmentType = cells[0].textContent.trim();
        if (assignmentType !== 'Total') {
          assignmentTypes.push(assignmentType);
          const weight = cells[1].textContent.trim().slice(0, -1);
          weightTable[assignmentType] = {};
          weightTable[assignmentType].weight = parseFloat(weight);
        }
        i++;
      });
    } else {
      assignmentTypes.push("Assignments");
      weighted = false;
      weightTable[assignmentTypes[0]] = {weight: 100};
    }
  
    // Fetches the maximum possible points of each assignment type
    const maxScoreElements = document.querySelectorAll('.student_assignment.hard_coded.group_total');
    i = 0;
    if (maxScoreElements.length == 0) return console.error("[Grade Info] Unable to find asssignment total points");
    maxScoreElements.forEach(maxRow => {
        const pointsPossible = maxRow.querySelector('.points_possible').textContent.trim();
        const [, maxPoints] = pointsPossible.split('/');
        const numericMaxPoints = parseFloat(maxPoints.trim());
        weightTable[assignmentTypes[i]].high = 0;
        weightTable[assignmentTypes[i]].upper = 0;
        weightTable[assignmentTypes[i]].median = 0;
        weightTable[assignmentTypes[i]].mean = 0;
        weightTable[assignmentTypes[i]].lower = 0;
        weightTable[assignmentTypes[i]].low = 0;

        weightTable[assignmentTypes[i]].maxScore = numericMaxPoints;
        i++;
    });
  
    // Fetch all the assignment values
    const upperQuartiles = document.querySelectorAll('.ic-Table.ic-Table--condensed.score_details_table');

    if (upperQuartiles.length == 0) return console.error("[Grade Info] Grade distribution not provided");
    
    const gradeInfos = [];

    // get the numeric values from a text
    function parseTextContent(text) {
      let line1 = parseFloat(text.substring(text.indexOf(":") + 1));
      let line2 = parseFloat(text.substring(text.lastIndexOf(":") + 1));
      return {line1, line2};
    }
    
    upperQuartiles.forEach(element => {
      if (element.closest(".comments_thread")) return;
      const info = {};
      const meanAndMedianText = element.querySelector('td:nth-child(1)')?.textContent;
      if (!meanAndMedianText) return;
      // use the function to get the mean and median values
      let returnObj = parseTextContent(meanAndMedianText);
      info.mean = returnObj.line1;
      info.median = returnObj.line2;
    
      const highAndUpperQuartile = element.querySelector('td:nth-child(2)')?.textContent;
      if (!highAndUpperQuartile) return;
      // use the function to get the high and upper quartile values
      returnObj = parseTextContent(highAndUpperQuartile);
      info.high = returnObj.line1;
      info.upper = returnObj.line2;
    
      const lowAndLowerQuartile = element.querySelector('td:nth-child(3)')?.textContent;
      if (!lowAndLowerQuartile) return;

      // use the function to get the low and lower quartile values
      returnObj = parseTextContent(lowAndLowerQuartile);
      info.low = returnObj.line1;
      info.lower = returnObj.line2;
      
      gradeInfos.push(info);
    });
    
    
    // Gets the assignment type of each assignment
    const assignmentTypesElements = document.querySelectorAll('.student_assignment.assignment_graded');

    if (assignmentTypesElements.length == 0) return console.log("[Grade Info] Couldn't find any assignments");
  
    i = 0;
    assignmentTypesElements.forEach(element => {
        if (element.classList.contains("dropped")) return;
        const assignmentType = element.querySelector('.context').textContent.trim();
        weightTable[assignmentType].high += gradeInfos[i].high;
        weightTable[assignmentType].upper += gradeInfos[i].upper;
        weightTable[assignmentType].mean += gradeInfos[i].mean;
        weightTable[assignmentType].median += gradeInfos[i].median;
        weightTable[assignmentType].lower += gradeInfos[i].lower;
        weightTable[assignmentType].low += gradeInfos[i].low;
        i++;
    });

    const scores = {
      high: 0,
      upper: 0,
      median: 0,
      mean: 0,
      lower: 0,
      low: 0
    };
    let keptWeighted = 0;
    Object.values(weightTable).forEach((row) => {
      if (row.maxScore == 0 || row.weight == 0) return;
      keptWeighted += row.weight;
      scores.high += row.high / row.maxScore * row.weight;
      scores.upper += row.upper / row.maxScore * row.weight;
      scores.median += row.median / row.maxScore * row.weight;
      scores.mean += row.mean / row.maxScore * row.weight;
      scores.lower += row.lower / row.maxScore * row.weight;
      scores.low += row.low / row.maxScore * row.weight;
    });
    for (let field in scores) {
      scores[field] = (scores[field] / keptWeighted * 100).toFixed(2);; 
    }

    const table = document.getElementById('grades_summary');

    table.style.border = "none";
    table.style.borderCollapse = "collapse";

    let classGradesTr = document.createElement("tr");
    classGradesTr.style.border = "none";
    classGradesTr.style.borderCollapse = "collapse";
    classGradesTr.classList.add("class_grades");

    let classGradesTh = document.createElement("th");
    classGradesTh.setAttribute("colspan", "5"); 
    classGradesTh.textContent = "Class Statistics (Roughly): ";
    classGradesTh.style.fontSize = "22px"
    classGradesTh.style.border = "none";
    classGradesTh.style.borderCollapse = "collapse";

    classGradesTr.appendChild(classGradesTh);

    table.appendChild(classGradesTr);

    const keyTable = {
      "high": "Highest Possible",
      "upper": "Upper Quartile",
      "mean": "Mean",
      "median": "Median",
      "lower": "Lower Quartile",
      "low": "Lowest Possible"
    }

    for (let key in scores) {
      let tr = document.createElement("tr");
      tr.classList.add("student_assignment", "hard_coded", "final_grade", "feedback_visibility_ff", "extension");
    
      let th = document.createElement("th");
      th.classList.add("title", "extension");
      th.setAttribute("scope", "row");
      th.style.fontSize = "18px";
      th.textContent = `${keyTable[key]} Grade: `;
      tr.appendChild(th);
    
      let td1 = document.createElement("td");
      td1.classList.add("due", "extension");
      tr.appendChild(td1);
    
      let td2 = document.createElement("td");
      td2.classList.add("status", "extension");
      td2.setAttribute("scope", "row");
      tr.appendChild(td2);
    
      let td3 = document.createElement("td");
      td3.classList.add("assignment_score", "extension");
      td3.setAttribute("title", "");
      tr.appendChild(td3);
    
      let div = document.createElement("div");
      div.style.position = "relative";
      div.style.height = "100%";
      div.classList.add("score_holder", "extension");
      td3.appendChild(div);
    
      let span1 = document.createElement("span");
      span1.classList.add("assignment_presenter_for_submission", "extension");
      span1.style.display = "none";
      div.appendChild(span1);
    
      let span2 = document.createElement("span");
      span2.classList.add("react_pill_container", "extension");
      div.appendChild(span2);
    
      let span3 = document.createElement("span");
      span3.classList.add("tooltip");
      div.appendChild(span3);
    
      let span4 = document.createElement("span");
      span4.classList.add("extension");
      span4.style.fontSize = "18px";
      span4.textContent = scores[key] + "%";
      span3.appendChild(span4);
    
      let td4 = document.createElement("td");
      td4.classList.add("details", "extension");
      tr.appendChild(td4);
    
      let span5 = document.createElement("span");
      span5.classList.add("possible", "points_possible"), "extension";
      span5.setAttribute("aria-label", "");
      td4.appendChild(span5);
    
      table.appendChild(tr);
    }    
    
  } catch(e) {
    return console.error(e);
  }
}