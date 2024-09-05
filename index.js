const { OpenAI } = require("openai");
require('dotenv').config();
const { z } = require("zod");
const fs = require("fs");
const path = require("path");
const { zodResponseFormat } = require("openai/helpers/zod");
const prompt = require('prompt-sync')({sigint: true});;


const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY });


// Get Directory Structure
const FileSchema = z.object({
  name: z.string(),
  type: z.enum(["file", "directory"]),
  children: z.lazy(() => z.array(FileSchema)).optional(),
});

const DirectorySchema = z.object({
  name: z.string(),
  type: z.literal("directory"),
  children: z.array(FileSchema),
});

function getDirectoryStructure(dirPath) {
  const stats = fs.statSync(dirPath);
  const info = {
    name: path.basename(dirPath),
    type: stats.isDirectory() ? "directory" : "file",
  };

  if (stats.isDirectory()) {
    const ignoreDirs = ['node_modules', '.git', 'build', 'dist'];
    info.children = fs.readdirSync(dirPath)
      .filter(child => !ignoreDirs.includes(child))
      .map(child => getDirectoryStructure(path.join(dirPath, child)));
  }

  return info;
}

function validateDirectoryStructure(dirPath) {
  const structure = getDirectoryStructure(dirPath);
  return DirectorySchema.parse(structure);
}

// ---------------

// Get Dependencies
function getDependencies(dirPath) {
  const packageJsonPath = path.join(dirPath, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    return packageJson.dependencies;
  }
  return {};
}
// ---------------

// Zod Schema for array of subtasks
const SubtaskSchema = z.object({
  subtask: z.string().describe("A single subtask that describes a step needed to complete the project at the level of detail of an intern."),
  explanation: z.string().describe("A detailed explanation of why this subtask is necessary, how it contributes to the overall project, and how it builds on the previous subtask."),
});

const ProjectPlanSchema = z.object({
  projectDescription: z.string().describe("A simple description of the project."),
  subtasks: z.array(SubtaskSchema),
});

// -------------    

// List of changes to be made in each file
const FileChangeSchema = z.object({
  filePath: z.string(),
  typeOfChanges: z.enum(["add new file", "remove file", "modify file", "install dependency"]),
  descriptionOfChanges: z.string(),
});


const FileChangesArraySchema = z.object({
  subtask: z.string(),
  fileChanges: z.array(FileChangeSchema),
});


// -------------

// Chat with GPT
async function generateSubtasks(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", content: 
          `I will give you a 1 sentence description of a software project I would like to build.
           I need you to break down the project into at least 10 subtasks. Each subtask should be a single step that can be completed by an intern and build on the previous subtask.
           For each subtask, provide a detailed high level description with enough information and detail that an intern can understand and start working on the subtask.
           
           You can assume that a basic npx create-react-app has been created. If you need to simulate data/interface with APIs, use mock data.
           Be clear, concise, and detailed like a senior developer would when mentoring an intern.

          For example, if I wanted to build a simple web app that lets you search for books and save them to a reading list, the subtasks might be:
          - Create mock data for books and user reviews
          - Create the book card component
          - Create the main page with a list of books using the book card component
          - Create a modal component to display book details
          - Allow users to click on a book and see the book's details in the modal
          - Add the search bar to the top of the page to search for book titles
          - Add a login button with a modal that lets users login
          - Add a logout button that lets users logout
          - Create mock data for the personal reading list
          - Create the personal reading list page with book cards
          - Add a reading list button to the top of the main page

          Return the response in a JSON format.` 
        },
        {
            role: "user",
            content: prompt,
        },
      ],
    response_format: zodResponseFormat(ProjectPlanSchema, "ProjectPlanSchema"),
    });
    return response.choices[0].message;
  } catch (error) {
    console.error("Error in ChatGPT API call:", error);
    return "Sorry, there was an error processing your request.";
  }
}

