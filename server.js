const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const templates = JSON.parse(fs.readFileSync("templates.json"));

app.get("/api/templates", (req, res) => {
  res.json(templates);
});

app.post("/api/deploy", async (req, res) => {
  const { templateName, appName } = req.body;
  const template = templates.find(t => t.name === templateName);

  if (!template) return res.status(404).send("Template not found");

  try {
    const response = await axios.post(`${process.env.EASYPANEL_URL}/api/projects/${process.env.PROJECT_ID}/apps`, {
      name: appName,
      image: template.image,
      envs: template.envs,
      volumes: template.volumes,
      ports: template.ports
    }, {
      headers: {
        Authorization: `Bearer ${process.env.EASYPANEL_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    res.status(200).json({ message: "App deployed", data: response.data });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to deploy app" });
  }
});

app.listen(3000, () => {
  console.log("Dashboard running on http://localhost:3000");
});