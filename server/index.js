const keys = require("./keys");
const redis = require("redis");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(bodyParser.json());

const pgClient = new Pool({
	user: keys.pgUser,
	host: keys.pgHost,
	database: keys.pgDatabase,
	password: keys.pgPassword,
	port: keys.pgPort,
});

(async () => {
	await pgClient.connect().catch((err) => console.log(err));
})();

pgClient.on("error", () => console.log("Lost PG connection"));

pgClient.on("connect", async () => {
	await pgClient.query("CREATE TABLE IF NOT EXISTS values (number INT)").catch((err) => console.log(err));
});

const redisClient = redis.createClient({
	url: `redis://${keys.redisHost}:${keys.redisPort}`,
	retry_strategy: () => 1000,
});

(async () => {
	await redisClient.connect();
})();

redisClient.on("connect", () => {
	console.log("Connected to Redis12345");
	console.log(redisClient.isOpen);
});

redisClient.on("error", (err) => {
	console.log(err.message);
});

redisClient.on("end", () => {
	console.log("Redis connection ended ");
});

const redisPublisher = redisClient.duplicate();

app.get("/api", (req, res) => {
	res.send("Hi");
});

app.get("/api/values/all", async (req, res) => {
	const values = await pgClient.query("SELECT * FROM values");
	res.send(values.rows);
});

app.get("/api/values/current", async (req, res) => {
	const values = await redisClient.hGetAll("values");
	res.send(values);
});

app.post("/api/values", async (req, res) => {
	const index = req.body.index;
	if (parseInt(index) > 40) {
		return res.status(422).send("Index too high");
	}

	await redisClient.hSet("values", index, "Nothing yet");

	await pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

	res.send({ working: true });
});

app.listen(5000, (err) => {
	console.log("Listening 99");
});
