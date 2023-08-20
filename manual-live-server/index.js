/* eslint-disable no-undef */
const http = require("http");
const fs = require("fs");
const path = require("path");
const rootPath = process.cwd();
const os = require("os");

const server = http.createServer((req, res) => {
	const { method, url } = req;

	if (method === "GET") {
		let filePath = path.join(rootPath, url === "/" ? "/index.html" : url);
		let contentType = "text/html";

		const extname = path.extname(filePath);
		switch (extname) {
		case ".js":
			contentType = "text/javascript";
			break;
		case ".css":
			contentType = "text/css";
			break;
		case ".json":
			contentType = "application/json";
			break;
		case ".png":
			contentType = "image/png";
			break;
		case ".jpg":
			contentType = "image/jpg";
			break;
		}

		fs.readFile(filePath, "utf-8", (err, content) => {
			if (err) {
				res.writeHead(404);
				res.end("File not found");
			} else {
				res.writeHead(200, { "Content-Type": contentType });
				res.end(content);
			}
		});
	}
});

const interfaces = os.networkInterfaces();

const addresses = [];

for (const interfaceName in interfaces) {
	for (const iface of interfaces[interfaceName]) {
		if (iface.family === "IPv4" && !iface.internal) {
			addresses.push(iface.address);
		}
	}
}

const port = 8080;
const host = addresses[0];

server.listen(port, host, () => {
	console.log(
		"Server is running at",
		"\x1b[36m", `http://${host}:${port}`
	);
});