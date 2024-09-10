This repo is a fun little experiment to see how far I could get generating a webapp with AI given minimal investment, time, and user involvement. 

# How it Works
1. Give ChatGPT a simple description about what you want to build. For example: "I want to build a blog app where users can create an account, post blogs, and read blogs."
2. ChatGPT then breaks this project down into around 10 subtasks.
3. It is then provided with the current dependencies + directory structure and asked to break down the subtask into sub-subtasks. These are short, atomic instructions necessary to complete the subtask. 
4. For each subtask it will print 1 of 3 "instructions". It will either ask you install a dependency, add a new file with a given name, or modify a file with a given prompt. Installing dependency and adding a file is trivial. For modifying a file, it will give you a prompt that you paste into Cursor in the specified file. 


# Running AI Generated WebApp
1. Go to blog-app/
2. ```npm run start```

Below are screenshots:
![Image](/img/blogapp1.png)
![Image](/img/blogapp2.png)

This site certainly isn't going to win any awards but considering that the AI generation logic is 200 lines, the prompt is 1 sentence, and there were only minor import  errors I had to manually fix, this is pretty cool!

# Tools Used
- ChatGPT gpt-4o-mini
- Cursor IDE

# How to run it yourself
1. Run npx create-react-app your-project-name
2. Create .env based on .env.example. Paste your OpenAI Key.
3. In generateWebApp.js, on line 10 enter your prompt. On line 11 enter the directory to your app. 
4. Run node generateWebApp.js


# Following the terminal instructions
There's probably a way to feed the terminal output into Cursor directly but I haven't looked into it just yet. Also refer to [notes.md](notes.md) for small problems I noticed with this step. 

1. The terminal will first print a list of around 10 subtasks. These are high level objectives needed to complete your app. Press enter.
2. It will then print a list of instructions one at a time. Press enter when you have completed the line. The line will specify the type of instruction, relevant file path, and description. Below is what to do for each type of instruction:
    - Installing a dependency, ```npm i <dependency-name>```
    - Adding a file ```touch <file-path>```
    - Modifying a file. Go into the specified file. Select the entire file, Ctrl+K, then paste the prompt. 
3. ```npm run start``` your app. If applicable, fix small errors (in my case it was about 3mins total)

# Future Improvements
- Automate creating a file + installing dependency
- Figure out if there's any way to directly take the terminal instructions for modifying a file and paste them into Cursor in the correct file. 
    - Actually how good would it be if I queried Claude with that prompt and then wrote the code into the file?
- How much better would it be if I gave ChatGPT file content as well? I do think it's better for ChatGPT to give high level tasks and leave the actual coding to Cursor.
- Integrating function calling to give ChatGPT more info about the codebase? 