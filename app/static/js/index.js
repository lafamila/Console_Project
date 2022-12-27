var command = "";
var current_folder = null;
var current_screen = null;
class ExecutableFile{
    constructor(name, title, image_link, url) {
        this.name = name;
        this.title = title;
        this.image_link = image_link;
        this.url = url;
    }
    get pathname(){
        return `<font color='green'>${this.name}</font>`;
    }

    open(){
        const modal = document.getElementById("modal");
        document.getElementById("modal-title").innerText = this.title;
        document.getElementById("modal-img").src = this.image_link;
        document.getElementById("modal-link").href = this.url;
        modal.style.display = "flex";
    }
}
class TextFile{
    constructor(name, text){
        this.name = name;
        this.text = text;
        this.parent = null;
    }
    get pathname(){
        return `${this.name}`;
    }
}
class Folder{
    constructor(name, files=null) {
        this.name = name;
        this.parent = null;
        if(files !== null){
            for(let i=0;i<files.length;i++){
                files[i].parent = this;
            }
            this.files = files;
        }
        else{
            this.files = [];
        }
    }
    addFile(file){
        file.parent = this;
        this.files.push(file);
    }
    get pathname(){
        return `<font color='blue'>${this.name}</font>`;
    }
    getFiles(){
        return this.files.reduce((accumulator, currentValue) => accumulator + "\t\t" + currentValue.pathname, "..");
    }

    findFile(name){
        for(let i=0;i<this.files.length;i++){
            if(this.files[i].name == name){
                return this.files[i];
            }
        }
        return null;
    }

    getPath(){
        let path = this.name;
        let node = this;
        while(node.parent != null){
            node = node.parent;
            path = node.name + "/" + path;
        }
        return path;
    }
}
function blockspecialcharacter(e) {
    var key= document.all ? key= e.keyCode : key= e.which;
    return ((key > 64 && key < 91) || (key> 96 && key< 123) || key== 32 || (key>= 48 && key<= 57) || key == 190 || key == 192 || key == 189);
}
function newLine(){
    let path = current_folder.getPath() + "@lafamila> ";
    let html = `<pre class="console-line active">${path} <span>&nbsp;</span></pre>`;
    return html;
}
function showResult(text){
    let html = `<pre class="console-line">${text}</pre>`;
    html += newLine();
    return html;
}

