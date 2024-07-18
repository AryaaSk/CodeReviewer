declare const ace: any; //https://ace.c9.io/#nav=embedding

let EDITOR: any;
const LANGUAGE = "python";


function capitalizeFirstLetter(string: string) { //https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
    return string.charAt(0).toUpperCase() + string.slice(1);
}
const InitEditor = () => {
    const title = document.getElementById("title")!;
    title.innerText = `Code Reviewer (${capitalizeFirstLetter(LANGUAGE)})`;

    EDITOR = ace.edit("editor");
    EDITOR.setTheme("ace/theme/monokai");
    EDITOR.session.setMode("ace/mode/" + LANGUAGE);
}
const InitListeners = () => {
    const reviewCodeButton = document.getElementById("reviewCode")!;

    reviewCodeButton.onclick = async () => {
        const code = EDITOR.getValue();
        const review = await ReviewCode(code, LANGUAGE);
        DisplayFeedback(review);
    }
}

const DisplayFeedback = (review: { exceptionFeedback: ExceptionFeedback[], improvementFeedback: ImprovementFeeedback[] }) => {
    const exceptionsTable = document.getElementById("exceptions")!;
    exceptionsTable.innerHTML = `
    <tr>
            <th>Code</th>
            <th>Exception</th>
            <th>Description</th>
            <th>Solutions</th>
    </tr>
    `;

    //pretty print not working for some reason

    for (const exception of review.exceptionFeedback) {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td><code class="prettyprint">${exception.code.join("\n")}</code></td>
        <td>${exception.exception}</td>
        <td>${exception.description}</td>
        <td>${exception.possibleSolutions.join("<br>")}</td>
        `;

        exceptionsTable.append(row);
    }


    const improvementsTable = document.getElementById("improvements")!;
    improvementsTable.innerHTML = `
    <tr>
        <th>Code</th>
        <th>Description</th>
        <th>Solutions</th>
    </tr>
    `;

    for (const improvement of review.improvementFeedback) {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td><code class="prettyprint">${improvement.code.join("<br>")}</code></td>
        <td>${improvement.description}</td>
        <td>${improvement.possibleSolutions.join("<br>")}</td>
        `;

        improvementsTable.append(row);
    }
}



interface ExceptionFeedback {
    code: string[];
    exception: string;
    description: string;
    possibleSolutions: string[];
}
interface ImprovementFeeedback {
    code: string[];
    description: string;
    possibleSolutions: string[];
}
const ReviewCode = async (code: string, language: string) => {
    //send this code to ChatGPT and ask it to find any possible routes which could cause an exception
    const context = "You are a software developer tasked with reviewing code to ensure it is as robust, safe and efficient as possible.";
    const initialPrompt = `Please review this code written in ${language}`;
    const detailedPrompt = `Find any ways in which this code could generate exceptions, and any methods of making the code simpler or more efficient. The improvements should not include syntax errors, but rather methods to make the code more efficient or simpler. You will shortly learn the required JSON response format: new code suggestions should be placed within the solutions attribute, while the first 'code' attribute is strictly reserved for code already given in the extract above.`;
    const returnFormat = "Please return response in JSON format: { exceptions: { exception: string, code: string[], description: string, possibleSolutions: string[] }[], improvements: { description: string, code: string[], possibleSolutions: string[] }[]  }";
    
    const response = JSON.parse(CleanJSON(await GetChatGPTReply([initialPrompt, code, detailedPrompt, returnFormat], context)));
    const exceptionFeedback: ExceptionFeedback[] = response["exceptions"];
    const improvementFeedback: ImprovementFeeedback[] = response["improvements"];

    return { exceptionFeedback: exceptionFeedback, improvementFeedback: improvementFeedback };
}




const Main = async () => {
    //console.log(await GetChatGPTReply(["can you review code?"], "You are a software developer"));
    InitEditor();
    InitListeners();
}
Main();