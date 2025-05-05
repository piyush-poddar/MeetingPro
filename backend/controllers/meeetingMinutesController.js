/*const { OpenAI } = require('openai');  // Use the OpenAI SDK (or similar)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Set your API key from the environment variable
});

exports.generateMeetingMinutes = async (req, res) => {
  try {
    const meetingTranscript = req.body.transcript; // Text from the audio that needs to be summarized

    const response = await openai.chat.completions.create({
      model: 'gpt-4',  // or use GPT-3
      messages: [
        {
          role: 'system',
          content: 'You are an assistant that generates concise and clear meeting minutes.',
        },
        {
          role: 'user',
          content: `Please summarize the following meeting transcript:\n\n${meetingTranscript}`,
        },
      ],
    });

    const meetingMinutes = response.choices[0].message.content;

    res.status(200).json({ minutes: meetingMinutes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate meeting minutes' });
  }
};
*/
