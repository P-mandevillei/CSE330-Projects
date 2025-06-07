# CSE330
P-mandevillei

<br>

**Why phpinfo.php cannot be rendered on the webpage; instead, the raw php file is downloaded**: PHP code needs a PHP interpreter on the server side to render it to the appropriate document type. When we serve php files in Apache, it runs the PHP interpreter and serves the rendered document to the webpage. Node.js is javascript running on Chrome's V8 engine, which does not have a PHP interpreter. Therefore, it does not know how to render the PHP code to generate other document types (eg. HTML) before serving it to the browser. That is why the raw PHP file is sent to the browser. The browser also lacks a PHP interpreter and cannot render the file, so the file gets downloaded.


<br><br>
[back](../README.md)