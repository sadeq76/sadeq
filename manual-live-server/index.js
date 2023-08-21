/* eslint-disable no-undef */
const http = require("http");
const fs = require("fs").promises;
const path = require("path");
const rootPath = process.cwd();
const os = require("os");

const contentTypeGenerator = function (filePath) {
	const extname = path.extname(filePath);
	switch (extname) {
	case ".js":
		return "text/javascript";
	case ".css":
		return "text/css";
	case ".json":
		return "application/json";
	case ".png":
		return "image/png";
	case ".jpg":
		return "image/jpg";
	}
};

const server = http.createServer((req, res) => {
	const { method, url } = req;

	if (method === "GET") {
		let filePath = path.join(rootPath, url === "/" ? "/index.html" : url);

		const contentType = contentTypeGenerator(filePath);

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

const clientIp = function () {
	const interfaces = os.networkInterfaces();
	const result = [];

	for (const interfaceName in interfaces) {
		for (const iface of interfaces[interfaceName]) {
			if (iface.family === "IPv4" && !iface.internal) {
				result.push(iface.address);
			}
		}
	}

	return result[0];
};

const getConfig = async function () {
	const config = JSON.parse(
		await fs.readFile(rootPath + "/server.json", "utf-8")
	);

	config.port = config.port || 8080;
	config.host = config.host || clientIp();

	return config;
};

// const watchFilesForHotReload = () => {
// 	const filesToWatch = ["/index.html"]; // Add other files as needed

// 	filesToWatch.forEach((filePath) => {
// 		const path = rootPath + filePath;
// 		fs.watchFile(path, (curr, prev) => {
// 			if (curr.mtime > prev.mtime) {
// 				console.log(`${path} changed. Reloading...`);
// 				stopServer();
// 				startServer();
// 			}
// 		});
// 	});
// };

// watchFilesForHotReload();

const startServer = () => {
	getConfig().then((response) => {
		const { port, host } = response;

		server.listen(port, host, () => {
			console.log("Server is running at", "\x1b[36m", `http://${host}:${port}`);
		});
	});
};

const stopServer = () => {
	if (server) {
		server.close(() => {
			console.log("Server stopped.");
		});
	}
};

process.on("SIGINT", () => {
	console.log(" Stopping server...");
	// console.log(" Closing watchers and stopping server...");
	// closeWatchers();
	stopServer();
	process.exit();
});

startServer();
