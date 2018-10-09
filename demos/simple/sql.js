
import AceEditor from "../../js/editors/ace/editor-ace.js";
import LiveEditor from "../../js/live-editor.js";

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

const liveEditorOpts = {
    editorType: "ace_sql",
    outputType: "sql",
    el: document.getElementById("sample-live-editor"),
    code: window.localStorage["test-sql-code"] || defaultCode,
    width: 400,
    height: 400,
    editorHeight: "80%",
    autoFocus: true,
    workersDir: "../../build/workers/",
    externalsDir: "../../build/external/",
    imagesDir: "../../build/images/",
    execFile: "output_sql.html"
};

const liveEditor = new LiveEditor(liveEditorOpts);

liveEditor.editor.on("change", function() {
    window.localStorage["test-sql-code"] = liveEditor.editor.text();
});