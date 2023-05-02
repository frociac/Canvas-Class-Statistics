window.onload = async function() {
  try {
    
    const weightTable = {};
    const assignmentTypes = [];
    let weighted = true;
  
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
  
    const maxScoreElements = document.querySelectorAll('.student_assignment.hard_coded.group_total');
    i = 0;
    if (maxScoreElements.length == 0) return;
    maxScoreElements.forEach(maxRow => {
        const pointsPossible = maxRow.querySelector('.points_possible').textContent.trim();
        const [, maxPoints] = pointsPossible.split('/');
        const numericMaxPoints = parseFloat(maxPoints.trim());
        weightTable[assignmentTypes[i]].curScore = 0;
        weightTable[assignmentTypes[i]].maxScore = numericMaxPoints;
        i++;
    });
  
    // Select all the elements with the specified class
    const upperQuartiles = document.querySelectorAll('.ic-Table.ic-Table--condensed.score_details_table');

    if (upperQuartiles.length == 0) return;
  
    // Define an array to store the Upper Quartile values
    const upperQuartileValues = [];
  
    // Loop through each element and extract the Upper Quartile value
    upperQuartiles.forEach(element => {
      // Find the <td> element that contains the Upper Quartile value
      const upperQuartileTd = element.querySelector('td:nth-child(2)');
      // Check if the text content of the <td> element contains "Upper Quartile"
      if (upperQuartileTd?.textContent.includes('Upper Quartile')) {
        // Extract the numeric value of the Upper Quartile from the text content
        const upperQuartileValue = parseFloat(upperQuartileTd.textContent.substring(upperQuartileTd.textContent.lastIndexOf(':') + 1));
        // Log the value of the Upper Quartile to the console
        upperQuartileValues.push(upperQuartileValue);
      }
    });
  
    // Select all the elements with the specified class
    const assignmentTypesElements = document.querySelectorAll('.student_assignment.assignment_graded');

    if (assignmentTypesElements.length == 0) return;
  
    // Loop through each element and extract the assignment type
    i = 0;
    assignmentTypesElements.forEach(element => {
        const assignmentType = element.querySelector('.context').textContent.trim();
        weightTable[assignmentType].curScore += upperQuartileValues[i];
        i++;
    });
  
    let score = 0;
    let keptWeighted = 0;
    Object.values(weightTable).forEach((row) => {
      if (row.curScore != 0 && row.maxScore != 0) {
        keptWeighted += row.weight;
        score += row.curScore / row.maxScore * row.weight;
      }
    });
  
    const interQuartileScore = score / keptWeighted * 100;
    const rounded = interQuartileScore.toFixed(2);
  
    // console.log(interQuartileScore);
    const table = document.getElementById('grades_summary');
  
    // Create the td element
    const tdElement = document.createElement('td');
    tdElement.setAttribute('class', 'assignment_score');
    tdElement.setAttribute('title', '');
  
    // Create the div element inside td element
    const divElement = document.createElement('div');
    divElement.setAttribute('style', 'position: relative; height: 100%;');
    divElement.setAttribute('class', 'score_holder');
  
    // Create and append the span elements inside div element
    const span1 = document.createElement('span');
    span1.setAttribute('class', 'assignment_presenter_for_submission');
    span1.setAttribute('style', 'display: none;');
    const span2 = document.createElement('span');
    span2.setAttribute('class', 'react_pill_container');
    const span3 = document.createElement('span');
    span3.setAttribute('class', 'tooltip');
  
    const gradeSpan = document.createElement('span');
    gradeSpan.setAttribute('class', 'grade');
    gradeSpan.textContent = `${rounded}%`;
  
    span3.appendChild(gradeSpan);
    divElement.appendChild(span1);
    divElement.appendChild(span2);
    divElement.appendChild(span3);
  
    // Append the div element to the td element
    tdElement.appendChild(divElement);
  
    // Append the td element to the desired parent element, for example:
    const parentElement = document.querySelector('table tbody');
    parentElement.appendChild(tdElement);
  
    const spaceElement = document.createElement('td');
    spaceElement.className = 'details';
    const spanElement = document.createElement('span');
    spanElement.className = 'possible points_possible';
    spanElement.setAttribute('aria-label', '');
    spaceElement.appendChild(spanElement);
  
  
    const tbody = table.tBodies[0];
    const row = document.createElement('tr');
    row.classList.add("student_assignment.hard_coded.final_grade.feedback_visibility_ff");
    const cell1 = document.createElement('th');
    cell1.classList.add("title")
    cell1.scope = "row";
    cell1.textContent = weighted ? 'Interquartile Grade: ' : 'Interquartile Grade(No Weights): ';
    const cell2 = document.createElement('td');
    cell2.classList.add("due");
    const cell3 = document.createElement('td');
    cell3.classList.add("status");
    cell3.scope = "row";
    tbody.appendChild(row);
    row.appendChild(cell1);
    row.appendChild(cell2);
    row.appendChild(cell3);
    row.appendChild(tdElement);
    row.appendChild(spaceElement);
  } catch(e) {
    return;
  }
}