import m from "mithril";

export default class UploadButtonComponent {
    oninit(vnode) {
        this.main = vnode.attrs.main;
    }

	oncreate() {
        const realFileBtn = document.getElementById("real-file");
        const customBtn = document.getElementById("custom-button");
        const customTxt = document.getElementById("custom-text");

        customBtn.addEventListener("click", function(){
            realFileBtn.click();
        });
        realFileBtn.addEventListener("change", () => {
            if(realFileBtn.value){
                customTxt.innerHTML = realFileBtn.value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1]; 
                //this.doupload();
                this.readFile(realFileBtn.files[0]).then(data => {
                    this.main.dataHandler.add(realFileBtn.files[0].name, data)
                    this.main.dataHandler.timeSpan.startTime = this.main.dataHandler.timeSpan.minTime;
                    this.main.dataHandler.timeSpan.endTime = this.main.dataHandler.timeSpan.maxTime;
                    this.main.visualizer.update();
                });
                
            } else{
                customTxt.value = "No file chosen";
            }
        })
	}
    /*
    doupload(){
        let data = realFileBtn;
        let entry = realFileBtn;
        console.log('doupload',entry,data)
        fetch('uploads/' + encodeURIComponent(entry.name), {method:'PUT',body:data});
        location.reload();        
    }
    */
    readFile(file) {
        const reader = new FileReader();

        return new Promise(resolve => {
            reader.addEventListener('load', event => resolve(event.target.result));
            reader.readAsText(file);
        });
    }

    view() {
        return (
            <div class="button">
                <input type="file" id="real-file" accept=".csv" hidden="hidden"/>
                <button type = "submit" id="custom-button"> Choose a file </button>
                <span id="custom-text"> No file chosen </span>
			</div>
        );
    }
}