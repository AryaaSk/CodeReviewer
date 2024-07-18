declare const OPEN_AI_API_KEY: string; //loaded in from Assets folder; hidden from git

let GPT_MODEL = "gpt-4o"; //gpt-4 is much more expensive than gpt-3.5-turbo, however it seems to be 'worth' it for accuracy

const GetChatGPTReply = (prompts: string[], context: string): Promise<string> => {
    //setting temperature and top_p parameters straight in API call rather than from MarkingAPI for easy access
    const messages = [{
            "role": "system",
            "content": context
        }
    ]

    for (const prompt of prompts) {
        messages.push({
            "role": "user",
            "content": prompt
        });
    }

    //console.log(prompt);
    return new Promise((resolve) => {
        var url = "https://api.openai.com/v1/chat/completions";
        var bearer = 'Bearer ' + OPEN_AI_API_KEY
        fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': bearer,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "model": GPT_MODEL,
                "messages": messages,
                "temperature": 0.3,
                "top_p": 0.99
            })
        }).then(response => {
            response.json().then((data) => {
                const content = data["choices"][0]["message"]["content"]
                resolve(content);
            })
        });
    })
}

const CleanJSON = (response: string) => {
    //sometimes JSON responses start and end with ```json ... ```
    if (response.startsWith('```json')) {
        response = response.replace('```json', "");
    }
    if (response.endsWith('```')) {
        response = response.replace('```', "");
    }

    return response;
}