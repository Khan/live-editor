import React from "react";
import ReactDOM from "react-dom";

const AceEditor = require("../../js/editors/ace/editor-ace.js");
const LiveEditor = require("../../js/live-editor.js");
LiveEditor.registerEditor("ace_sql", AceEditor);

 const defaultCode = "/**" +
        " * Create some tables:\n" +
        " *   - students\n" +
        " *   - student_grades\n"+
        " */\n" +
        "CREATE TABLE students (id INTEGER PRIMARY KEY AUTOINCREMENT, name char, grade_year int NOT NULL);\n" +
        "CREATE TABLE student_grades (id INTEGER, grade int, FOREIGN KEY (id) REFERENCES students(id));\n\n" +
        "-- Insert some data\n" +
        "INSERT INTO students VALUES (1, \"Brian\", 3);\n" +
        "INSERT INTO students VALUES (2, \"kamil\", 4);\n" +
        "INSERT INTO student_grades VALUES (1, 95);\n" +
        "INSERT INTO student_grades VALUES (2, 100);\n\n" +
        "-- SELECT some data\n" +
        "SELECT * FROM students INNER JOIN student_grades on students.id = student_grades.id;\n" +
        "SELECT AVG(student_grades.grade) as \"Average Grade\", MAX(student_grades.grade) as \"Max Grade\" FROM students INNER JOIN student_grades on students.id = student_grades.id;\n";

const liveEditorProps = {
    editorHeight: "80%",
    editorType: "ace_sql",
    outputType: "sql",
    code: window.localStorage["test-sql-code"] || defaultCode,
    width: 400,
    height: 400,
    autoFocus: true,
    workersDir: "../../build/",
    externalsDir: "../../build/external/",
    execFile: "output_sql.html",
    imagesDir: "../../build/images/",
    onEditorUserChange: function(code) {
        window.localStorage["test-sql-code"] = code;
    }
};

ReactDOM.render(React.createElement(LiveEditor, liveEditorProps),
    document.getElementById("sample-live-editor"));