async function generateFileChanges(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", content: 
          `
          You are a senior developer mentoring an intern. You will be given a description of the project we are working on and 1 subtask that you have to instruct an intern on how to implement.
          You will then be given the directory structure of the project and the current dependencies of the project. You may instruct the intern to add/remove/modify files or install new dependencies if needed.

          If you would like to modify a file, you have to instruct the intern on what needs to be changed. Ensure that each change applies to a single file at a time. 
          Ensure that the changes you instruct can be followed in the order they are given. For example do not ask the intern to import a dependency before it has been installed.
          Be clear, detailed, and concise. Do not write any code yourself. Simply describe the changes needed. Generate the response in a JSON format.
          `
        },
        {
            role: "user",
            content: prompt,
        },
    ],
    response_format: zodResponseFormat(FileChangesArraySchema, "FileChangesArraySchema"),
    });
    return response.choices[0].message;
  } catch (error) {
    console.error("Error in ChatGPT API call:", error);
    return "Sorry, there was an error processing your request.";
  }
}
// ---------------

const dirPath = "./blog-app";

// Get directory structure
const validatedStructure = validateDirectoryStructure(dirPath);
const directoryStructure = JSON.stringify(validatedStructure, null, 2);
// console.log(JSON.stringify(validatedStructure, null, 2));

// Get dependencies
const dependencies = getDependencies(dirPath);
// console.log(dependencies);

// Talk to GPT
const chatgptPrompt = `I want to build a blog app where users can create an account, post blogs, and read blogs.`;
// include dir, dependencies, and prompt
let response;
let fileChangesForSubtask;

async function processSubtasks() {
  try {
    response = await generateSubtasks(chatgptPrompt);
    response = JSON.parse(response.content);
    if (response){
      console.log('Subtasks:');
      response.subtasks.forEach((subtask, index) => {
        console.log(`${index + 1}. ${subtask.subtask}`);
      });
      const userPrompt = prompt(`\n`);
    } else {
      console.log("No parsed response found in the response.");
    }

    for (const subtask of response.subtasks){
      fileChangesForSubtask = await generateFileChanges(`{description: ${chatgptPrompt}, subtask: ${subtask}, explanation for subtask: ${subtask.explanation}, directoryStructure: ${directoryStructure}, dependencies: ${dependencies}}`);
      fileChangesForSubtask = JSON.parse(fileChangesForSubtask.content);
      console.log('Number of file changes for subtask: ', fileChangesForSubtask.fileChanges.length); // get file changes
      processSubtask(fileChangesForSubtask);
    }

  } catch (error) {
    console.error("Error processing subtasks:", error);
  }
}


async function processSubtask(fileChangesForSubtask){
  fileChangesForSubtask.fileChanges.forEach((fileChange, index, array) => {
    console.log(`${index + 1}/${array.length}: ${fileChange.typeOfChanges} | ${fileChange.filePath} | ${fileChange.descriptionOfChanges}`);
    const userInput = prompt(``);
  });
}


processSubtasks();

// response.subtasks.forEach(async subtask => {
//   // include dir, dependencies, and subtask
//   let fileChangesForSubtask = generateFileChanges(`{description: ${chatgptPrompt}, subtask: ${subtask}, directoryStructure: ${directoryStructure}, dependencies: ${dependencies}`)
//     .then(response => console.log(response)) ; // get file changes

  // write files    
  // fileChangesForSubtask.fileChanges.forEach(fileChange => {
  //   if (fileChange.typeOfChanges === 'add new file') {
  //     const filePath = path.join(dirPath, fileChange.path);
  //     const directory = path.dirname(filePath);

  //     // Create directory if it doesn't exist
  //     if (!fs.existsSync(directory)) {
  //       fs.mkdirSync(directory, { recursive: true });
  //     }

  //     // Write the file
  //     fs.writeFileSync(filePath, fileChange.content);
  //     console.log(`Added new file: ${fileChange.path}`);
  //   } else {
  //     // Sleep until user input
  //     const userInput = prompt(`Press Enter to continue to the next file...`);
  //   }
  // });
// });

