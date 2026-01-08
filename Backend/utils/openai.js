import "dotenv/config";

const getGroqAPIResponse = async(message) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [{
                role: "user",
                content: message,
            }]
        }),
    };

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", options);
        const data = await response.json();

        if (data.error) {
            console.log("API Error:", data.error);
            return "Sorry, Please try again later.";
        }

        if (!data.choices || !data.choices[0]) {
            console.log("API Error:", data);
            return "Sorry, I couldn't generate a reply. Please try again.";
        }

        return data.choices[0].message.content; // assistant reply

    } catch (err) {
        console.log("Fetch Error:", err);
        return "Please check your internet or try again later.";
    }
};

export default getGroqAPIResponse;