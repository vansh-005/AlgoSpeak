For starting whisper server: .\build\bin\Release\whisper-server.exe -m ggml-medium.en.bin -t 8    

# TO-DO
1. Have to complete llm_summarize in server/utils/getProblemSummary 
    -- Skiping this as we should give full context to LLM about problem.
2. Have completed fetchLeetCodeProblem but there is a issue of constraint formating.

# Getting back to complete this project:
1. complete clientUploadRoutes.js
->For that i need each time a perfect prompt will structure prompt like
    System prompt: You are an AI coach to teach leetcode problems etc..
    Problem statement : This part is done:
    Context : Previous conversations from redis + KNN (vector DB) 
    * will implement KNN part later
-> I will need output in following format
    Text that will be trancribed
    Text that will be written on panel e.g explanation, code etc.
    
