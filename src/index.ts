import express from "express";
import { fetchTranscript, extractTasksWithLLM, createTrelloCards } from "./modules/services";
import "dotenv/config"

const PORT = process.env.PORT || 8000

const app = express()

app.use(express.json())

app.post("/fireflies/webhook", async (req, res) => {
    res.status(200).json({ received: true })

    const { meetingId, eventType } = req.body
    if (eventType !== "Transcription completed") return
    try {
        const transcript = await fetchTranscript(meetingId)
        if (!transcript) return

        const tasks = await extractTasksWithLLM(transcript)
        console.log("Tasks extracted: ", tasks)

        await createTrelloCards(tasks)
        console.log(`Created ${tasks.length} Tasks`)

    } catch (error) {
        console.error("Pipeline failed:", error)
    }

})

app.get("/", (req, res) => {
    res.send("Server is up!")
})


app.listen(PORT, () => {
    console.log("Listening on PORT: ", PORT)
})