function switchScreen(text){
    let sentences = text.split("\n");
    let html = '';
    for(let i=0;i<sentences.length;i++){
        html += `<pre class="console-line">${sentences[i]}</pre>`;
    }
    return html;
}
function closeModal(){
    modal.style.display = "none";
    $(".console").html(current_screen);
    current_screen = null;
    $(document).find(".active").removeClass("active");
    $(".console").append(newLine());

}
$(document).ready(function(){
    $.ajax({
        url : '/api/load_files',
        method : 'POST',
        success: function(pResult){
            var mapper = {};
            $.each(pResult, function(pIndex, pValue){
                let node = null;
                if(pValue.file_type == "Folder"){
                    node = new Folder(pValue.file_name);
                }
                else if(pValue.file_type == "TextFile"){
                    node = new TextFile(pValue.file_name, pValue.resource_uri);
                }
                else if(pValue.file_type == "ExecutableFile"){
                    node = new ExecutableFile(pValue.file_name, pValue.title, pValue.resource_uri, pValue.url);
                }
                mapper[pValue.id] = node;
            });
            $.each(pResult, function(pIndex, pValue){
                console.log(pValue);
                if(pValue.parent == null){
                    window.home = mapper[pValue.id];
                }
                else{
                    mapper[pValue.parent].addFile(mapper[pValue.id]);
                }
            });
            current_folder = window.home;
            $(document).find(".active").removeClass("active");
            $(".console").append(newLine());

        },
        error: function(){

        }
    })
    const modal = document.getElementById("modal");
    const closeBtn = modal.querySelector(".close-area");
    closeBtn.addEventListener("click", e => {
        closeModal();
    });
    modal.addEventListener("click", e => {
        const evTarget = e.target
        if(evTarget.classList.contains("modal-overlay")) {
            closeModal();

        }
    });

});
$(document).on("keydown", "body", function(e){
    if(current_screen == null){
        if(blockspecialcharacter(e)){
            command += e.key;
            let html = $(".active").html();
            $(".active").html(html.split("<span>")[0] + e.key+"<span>"+html.split("<span>")[1]);

        }
        else if(e.keyCode == 9){
            e.preventDefault();
            if(command.length == 0){
                return false;
            }
            let word = command.split(" ")[command.split(" ").length - 1];
            let files = current_folder.files;
            let examples = [];
            for(let i=0;i<files.length;i++){
                if(files[i].name.startsWith(word)){
                    examples.push(files[i].name);
                }
            }
            if(examples.length > 1){
                $(document).find(".active").removeClass("active");
                $(".console").append(showResult(examples.join("\t\t")));
                let html = $(".active").html();
                $(".active").html(html.split("<span>")[0] + command+"<span>"+html.split("<span>")[1]);

            }
            else if(examples.length == 1){
                let parts = examples[0].slice(word.length, examples[0].length);
                command += parts;
                let html = $(".active").html();
                $(".active").html(html.split("<span>")[0] + parts+"<span>"+html.split("<span>")[1]);

            }
        }
        else if(e.keyCode == 8){
            if(command.length == 0){
                return false;
            }
            command = command.slice(0, command.length-1);
            let html = $(".active").html();
            $(".active").html(html.split("<span>")[0].slice(0, html.split("<span>")[0].length-1)+"<span>"+html.split("<span>")[1]);
        }
        else if(e.keyCode == 13){
            let command_line = command;
            let query = command_line.split(" ")[0];
            if(query == "ls"){
                $(document).find(".active").removeClass("active");
                $(".console").append(showResult(current_folder.getFiles()));

            }
            else if(query == "cd"){
                let folder_name = command_line.split(" ")[1];
                if(folder_name === ".."){
                    if(current_folder.parent != null){
                        current_folder=current_folder.parent;
                    }

                    $(document).find(".active").removeClass("active");
                    $(".console").append(newLine());
                }
                else if(folder_name === "."){
                    $(document).find(".active").removeClass("active");
                    $(".console").append(newLine());

                }
                else if(folder_name === "~"){
                    current_folder=window.home;
                    $(document).find(".active").removeClass("active");
                    $(".console").append(newLine());
                }
                else{
                    let next = current_folder.findFile(folder_name);
                    if(next != null){
                        current_folder=next;
                        $(document).find(".active").removeClass("active");
                        $(".console").append(newLine());
                    }
                    else{
                        $(document).find(".active").removeClass("active");
                        $(".console").append(showResult(`No folder named '${folder_name}'`));
                    }

                }
            }
            else if(query == "mkdir"){
                let folder_name = command_line.split(" ")[1];
                current_folder.addFile(new Folder(folder_name));
            }
            else if(query == "vi"){
                let file_name = command_line.split(" ")[1];
                let target = current_folder.findFile(file_name);
                if(target != null){
                    current_screen = $(".console").html();
                    $(".console").html(switchScreen(target.text));
                }
                else{
                    $(document).find(".active").removeClass("active");
                    $(".console").append(showResult(`No file named '${folder_name}'`));
                }
            }
            else{
                let target = current_folder.findFile(query);
                if(target !== null){
                    console.log(target);
                    current_screen = $(".console").html();
                    $(".console").html(switchScreen(""));
                    target.open();
                }
                else{
                    $(document).find(".active").removeClass("active");
                    $(".console").append(newLine());

                }

            }
            command = "";
        }
        else{
            return false;
        }

    }
    else{
        if(blockspecialcharacter(e)){
            command += e.key;
        }
        else if(e.keyCode == 8){
            if(command.length == 0){
                return false;
            }
            command = command.slice(0, command.length-1);
        }
        else if(e.keyCode == 13) {
            let command_line = command;
            let query = command_line.split(" ")[0];
            if (query == "q") {
                $(".console").html(current_screen);
                current_screen = null;
                $(document).find(".active").removeClass("active");
                $(".console").append(newLine());

            }
            command = "";
        }
        else{
            return false;
        }

    }

});