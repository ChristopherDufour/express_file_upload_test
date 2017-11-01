const express = require('express')
const fileUpload = require('express-fileupload');
var fs = require('fs');
var path = require('path');
const app = express()

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(fileUpload());
const uploadsDir = __dirname  + '/uploads/';

app.get('/', function (req, res) {
	fs.readdir(uploadsDir, (err, files) => {
		res.render("index", {'files': files});
	});
});

app.use('/uploads', express.static(uploadsDir));

app.get('/*', function (req, res) {
	var filename = req.path.toString().slice(1);
   res.render("file", {
	'raw_file_name': filename,
	'file_name': decodeURIComponent(filename)
   });
})

app.post('/', function (req, res) {
	if (!req.files || !req.files.file) {
		return res.status(400).send('No files were uploaded.');
	}

	let file = req.files.file;
	var path = uploadsDir + file.name;

	fs.exists(path, function(err) {
		if (err) {
			return res.status(409).send('<a href="/'+file.name+'">File exists<a/>');
		}

		// Use the mv() method to place the file somewhere on your server
		file.mv(path, function(err) {
			if (err) {
				return res.status(500).send(err);
			}
			return res.redirect(302, '/' + file.name);
		});
	});
})

app.listen(3000, function () {
	if (!fs.existsSync(uploadsDir)){
		fs.mkdirSync(uploadsDir);
		console.log('Created directory: ' + uploadsDir)
	}
	console.log('Listening on port 3000!')
})